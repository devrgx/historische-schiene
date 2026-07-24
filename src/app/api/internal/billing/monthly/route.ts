import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  generateMonthlyInvoices,
} from "@/lib/billing/generate-monthly-invoices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  try {
    verifyAutomationSecret(request);

    const body =
      await readRequestBody(request);

    const now = new Date();

    const billingYear =
      body.billingYear ??
      now.getUTCFullYear();

    const billingMonth =
      body.billingMonth ??
      now.getUTCMonth() + 1;

    const result =
      await generateMonthlyInvoices({
        billingYear,
        billingMonth,
        issueDate: now,
      });

    return NextResponse.json({
      success: true,

      period: {
        year:
          result.billingYear,

        month:
          result.billingMonth,
      },

      summary: {
        examinedMembers:
          result.examinedMembers,

        createdInvoices:
          result.createdInvoices,

        skippedMembers:
          result.skippedMembers,

        failedMembers:
          result.failedMembers,

        startedAt:
          result.startedAt.toISOString(),

        finishedAt:
          result.finishedAt.toISOString(),
      },

      created:
        result.created,

      skipped:
        result.skipped,

      failed:
        result.failed,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Der Rechnungslauf ist fehlgeschlagen.";

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

type MonthlyBillingRequestBody = {
  billingYear?: number;
  billingMonth?: number;
};

async function readRequestBody(
  request: NextRequest,
): Promise<MonthlyBillingRequestBody> {
  const contentLength =
    request.headers.get(
      "content-length",
    );

  if (
    !contentLength ||
    contentLength === "0"
  ) {
    return {};
  }

  const value: unknown =
    await request.json();

  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new Error(
      "Die übermittelten Daten sind ungültig.",
    );
  }

  const body =
    value as Record<
      string,
      unknown
    >;

  const billingYear =
    body.billingYear;

  const billingMonth =
    body.billingMonth;

  if (
    billingYear !== undefined &&
    typeof billingYear !== "number"
  ) {
    throw new Error(
      "Das Beitragsjahr ist ungültig.",
    );
  }

  if (
    billingMonth !== undefined &&
    typeof billingMonth !== "number"
  ) {
    throw new Error(
      "Der Beitragsmonat ist ungültig.",
    );
  }

  return {
    billingYear,
    billingMonth,
  };
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
    providedSecret !==
      configuredSecret
  ) {
    throw new Error(
      "Der Automatisierungsschlüssel ist ungültig.",
    );
  }
}