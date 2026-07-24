"use server";

import {
  revalidatePath,
} from "next/cache";
import { redirect } from "next/navigation";

import {
  PaymentMethod,
} from "@/generated/prisma/client";

import { getCurrentUser } from "@/lib/auth";
import {
  recordInvoicePayment,
} from "@/lib/billing/record-invoice-payment";

export async function recordInvoicePaymentAction(
  formData: FormData,
): Promise<never> {
  const currentUser =
    await getCurrentUser();

  if (!currentUser) {
    redirect("/portal/login");
  }

  if (
    !currentUser.roleKeys.includes(
      "ADMIN",
    )
  ) {
    redirect("/portal/app");
  }

  const invoiceId =
    parsePositiveInteger(
      formData.get("invoiceId"),
    );

  if (!invoiceId) {
    redirect(
      "/admin/rechnungen?error=Die+Rechnungs-ID+ist+ungültig.",
    );
  }

  try {
    const amountCents =
      parseEuroAmountToCents(
        formData.get("amount"),
      );

    const paymentMethod =
      parsePaymentMethod(
        formData.get(
          "paymentMethod",
        ),
      );

    const paidAt =
      parseDateInput(
        formData.get("paidAt"),
      );

    const reference =
      parseOptionalString(
        formData.get("reference"),
      );

    const note =
      parseOptionalString(
        formData.get("note"),
      );

    const result =
      await recordInvoicePayment({
        invoiceId,
        amountCents,
        method:
          paymentMethod,
        paidAt,
        reference,
        note,

        recordedByUserId:
          currentUser.id,

        recordedByName:
          currentUser.displayName,
      });

    revalidatePath(
      `/admin/rechnungen/${invoiceId}`,
    );

    revalidatePath(
      "/admin/rechnungen",
    );

    revalidatePath("/admin");

    redirect(
      `/admin/rechnungen/${invoiceId}?success=${encodeURIComponent(
        `Die Zahlung über ${formatEuroAmount(
          result.amountCents,
        )} wurde erfolgreich erfasst.`,
      )}`,
    );
  } catch (error: unknown) {
    console.error(
      "Zahlung konnte nicht erfasst werden:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Die Zahlung konnte nicht erfasst werden.";

    redirect(
      `/admin/rechnungen/${invoiceId}?error=${encodeURIComponent(
        message,
      )}`,
    );
  }
}

function parsePositiveInteger(
  value: FormDataEntryValue | null,
): number | null {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    return null;
  }

  const parsed =
    Number.parseInt(
      value,
      10,
    );

  if (
    !Number.isInteger(parsed) ||
    parsed < 1
  ) {
    return null;
  }

  return parsed;
}

function parseEuroAmountToCents(
  value: FormDataEntryValue | null,
): number {
  if (
    typeof value !== "string"
  ) {
    throw new Error(
      "Bitte gib einen Zahlungsbetrag ein.",
    );
  }

  const normalized =
    value
      .trim()
      .replace(/\s/g, "")
      .replace(",", ".");

  if (
    !/^\d+(\.\d{1,2})?$/.test(
      normalized,
    )
  ) {
    throw new Error(
      "Bitte gib einen gültigen Betrag mit höchstens zwei Nachkommastellen ein.",
    );
  }

  const amount =
    Number.parseFloat(
      normalized,
    );

  const amountCents =
    Math.round(
      amount * 100,
    );

  if (
    !Number.isSafeInteger(
      amountCents,
    ) ||
    amountCents < 1
  ) {
    throw new Error(
      "Der Zahlungsbetrag muss mindestens 0,01 € betragen.",
    );
  }

  return amountCents;
}

function parsePaymentMethod(
  value: FormDataEntryValue | null,
): PaymentMethod {
  if (
    typeof value !== "string"
  ) {
    throw new Error(
      "Bitte wähle eine Zahlungsart aus.",
    );
  }

  if (
    !Object.values(
      PaymentMethod,
    ).includes(
      value as PaymentMethod,
    )
  ) {
    throw new Error(
      "Die ausgewählte Zahlungsart ist ungültig.",
    );
  }

  return value as PaymentMethod;
}

function parseDateInput(
  value: FormDataEntryValue | null,
): Date {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    throw new Error(
      "Bitte gib das Zahlungsdatum an.",
    );
  }

  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      value.trim(),
    );

  if (!match) {
    throw new Error(
      "Das Zahlungsdatum ist ungültig.",
    );
  }

  const year =
    Number.parseInt(
      match[1],
      10,
    );

  const month =
    Number.parseInt(
      match[2],
      10,
    );

  const day =
    Number.parseInt(
      match[3],
      10,
    );

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        12,
        0,
        0,
      ),
    );

  if (
    date.getUTCFullYear() !==
      year ||
    date.getUTCMonth() !==
      month - 1 ||
    date.getUTCDate() !==
      day
  ) {
    throw new Error(
      "Das Zahlungsdatum ist ungültig.",
    );
  }

  return date;
}

function parseOptionalString(
  value: FormDataEntryValue | null,
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

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