import {
  MemberStatus,
} from "@/generated/prisma/client";

import {
  createMembershipInvoice,
} from "@/lib/billing/create-membership-invoice";

import { prisma } from "@/lib/prisma";

export type MonthlyInvoiceGenerationResult = {
  billingYear: number;
  billingMonth: number;

  startedAt: Date;
  finishedAt: Date;

  examinedMembers: number;
  createdInvoices: number;
  skippedMembers: number;
  failedMembers: number;

  created: Array<{
    memberId: number;
    membershipNumber: string;
    invoiceId: number;
    invoiceNumber: string;
    totalCents: number;
  }>;

  skipped: Array<{
    memberId: number;
    membershipNumber: string;
    reason: string;
  }>;

  failed: Array<{
    memberId: number;
    membershipNumber: string;
    error: string;
  }>;
};

export type GenerateMonthlyInvoicesInput = {
  billingYear: number;
  billingMonth: number;

  /**
   * Ausstellungsdatum für alle erzeugten Rechnungen.
   * Standardmäßig wird der aktuelle Zeitpunkt verwendet.
   */
  issueDate?: Date;
};

/**
 * Erzeugt Beitragsrechnungen für alle aktiven Mitglieder
 * eines bestimmten Kalendermonats.
 *
 * Bereits vorhandene Forderungen oder Rechnungen werden
 * übersprungen. Fehler bei einzelnen Mitgliedern verhindern
 * nicht die Verarbeitung der übrigen Mitglieder.
 */
export async function generateMonthlyInvoices(
  input: GenerateMonthlyInvoicesInput,
): Promise<MonthlyInvoiceGenerationResult> {
  assertValidInput(input);

  const startedAt = new Date();
  const issueDate =
    input.issueDate ?? startedAt;

  assertValidDate(
    issueDate,
    "Ausstellungsdatum",
  );

  const periodStart =
    createPeriodStart(
      input.billingYear,
      input.billingMonth,
    );

  const periodEnd =
    createPeriodEnd(
      input.billingYear,
      input.billingMonth,
    );

  const members =
    await prisma.member.findMany({
      where: {
        status: MemberStatus.ACTIVE,

        joinedAt: {
          not: null,
          lte: periodEnd,
        },

        OR: [
          {
            leftAt: null,
          },
          {
            leftAt: {
              gt: periodStart,
            },
          },
        ],
      },

      select: {
        id: true,
        membershipNumber: true,
      },

      orderBy: [
        {
          membershipNumber: "asc",
        },
        {
          id: "asc",
        },
      ],
    });

  const result: MonthlyInvoiceGenerationResult = {
    billingYear:
      input.billingYear,

    billingMonth:
      input.billingMonth,

    startedAt,
    finishedAt: startedAt,

    examinedMembers:
      members.length,

    createdInvoices: 0,
    skippedMembers: 0,
    failedMembers: 0,

    created: [],
    skipped: [],
    failed: [],
  };

  for (const member of members) {
    try {
      const invoice =
        await createMembershipInvoice({
          memberId: member.id,

          billingYear:
            input.billingYear,

          billingMonth:
            input.billingMonth,

          issueDate,
        });

      result.created.push({
        memberId: member.id,

        membershipNumber:
          member.membershipNumber,

        invoiceId:
          invoice.invoiceId,

        invoiceNumber:
          invoice.invoiceNumber,

        totalCents:
          invoice.totalCents,
      });

      result.createdInvoices += 1;
    } catch (error: unknown) {
      const message =
        getErrorMessage(error);

      if (isSkippableError(message)) {
        result.skipped.push({
          memberId: member.id,

          membershipNumber:
            member.membershipNumber,

          reason: message,
        });

        result.skippedMembers += 1;

        continue;
      }

      result.failed.push({
        memberId: member.id,

        membershipNumber:
          member.membershipNumber,

        error: message,
      });

      result.failedMembers += 1;
    }
  }

  result.finishedAt = new Date();

  return result;
}

function isSkippableError(
  message: string,
): boolean {
  return (
    message.includes(
      "existiert bereits eine Rechnung",
    ) ||
    message.includes(
      "existiert bereits eine Beitragsforderung",
    ) ||
    message.includes(
      "noch nicht eingetreten",
    ) ||
    message.includes(
      "bestand in diesem Beitragsmonat nicht mehr",
    ) ||
    message.includes(
      "von der Beitragspflicht befreit",
    ) ||
    message.includes(
      "kein Mitgliedsbeitrag berechnet",
    )
  );
}

function createPeriodStart(
  year: number,
  month: number,
): Date {
  return new Date(
    Date.UTC(
      year,
      month - 1,
      1,
      0,
      0,
      0,
      0,
    ),
  );
}

function createPeriodEnd(
  year: number,
  month: number,
): Date {
  return new Date(
    Date.UTC(
      year,
      month,
      0,
      23,
      59,
      59,
      999,
    ),
  );
}

function assertValidInput(
  input: GenerateMonthlyInvoicesInput,
): void {
  if (
    !Number.isInteger(
      input.billingYear,
    ) ||
    input.billingYear < 2_000 ||
    input.billingYear > 9_999
  ) {
    throw new Error(
      "Das Beitragsjahr ist ungültig.",
    );
  }

  if (
    !Number.isInteger(
      input.billingMonth,
    ) ||
    input.billingMonth < 1 ||
    input.billingMonth > 12
  ) {
    throw new Error(
      "Der Beitragsmonat ist ungültig.",
    );
  }
}

function assertValidDate(
  date: Date,
  fieldName: string,
): void {
  if (
    !(date instanceof Date) ||
    Number.isNaN(date.getTime())
  ) {
    throw new Error(
      `${fieldName} ist ungültig.`,
    );
  }
}

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unbekannter Fehler bei der Rechnungserstellung.";
}