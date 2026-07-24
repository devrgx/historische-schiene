import {
  timingSafeEqual,
} from "node:crypto";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  generateMonthlyInvoices,
} from "@/lib/billing/generate-monthly-invoices";

import {
  updateOverdueInvoices,
} from "@/lib/billing/update-overdue-invoices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Täglicher Rechnungslauf.
 *
 * Aktuell:
 *
 * - prüft überfällige Rechnungen
 * - erzeugt am Monatsersten neue Rechnungsentwürfe
 *
 * Später kommen hinzu:
 *
 * - SEPA-Einzüge
 * - Rücklastschriften
 * - Mahnungsvorschläge
 * - fehlgeschlagene E-Mails und PDFs
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  try {
    verifyAutomationSecret(
      request,
    );

    const now = new Date();

    const overdueResult =
      await updateOverdueInvoices({
        referenceDate: now,
      });

    const isFirstDayOfMonth =
      now.getDate() === 1;

    const invoiceResult =
      isFirstDayOfMonth
        ? await generateMonthlyInvoices({
            billingYear:
              now.getFullYear(),

            billingMonth:
              now.getMonth() + 1,

            issueDate: now,
          })
        : null;

    return NextResponse.json({
      success: true,

      executedAt:
        now.toISOString(),

      overdueInvoices: {
        examined:
          overdueResult
            .examinedInvoices,

        markedOverdue:
          overdueResult
            .markedOverdue,

        invoiceIds:
          overdueResult.invoiceIds,
      },

      monthlyInvoiceGeneration:
        invoiceResult
          ? {
              executed: true,

              billingYear:
                invoiceResult
                  .billingYear,

              billingMonth:
                invoiceResult
                  .billingMonth,

              examinedMembers:
                invoiceResult
                  .examinedMembers,

              createdInvoices:
                invoiceResult
                  .createdInvoices,

              skippedMembers:
                invoiceResult
                  .skippedMembers,

              failedMembers:
                invoiceResult
                  .failedMembers,

              failures:
                invoiceResult.failed,
            }
          : {
              executed: false,

              reason:
                "Heute ist nicht der erste Tag des Monats.",
            },
    });
  } catch (error: unknown) {
    console.error(
      "Der tägliche Rechnungslauf ist fehlgeschlagen:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Der tägliche Rechnungslauf ist fehlgeschlagen.";

    const status =
      message ===
      "Der Automatisierungsschlüssel ist ungültig."
        ? 401
        : 500;

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status,
      },
    );
  }
}

function verifyAutomationSecret(
  request: NextRequest,
): void {
  const configuredSecret =
    process.env
      .BILLING_AUTOMATION_SECRET
      ?.trim();

  if (!configuredSecret) {
    throw new Error(
      "BILLING_AUTOMATION_SECRET ist nicht konfiguriert.",
    );
  }

  const authorization =
    request.headers.get(
      "authorization",
    );

  const providedSecret =
    authorization?.startsWith(
      "Bearer ",
    )
      ? authorization
          .slice(7)
          .trim()
      : "";

  if (
    !providedSecret ||
    !secureStringEquals(
      providedSecret,
      configuredSecret,
    )
  ) {
    throw new Error(
      "Der Automatisierungsschlüssel ist ungültig.",
    );
  }
}

/**
 * Vergleicht die Schlüssel ohne frühzeitigen Abbruch.
 */
function secureStringEquals(
  firstValue: string,
  secondValue: string,
): boolean {
  const firstBuffer =
    Buffer.from(
      firstValue,
      "utf8",
    );

  const secondBuffer =
    Buffer.from(
      secondValue,
      "utf8",
    );

  if (
    firstBuffer.length !==
    secondBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    firstBuffer,
    secondBuffer,
  );
}