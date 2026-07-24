import {
  InvoiceStatus,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

export type UpdateOverdueInvoicesInput = {
  /**
   * Zeitpunkt, gegen den die Fälligkeit geprüft wird.
   *
   * Standardmäßig wird der aktuelle Zeitpunkt verwendet.
   */
  referenceDate?: Date;
};

export type UpdateOverdueInvoicesResult = {
  referenceDate: Date;

  examinedInvoices: number;
  markedOverdue: number;

  invoiceIds: number[];
};

/**
 * Markiert offene Rechnungen als überfällig, wenn ihr
 * Fälligkeitsdatum vor dem Prüfzeitpunkt liegt.
 *
 * Berücksichtigt werden nur:
 *
 * - ausgestellte Rechnungen
 * - teilweise bezahlte Rechnungen
 * - Rechnungen mit offenem Betrag
 *
 * Entwürfe, bezahlte und stornierte Rechnungen werden nicht
 * verändert.
 */
export async function updateOverdueInvoices(
  input: UpdateOverdueInvoicesInput = {},
): Promise<UpdateOverdueInvoicesResult> {
  const referenceDate =
    input.referenceDate ?? new Date();

  assertValidDate(
    referenceDate,
    "Prüfzeitpunkt",
  );

  const overdueCandidates =
    await prisma.invoice.findMany({
      where: {
        status: {
          in: [
            InvoiceStatus.ISSUED,
            InvoiceStatus.PARTIALLY_PAID,
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
      },

      orderBy: {
        dueDate: "asc",
      },
    });

  if (
    overdueCandidates.length === 0
  ) {
    return {
      referenceDate,
      examinedInvoices: 0,
      markedOverdue: 0,
      invoiceIds: [],
    };
  }

  const invoiceIds =
    overdueCandidates.map(
      (invoice) => invoice.id,
    );

  const updateResult =
    await prisma.invoice.updateMany({
      where: {
        id: {
          in: invoiceIds,
        },

        status: {
          in: [
            InvoiceStatus.ISSUED,
            InvoiceStatus.PARTIALLY_PAID,
          ],
        },

        openCents: {
          gt: 0,
        },

        dueDate: {
          lt: referenceDate,
        },
      },

      data: {
        status:
          InvoiceStatus.OVERDUE,
      },
    });

  return {
    referenceDate,

    examinedInvoices:
      overdueCandidates.length,

    markedOverdue:
      updateResult.count,

    invoiceIds,
  };
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