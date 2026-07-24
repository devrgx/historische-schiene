import {
  InvoiceItemType,
  InvoiceStatus,
  MemberStatus,
  Prisma,
} from "@/generated/prisma/client";

import {
  createInvoiceNumber,
  getInvoiceDueDate,
  getInvoiceIssuerName,
  invoiceConfig,
} from "@/config/invoicing";

import { getMembershipFeeSchedule } from "@/config/membership-fees";

import { buildMembershipCharge } from "@/lib/billing/membership-charge";

import { prisma } from "@/lib/prisma";

export type CreateMembershipInvoiceInput = {
  memberId: number;
  billingYear: number;
  billingMonth: number;

  /**
   * Ausstellungsdatum der Rechnung.
   *
   * Standardmäßig wird der aktuelle Zeitpunkt verwendet.
   */
  issueDate?: Date;
};

export type CreateMembershipInvoiceResult = {
  invoiceId: number;
  invoiceNumber: string;

  membershipChargeId: number;

  totalCents: number;
  monthlyAmountCents: number;
  admissionFeeCents: number;

  billingYear: number;
  billingMonth: number;
};

/**
 * Erstellt eine monatliche Beitragsrechnung.
 *
 * Folgende Datensätze werden gemeinsam in einer Transaktion
 * angelegt:
 *
 * - Rechnung
 * - Rechnungspositionen
 * - monatliche Beitragsforderung
 *
 * Existiert für das Mitglied und den Monat bereits eine
 * Beitragsforderung, wird keine zweite Rechnung erzeugt.
 */
export async function createMembershipInvoice(
  input: CreateMembershipInvoiceInput,
): Promise<CreateMembershipInvoiceResult> {
  assertValidInput(input);

  const issueDate = input.issueDate ?? new Date();

  assertValidDate(issueDate, "Ausstellungsdatum");

  const member = await prisma.member.findUnique({
    where: {
      id: input.memberId,
    },

    select: {
      id: true,
      membershipNumber: true,
      membershipType: true,
      status: true,

      firstName: true,
      lastName: true,

      street: true,
      houseNumber: true,
      postalCode: true,
      city: true,
      country: true,

      joinedAt: true,
      leftAt: true,

      billingProfile: {
        select: {
          monthlyFeeOverrideCents: true,
          admissionFeeOverrideCents: true,
          admissionFeeChargedAt: true,
          contributionExemptUntil: true,
        },
      },
    },
  });

  if (!member) {
    throw new Error("Das ausgewählte Mitglied wurde nicht gefunden.");
  }

  if (member.status !== MemberStatus.ACTIVE) {
    throw new Error(
      "Für inaktive Mitglieder können keine Beitragsrechnungen erstellt werden.",
    );
  }

  if (!member.joinedAt) {
    throw new Error("Beim Mitglied ist noch kein Eintrittsdatum hinterlegt.");
  }

  const existingCharge = await prisma.membershipCharge.findUnique({
    where: {
      memberId_billingYear_billingMonth: {
        memberId: member.id,
        billingYear: input.billingYear,
        billingMonth: input.billingMonth,
      },
    },

    select: {
      id: true,
      invoiceId: true,
    },
  });

  if (existingCharge) {
    if (existingCharge.invoiceId) {
      throw new Error(
        "Für dieses Mitglied und diesen Beitragsmonat existiert bereits eine Rechnung.",
      );
    }

    throw new Error(
      "Für dieses Mitglied und diesen Beitragsmonat existiert bereits eine Beitragsforderung.",
    );
  }

  const chargeResult = buildMembershipCharge(
    {
      memberId: member.id,

      membershipNumber: member.membershipNumber,

      membershipType: member.membershipType,

      joinedAt: member.joinedAt,
      leftAt: member.leftAt,

      billingProfile: member.billingProfile,
    },

    input.billingYear,
    input.billingMonth,
  );

  if (!chargeResult.chargeable) {
    throw new Error(getNotChargeableMessage(chargeResult.reason));
  }

  const charge = chargeResult.charge;

  const feeSchedule = getMembershipFeeSchedule(input.billingYear);

  const dueDate = getInvoiceDueDate(issueDate);

  const recipientName = [member.firstName, member.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (!recipientName) {
    throw new Error(
      "Für die Rechnung konnte kein Empfängername ermittelt werden.",
    );
  }

  return createInvoiceWithRetry({
    member: {
      id: member.id,

      membershipNumber: member.membershipNumber,

      recipientName,

      street: member.street,
      houseNumber: member.houseNumber,

      postalCode: member.postalCode,

      city: member.city,
      country: member.country,
    },

    charge,

    issueDate,
    dueDate,

    resolutionNote: feeSchedule.resolution.note,
  });
}

type CreateInvoiceTransactionInput = {
  member: {
    id: number;
    membershipNumber: string;
    recipientName: string;

    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    country: string;
  };

  charge: {
    memberId: number;

    billingYear: number;
    billingMonth: number;

    membershipType: Prisma.MembershipChargeCreateInput["membershipType"];

    membershipLabel: string;

    monthlyAmountCents: number;
    admissionFeeCents: number;
    totalAmountCents: number;

    items: Array<{
      type: "MEMBERSHIP_FEE" | "ADMISSION_FEE";

      description: string;
      quantity: number;
      unitAmountCents: number;
      totalAmountCents: number;
    }>;
  };

  issueDate: Date;
  dueDate: Date;

  resolutionNote: string | null;
};

/**
 * Bei zwei nahezu gleichzeitigen Rechnungserstellungen könnte
 * dieselbe laufende Nummer berechnet werden.
 *
 * Der Unique-Index auf invoiceNumber verhindert doppelte
 * Nummern. In diesem seltenen Fall wird die Erzeugung mit einer
 * neu berechneten Nummer wiederholt.
 */
async function createInvoiceWithRetry(
  input: CreateInvoiceTransactionInput,
): Promise<CreateMembershipInvoiceResult> {
  const maximumAttempts = 3;

  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    try {
      return await prisma.$transaction(async (transaction) => {
        const sequenceNumber = await getNextInvoiceSequence(
          transaction,
          input.charge.billingYear,
        );

        const invoiceNumber = createInvoiceNumber(
          input.charge.billingYear,
          sequenceNumber,
        );

        const invoice = await transaction.invoice.create({
          data: {
            invoiceNumber,

            memberId: input.member.id,

            status: InvoiceStatus.DRAFT,

            billingYear: input.charge.billingYear,

            billingMonth: input.charge.billingMonth,

            issueDate: input.issueDate,

            dueDate: input.dueDate,

            currency: invoiceConfig.payment.defaultCurrency,

            subtotalCents: input.charge.totalAmountCents,

            totalCents: input.charge.totalAmountCents,

            paidCents: 0,

            openCents: input.charge.totalAmountCents,

            recipientMembershipNumber: input.member.membershipNumber,

            recipientName: input.member.recipientName,

            recipientStreet: input.member.street,

            recipientHouseNumber: input.member.houseNumber,

            recipientPostalCode: input.member.postalCode,

            recipientCity: input.member.city,

            recipientCountry: input.member.country,

            issuerName: getInvoiceIssuerName(),

            issuerStreet: invoiceConfig.issuer.street,

            issuerHouseNumber: invoiceConfig.issuer.houseNumber,

            issuerPostalCode: invoiceConfig.issuer.postalCode,

            issuerCity: invoiceConfig.issuer.city,

            issuerCountry: invoiceConfig.issuer.country,

            issuerEmail: invoiceConfig.issuer.email,

            issuerPhone: invoiceConfig.issuer.phone,

            issuerWebsite: invoiceConfig.issuer.website,

            issuerAccountHolder: invoiceConfig.bankAccount.accountHolder,

            issuerIban: invoiceConfig.bankAccount.iban,

            issuerBic: invoiceConfig.bankAccount.bic,

            issuerBankName: invoiceConfig.bankAccount.bankName,

            contributionResolutionNote: input.resolutionNote,

            items: {
              create: input.charge.items.map((item, index) => ({
                position: index + 1,

                type: getInvoiceItemType(item.type),

                description: item.description,

                quantity: item.quantity,

                unitAmountCents: item.unitAmountCents,

                totalAmountCents: item.totalAmountCents,
              })),
            },
          },

          select: {
            id: true,
            invoiceNumber: true,
          },
        });

        const membershipCharge = await transaction.membershipCharge.create({
          data: {
            memberId: input.member.id,

            billingYear: input.charge.billingYear,

            billingMonth: input.charge.billingMonth,

            membershipType: input.charge.membershipType,

            membershipLabel: input.charge.membershipLabel,

            monthlyAmountCents: input.charge.monthlyAmountCents,

            admissionFeeCents: input.charge.admissionFeeCents,

            totalAmountCents: input.charge.totalAmountCents,

            invoiceId: invoice.id,
          },

          select: {
            id: true,
          },
        });

        return {
          invoiceId: invoice.id,

          invoiceNumber: invoice.invoiceNumber,

          membershipChargeId: membershipCharge.id,

          totalCents: input.charge.totalAmountCents,

          monthlyAmountCents: input.charge.monthlyAmountCents,

          admissionFeeCents: input.charge.admissionFeeCents,

          billingYear: input.charge.billingYear,

          billingMonth: input.charge.billingMonth,
        };
      });
    } catch (error: unknown) {
      const isUniqueCollision = isPrismaUniqueConstraintError(error);

      if (!isUniqueCollision || attempt === maximumAttempts) {
        throw error;
      }
    }
  }

  throw new Error("Die Rechnungsnummer konnte nicht erzeugt werden.");
}

async function getNextInvoiceSequence(
  transaction: Prisma.TransactionClient,
  billingYear: number,
): Promise<number> {
  if (
    !Number.isInteger(billingYear) ||
    billingYear < 2_000 ||
    billingYear > 9_999
  ) {
    throw new Error(`Das Rechnungsjahr ${billingYear} ist ungültig.`);
  }

  const sequence = await transaction.invoiceSequence.upsert({
    where: {
      year: billingYear,
    },

    create: {
      year: billingYear,
      currentValue: 1,
    },

    update: {
      currentValue: {
        increment: 1,
      },
    },

    select: {
      currentValue: true,
    },
  });

  return sequence.currentValue;
}

function getInvoiceItemType(
  type: "MEMBERSHIP_FEE" | "ADMISSION_FEE",
): InvoiceItemType {
  switch (type) {
    case "MEMBERSHIP_FEE":
      return InvoiceItemType.MEMBERSHIP_FEE;

    case "ADMISSION_FEE":
      return InvoiceItemType.ADMISSION_FEE;
  }
}

function getNotChargeableMessage(
  reason:
    | "NOT_JOINED_YET"
    | "MEMBERSHIP_ENDED"
    | "CONTRIBUTION_EXEMPT"
    | "FREE_MEMBERSHIP",
): string {
  switch (reason) {
    case "NOT_JOINED_YET":
      return "Das Mitglied ist in diesem Beitragsmonat noch nicht eingetreten.";

    case "MEMBERSHIP_ENDED":
      return "Die Mitgliedschaft bestand in diesem Beitragsmonat nicht mehr.";

    case "CONTRIBUTION_EXEMPT":
      return "Das Mitglied ist in diesem Beitragsmonat von der Beitragspflicht befreit.";

    case "FREE_MEMBERSHIP":
      return "Für diese Mitgliedschaftsart wird kein Mitgliedsbeitrag berechnet.";
  }
}

function assertValidInput(input: CreateMembershipInvoiceInput): void {
  if (!Number.isInteger(input.memberId) || input.memberId < 1) {
    throw new Error("Die Mitglieds-ID ist ungültig.");
  }

  if (
    !Number.isInteger(input.billingYear) ||
    input.billingYear < 2_000 ||
    input.billingYear > 9_999
  ) {
    throw new Error("Das Beitragsjahr ist ungültig.");
  }

  if (
    !Number.isInteger(input.billingMonth) ||
    input.billingMonth < 1 ||
    input.billingMonth > 12
  ) {
    throw new Error("Der Beitragsmonat ist ungültig.");
  }
}

function assertValidDate(date: Date, fieldName: string): void {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} ist ungültig.`);
  }
}

function isPrismaUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}
