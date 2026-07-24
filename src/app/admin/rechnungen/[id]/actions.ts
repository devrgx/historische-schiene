"use server";

import {
  revalidatePath,
} from "next/cache";
import { redirect } from "next/navigation";

import {
  InvoiceStatus,
} from "@/generated/prisma/client";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function issueInvoiceAction(
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
    await prisma.$transaction(
      async (transaction) => {
        const invoice =
          await transaction.invoice.findUnique({
            where: {
              id: invoiceId,
            },

            select: {
              id: true,
              status: true,
              totalCents: true,
              openCents: true,

              items: {
                select: {
                  id: true,
                },
              },

              membershipCharge: {
                select: {
                  memberId: true,
                  admissionFeeCents: true,
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
          invoice.status !==
          InvoiceStatus.DRAFT
        ) {
          throw new Error(
            "Nur Rechnungsentwürfe können ausgestellt werden.",
          );
        }

        if (
          invoice.items.length === 0
        ) {
          throw new Error(
            "Die Rechnung enthält keine Rechnungspositionen.",
          );
        }

        if (invoice.totalCents < 0) {
          throw new Error(
            "Der Rechnungsbetrag ist ungültig.",
          );
        }

        if (
          invoice.openCents !==
          invoice.totalCents
        ) {
          throw new Error(
            "Der offene Betrag stimmt nicht mit dem Rechnungsbetrag überein.",
          );
        }

        const finalizedAt =
          new Date();

        await transaction.invoice.update({
          where: {
            id: invoice.id,
          },

          data: {
            status:
              InvoiceStatus.ISSUED,

            finalizedAt,
          },
        });

        const membershipCharge =
          invoice.membershipCharge;

        if (
          membershipCharge &&
          membershipCharge
            .admissionFeeCents > 0
        ) {
          await transaction.memberBillingProfile.upsert({
            where: {
              memberId:
                membershipCharge.memberId,
            },

            update: {
              admissionFeeChargedAt:
                finalizedAt,
            },

            create: {
              memberId:
                membershipCharge.memberId,

              admissionFeeChargedAt:
                finalizedAt,
            },
          });
        }
      },
    );
  } catch (error: unknown) {
    console.error(
      "Rechnung konnte nicht ausgestellt werden:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Die Rechnung konnte nicht ausgestellt werden.";

    redirect(
      `/admin/rechnungen/${invoiceId}?error=${encodeURIComponent(
        message,
      )}`,
    );
  }

  revalidatePath(
    `/admin/rechnungen/${invoiceId}`,
  );

  revalidatePath(
    "/admin/rechnungen",
  );

  revalidatePath("/admin");

  redirect(
    `/admin/rechnungen/${invoiceId}?success=${encodeURIComponent(
      "Die Rechnung wurde erfolgreich ausgestellt.",
    )}`,
  );
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
    Number.parseInt(value, 10);

  if (
    !Number.isInteger(parsed) ||
    parsed < 1
  ) {
    return null;
  }

  return parsed;
}