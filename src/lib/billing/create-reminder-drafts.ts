import {
  InvoiceStatus,
  ReminderLevel,
  ReminderStatus,
} from "@/generated/prisma/client";

import {
  dunningConfig,
  getReminderDueDate,
  getReminderEligibilityDate,
  type ConfiguredReminderLevel,
} from "@/config/dunning";

import { prisma } from "@/lib/prisma";

export type CreateReminderDraftsInput = {
  referenceDate?: Date;
};

export type CreateReminderDraftsResult = {
  referenceDate: Date;

  examinedInvoices: number;
  createdReminders: number;
  skippedInvoices: number;
  failedInvoices: number;

  created: Array<{
    reminderId: number;
    reminderNumber: string;

    invoiceId: number;
    invoiceNumber: string;

    level: ReminderLevel;
    totalOpenCents: number;
  }>;

  skipped: Array<{
    invoiceId: number;
    invoiceNumber: string;
    reason: string;
  }>;

  failed: Array<{
    invoiceId: number;
    invoiceNumber: string;
    error: string;
  }>;
};

/**
 * Prüft überfällige Rechnungen und erzeugt passende
 * Mahnungsentwürfe.
 *
 * Es wird immer höchstens die nächste Mahnstufe erzeugt:
 *
 * keine Mahnung
 * -> PAYMENT_REMINDER
 *
 * PAYMENT_REMINDER vorhanden
 * -> FIRST_REMINDER
 *
 * FIRST_REMINDER vorhanden
 * -> FINAL_REMINDER
 *
 * FINAL_REMINDER vorhanden
 * -> keine weitere automatische Stufe
 */
export async function createReminderDrafts(
  input: CreateReminderDraftsInput = {},
): Promise<CreateReminderDraftsResult> {
  const referenceDate =
    input.referenceDate ??
    new Date();

  assertValidDate(
    referenceDate,
    "Prüfzeitpunkt",
  );

  const invoices =
    await prisma.invoice.findMany({
      where: {
        status: {
          in: [
            InvoiceStatus.OVERDUE,
            InvoiceStatus.PARTIALLY_PAID,
            InvoiceStatus.ISSUED,
          ],
        },

        openCents: {
          gt: 0,
        },

        dueDate: {
          lt: referenceDate,
        },
      },

      select: {
        id: true,
        invoiceNumber: true,

        dueDate: true,
        openCents: true,

        recipientMembershipNumber:
          true,

        recipientName: true,
        recipientStreet: true,
        recipientHouseNumber: true,
        recipientPostalCode: true,
        recipientCity: true,
        recipientCountry: true,

        reminders: {
          select: {
            id: true,
            level: true,
            status: true,
          },

          orderBy: {
            createdAt: "asc",
          },
        },
      },

      orderBy: {
        dueDate: "asc",
      },
    });

  const result: CreateReminderDraftsResult = {
    referenceDate,

    examinedInvoices:
      invoices.length,

    createdReminders: 0,
    skippedInvoices: 0,
    failedInvoices: 0,

    created: [],
    skipped: [],
    failed: [],
  };

  for (const invoice of invoices) {
    try {
      const nextLevel =
        determineNextReminderLevel(
          invoice.reminders,
        );

      if (!nextLevel) {
        result.skipped.push({
          invoiceId:
            invoice.id,

          invoiceNumber:
            invoice.invoiceNumber,

          reason:
            "Für diese Rechnung wurde bereits die letzte Mahnstufe erreicht.",
        });

        result.skippedInvoices += 1;

        continue;
      }

      const eligibilityDate =
        getReminderEligibilityDate(
          invoice.dueDate,
          nextLevel,
        );

      if (
        eligibilityDate.getTime() >
        referenceDate.getTime()
      ) {
        result.skipped.push({
          invoiceId:
            invoice.id,

          invoiceNumber:
            invoice.invoiceNumber,

          reason:
            `Die Frist für „${dunningConfig.levels[nextLevel].label}“ ist noch nicht erreicht.`,
        });

        result.skippedInvoices += 1;

        continue;
      }

      const existingReminder =
        invoice.reminders.find(
          (reminder) =>
            reminder.level ===
              nextLevel &&
            reminder.status !==
              ReminderStatus.CANCELLED,
        );

      if (existingReminder) {
        result.skipped.push({
          invoiceId:
            invoice.id,

          invoiceNumber:
            invoice.invoiceNumber,

          reason:
            "Für diese Mahnstufe existiert bereits ein Entwurf oder Schreiben.",
        });

        result.skippedInvoices += 1;

        continue;
      }

      const reminder =
        await createReminderDraft({
          invoice,
          level:
            nextLevel,

          issueDate:
            referenceDate,
        });

      result.created.push({
        reminderId:
          reminder.id,

        reminderNumber:
          reminder.reminderNumber,

        invoiceId:
          invoice.id,

        invoiceNumber:
          invoice.invoiceNumber,

        level:
          reminder.level,

        totalOpenCents:
          reminder.totalOpenCents,
      });

      result.createdReminders += 1;
    } catch (error: unknown) {
      result.failed.push({
        invoiceId:
          invoice.id,

        invoiceNumber:
          invoice.invoiceNumber,

        error:
          getErrorMessage(error),
      });

      result.failedInvoices += 1;
    }
  }

  return result;
}

type ReminderInvoice = {
  id: number;
  invoiceNumber: string;

  dueDate: Date;
  openCents: number;

  recipientMembershipNumber:
    string;

  recipientName: string;
  recipientStreet: string;
  recipientHouseNumber: string;
  recipientPostalCode: string;
  recipientCity: string;
  recipientCountry: string;

  reminders: Array<{
    id: number;
    level: ReminderLevel;
    status: ReminderStatus;
  }>;
};

async function createReminderDraft({
  invoice,
  level,
  issueDate,
}: {
  invoice: ReminderInvoice;
  level: ConfiguredReminderLevel;
  issueDate: Date;
}) {
  const configuration =
    dunningConfig.levels[level];

  const reminderFeeCents =
    configuration.feeCents;

  const returnFeeCents =
    await getChargeableReturnFees(
      invoice.id,
    );

  const interestCents =
    dunningConfig
      .automaticallyApplyInterest
      ? 0
      : 0;

  const totalOpenCents =
    invoice.openCents +
    reminderFeeCents +
    returnFeeCents +
    interestCents;

  const dueAt =
    getReminderDueDate(
      issueDate,
    );

  return prisma.$transaction(
    async (transaction) => {
      const sequence =
        await transaction.reminder.count({
          where: {
            issuedAt: {
              gte: new Date(
                Date.UTC(
                  issueDate.getUTCFullYear(),
                  0,
                  1,
                ),
              ),

              lt: new Date(
                Date.UTC(
                  issueDate.getUTCFullYear() +
                    1,
                  0,
                  1,
                ),
              ),
            },
          },
        });

      const reminderNumber =
        createReminderNumber(
          issueDate.getUTCFullYear(),
          sequence + 1,
        );

      return transaction.reminder.create({
        data: {
          invoiceId:
            invoice.id,

          reminderNumber,

          level:
            toReminderLevel(level),

          status:
            ReminderStatus.DRAFT,

          issuedAt:
            issueDate,

          dueAt,

          principalCents:
            invoice.openCents,

          reminderFeeCents,
          returnFeeCents,
          interestCents,

          totalOpenCents,

          recipientMembershipNumber:
            invoice
              .recipientMembershipNumber,

          recipientName:
            invoice.recipientName,

          recipientStreet:
            invoice.recipientStreet,

          recipientHouseNumber:
            invoice
              .recipientHouseNumber,

          recipientPostalCode:
            invoice
              .recipientPostalCode,

          recipientCity:
            invoice.recipientCity,

          recipientCountry:
            invoice.recipientCountry,

          note: [
            configuration.subject,
            configuration.introduction,
            configuration.closing,
          ].join("\n\n"),
        },
      });
    },
  );
}

function determineNextReminderLevel(
  reminders: Array<{
    level: ReminderLevel;
    status: ReminderStatus;
  }>,
): ConfiguredReminderLevel | null {
  const activeLevels =
    new Set(
      reminders
        .filter(
          (reminder) =>
            reminder.status !==
            ReminderStatus.CANCELLED,
        )
        .map(
          (reminder) =>
            reminder.level,
        ),
    );

  if (
    activeLevels.has(
      ReminderLevel.FINAL_REMINDER,
    )
  ) {
    return null;
  }

  if (
    activeLevels.has(
      ReminderLevel.FIRST_REMINDER,
    )
  ) {
    return "FINAL_REMINDER";
  }

  if (
    activeLevels.has(
      ReminderLevel.PAYMENT_REMINDER,
    )
  ) {
    return "FIRST_REMINDER";
  }

  return "PAYMENT_REMINDER";
}

async function getChargeableReturnFees(
  invoiceId: number,
): Promise<number> {
  const attempts =
    await prisma.paymentAttempt.findMany({
      where: {
        invoiceId,

        status:
          "RETURNED",

        chargeableReturnFeeCents: {
          gt: 0,
        },
      },

      select: {
        chargeableReturnFeeCents:
          true,
      },
    });

  return attempts.reduce(
    (sum, attempt) =>
      sum +
      attempt
        .chargeableReturnFeeCents,
    0,
  );
}

function createReminderNumber(
  year: number,
  sequence: number,
): string {
  if (
    !Number.isInteger(year) ||
    year < 2_000 ||
    year > 9_999
  ) {
    throw new Error(
      "Das Mahnungsjahr ist ungültig.",
    );
  }

  if (
    !Number.isInteger(sequence) ||
    sequence < 1
  ) {
    throw new Error(
      "Die laufende Mahnungsnummer ist ungültig.",
    );
  }

  return [
    "HS-MA",
    year,
    sequence
      .toString()
      .padStart(5, "0"),
  ].join("-");
}

function toReminderLevel(
  level: ConfiguredReminderLevel,
): ReminderLevel {
  switch (level) {
    case "PAYMENT_REMINDER":
      return ReminderLevel.PAYMENT_REMINDER;

    case "FIRST_REMINDER":
      return ReminderLevel.FIRST_REMINDER;

    case "FINAL_REMINDER":
      return ReminderLevel.FINAL_REMINDER;
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

  return "Unbekannter Fehler bei der Erstellung des Mahnungsentwurfs.";
}