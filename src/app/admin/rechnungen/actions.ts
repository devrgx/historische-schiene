"use server";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { generateMonthlyInvoices } from "@/lib/billing/generate-monthly-invoices";

export async function generateMonthlyInvoicesAction(
  formData: FormData,
): Promise<never> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/portal/login");
  }

  if (!currentUser.roleKeys.includes("ADMIN")) {
    redirect("/portal/app");
  }

  const billingYear = parseIntegerFormValue(formData.get("billingYear"));

  const billingMonth = parseIntegerFormValue(formData.get("billingMonth"));

  const basePath = createInvoiceListPath(billingYear, billingMonth);

  try {
    assertValidBillingPeriod(billingYear, billingMonth);

    const result = await generateMonthlyInvoices({
      billingYear,
      billingMonth,
      issueDate: new Date(),
    });

    const parameters = new URLSearchParams({
      year: billingYear.toString(),

      month: billingMonth.toString(),

      success: "Der Rechnungslauf wurde abgeschlossen.",

      examined: result.examinedMembers.toString(),

      created: result.createdInvoices.toString(),

      skipped: result.skippedMembers.toString(),

      failed: result.failedMembers.toString(),
    });

    redirect(`/admin/rechnungen?${parameters.toString()}`);
  } catch (error: unknown) {
    console.error("Fehler beim manuellen Rechnungslauf:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Der Rechnungslauf konnte nicht durchgeführt werden.";

    const parameters = new URLSearchParams({
      year: Number.isInteger(billingYear) ? billingYear.toString() : "",

      month: Number.isInteger(billingMonth) ? billingMonth.toString() : "",

      error: message,
    });

    redirect(`/admin/rechnungen?${parameters.toString()}`);

    redirect(`${basePath}&${parameters.toString()}`);
  }
}

function createInvoiceListPath(year: number, month: number): string {
  const parameters = new URLSearchParams({
    year: Number.isInteger(year) ? year.toString() : "",

    month: Number.isInteger(month) ? month.toString() : "",
  });

  return `/admin/rechnungen?${parameters.toString()}`;
}

function parseIntegerFormValue(value: FormDataEntryValue | null): number {
  if (typeof value !== "string" || value.trim() === "") {
    return Number.NaN;
  }

  return Number.parseInt(value, 10);
}

function assertValidBillingPeriod(year: number, month: number): void {
  if (!Number.isInteger(year) || year < 2_000 || year > 9_999) {
    throw new Error("Das ausgewählte Beitragsjahr ist ungültig.");
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Der ausgewählte Beitragsmonat ist ungültig.");
  }
}
