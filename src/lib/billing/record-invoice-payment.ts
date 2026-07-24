import {
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

export type RecordInvoicePaymentInput = {
  invoiceId: number;
  amountCents: number;
  method: PaymentMethod;
  paidAt: Date;

  reference?: string | null;
  note?: string | null;

  recordedByUserId?: number | null;
  recordedByName?: string | null;
};

export type RecordInvoicePaymentResult = {
  paymentId: number;
  invoiceId: number;

  amountCents: number;
  paidCents: number;
  openCents: number;

  invoiceStatus: InvoiceStatus;
};

/**
 * Erfasst einen tatsächlichen Zahlungseingang und aktualisiert
 * anschließend den Zahlungsstand der zugehörigen Rechnung.
 *
 * Die Zahlung und die Aktualisierung der Rechnung erfolgen
 * gemeinsam in einer Datenbanktransaktion.
 */
export async function recordInvoicePayment(
  input: RecordInvoicePaymentInput,
): Promise<RecordInvoicePaymentResult> {
  validateInput(input);

  return prisma.$transaction(
    async (transaction) => {
      const invoice =
        await transaction.invoice.findUnique({
          where: {
            id: input.invoiceId,
          },

          select: {
            id: true,
            status: true,
            totalCents: true,
            dueDate: true,

            payments: {
              where: {
                status:
                  PaymentStatus.COMPLETED,
              },

              select: {
                amountCents: true,
              },
            },
          },
        });

      if (!invoice) {
        throw new Error(
          "Die Rechnung wurde nicht gefunden.",
        );
      }

      if (
        invoice.status ===
        InvoiceStatus.DRAFT
      ) {
        throw new Error(
          "Für einen Rechnungsentwurf kann noch keine Zahlung erfasst werden.",
        );
      }

      if (
        invoice.status ===
        InvoiceStatus.CANCELLED
      ) {
        throw new Error(
          "Für eine stornierte Rechnung kann keine Zahlung erfasst werden.",
        );
      }

      const previouslyPaidCents =
        invoice.payments.reduce(
          (sum, payment) =>
            sum +
            payment.amountCents,
          0,
        );

      const currentOpenCents =
        Math.max(
          invoice.totalCents -
            previouslyPaidCents,
          0,
        );

      if (currentOpenCents === 0) {
        throw new Error(
          "Die Rechnung ist bereits vollständig bezahlt.",
        );
      }

      if (
        input.amountCents >
        currentOpenCents
      ) {
        throw new Error(
          `Der Zahlungsbetrag ist höher als der noch offene Rechnungsbetrag von ${formatEuroAmount(
            currentOpenCents,
          )}.`,
        );
      }

      const payment =
        await transaction.payment.create({
          data: {
            invoiceId:
              invoice.id,

            amountCents:
              input.amountCents,

            method:
              input.method,

            status:
              PaymentStatus.COMPLETED,

            paidAt:
              input.paidAt,

            reference:
              normalizeOptionalText(
                input.reference,
              ),

            note:
              normalizeOptionalText(
                input.note,
              ),

            recordedByUserId:
              input.recordedByUserId ??
              null,

            recordedByName:
              normalizeOptionalText(
                input.recordedByName,
              ),
          },

          select: {
            id: true,
          },
        });

      const paidCents =
        previouslyPaidCents +
        input.amountCents;

      const openCents =
        Math.max(
          invoice.totalCents -
            paidCents,
          0,
        );

      const invoiceStatus =
        determineInvoiceStatus({
          paidCents,
          openCents,
          dueDate:
            invoice.dueDate,
          now: new Date(),
        });

      await transaction.invoice.update({
        where: {
          id: invoice.id,
        },

        data: {
          paidCents,
          openCents,
          status:
            invoiceStatus,
        },
      });

      return {
        paymentId:
          payment.id,

        invoiceId:
          invoice.id,

        amountCents:
          input.amountCents,

        paidCents,
        openCents,

        invoiceStatus,
      };
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel
          .Serializable,
    },
  );
}

type DetermineInvoiceStatusInput = {
  paidCents: number;
  openCents: number;
  dueDate: Date;
  now: Date;
};

function determineInvoiceStatus({
  paidCents,
  openCents,
  dueDate,
  now,
}: DetermineInvoiceStatusInput): InvoiceStatus {
  if (openCents === 0) {
    return InvoiceStatus.PAID;
  }

  if (
    dueDate.getTime() <
    now.getTime()
  ) {
    return InvoiceStatus.OVERDUE;
  }

  if (paidCents > 0) {
    return InvoiceStatus.PARTIALLY_PAID;
  }

  return InvoiceStatus.ISSUED;
}

function validateInput(
  input: RecordInvoicePaymentInput,
): void {
  if (
    !Number.isInteger(
      input.invoiceId,
    ) ||
    input.invoiceId < 1
  ) {
    throw new Error(
      "Die Rechnungs-ID ist ungültig.",
    );
  }

  if (
    !Number.isSafeInteger(
      input.amountCents,
    ) ||
    input.amountCents < 1
  ) {
    throw new Error(
      "Der Zahlungsbetrag muss mindestens 0,01 € betragen.",
    );
  }

  if (
    !(input.paidAt instanceof Date) ||
    Number.isNaN(
      input.paidAt.getTime(),
    )
  ) {
    throw new Error(
      "Das Zahlungsdatum ist ungültig.",
    );
  }

  if (
    !Object.values(
      PaymentMethod,
    ).includes(input.method)
  ) {
    throw new Error(
      "Die Zahlungsart ist ungültig.",
    );
  }

  if (
    input.recordedByUserId !==
      undefined &&
    input.recordedByUserId !==
      null &&
    (!Number.isInteger(
      input.recordedByUserId,
    ) ||
      input.recordedByUserId < 1)
  ) {
    throw new Error(
      "Der erfassende Benutzer ist ungültig.",
    );
  }
}

function normalizeOptionalText(
  value:
    | string
    | null
    | undefined,
): string | null {
  const normalized =
    value?.trim() ?? "";

  return normalized
    ? normalized
    : null;
}

function formatEuroAmount(
  amountCents: number,
): string {
  return new Intl.NumberFormat(
    "de-DE",
    {
      style: "currency",
      currency: "EUR",
    },
  ).format(
    amountCents / 100,
  );
}