import type { Metadata } from "next";
import Link from "next/link";
import {
  CircleAlert,
  RotateCcw,
} from "lucide-react";

import { PortalShell } from "@/components/portal/portal-shell";
import {
  hashPasswordResetToken,
  isPasswordResetTokenPlausible,
  normalizePasswordResetToken,
} from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Passwort zurücksetzen",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string | string[];
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const resolvedSearchParams =
    await searchParams;

  const token =
    normalizePasswordResetToken(
      getSingleSearchParameter(
        resolvedSearchParams.token,
      ),
    );

  const tokenStatus =
    await validateResetToken(token);

  if (!tokenStatus.valid) {
    return (
      <PortalShell
        title="Ungültiger Zurücksetzungslink"
        description="Dieser Link kann nicht zum Ändern deines Passworts verwendet werden."
      >
        <div className="surface-card mx-auto max-w-xl p-7 sm:p-9">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-400/15 text-red-300">
              <CircleAlert size={24} />
            </span>

            <div>
              <p className="text-sm font-semibold text-red-300">
                Link nicht gültig
              </p>

              <h1 className="mt-1 text-xl font-bold text-content">
                Neues Passwort kann nicht festgelegt werden
              </h1>

              <p className="mt-3 leading-7 text-muted">
                {tokenStatus.message}
              </p>
            </div>
          </div>

          <div className="mt-7 rounded-2xl border border-accent-border bg-accent-soft p-5">
            <p className="font-semibold text-content">
              Neuen Link anfordern
            </p>

            <p className="mt-2 text-sm leading-7 text-muted">
              Über die Passwort-vergessen-Funktion kannst du dir
              einen neuen, zeitlich begrenzten Link zusenden lassen.
            </p>
          </div>

          <Link
            href="/portal/passwort-vergessen"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-hover"
          >
            <RotateCcw size={18} />
            Neuen Link anfordern
          </Link>

          <Link
            href="/portal/login"
            className="mt-4 inline-flex w-full items-center justify-center text-sm font-semibold text-muted transition hover:text-content"
          >
            Zurück zur Anmeldung
          </Link>
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell
      title="Neues Passwort festlegen"
      description="Lege ein neues Passwort für dein Mitgliedskonto fest."
    >
      <ResetPasswordForm token={token} />
    </PortalShell>
  );
}

async function validateResetToken(
  token: string,
): Promise<
  | {
      valid: true;
    }
  | {
      valid: false;
      message: string;
    }
> {
  if (
    !isPasswordResetTokenPlausible(
      token,
    )
  ) {
    return {
      valid: false,
      message:
        "Der Zurücksetzungslink ist unvollständig oder ungültig.",
    };
  }

  const tokenHash =
    hashPasswordResetToken(token);

  const resetToken =
    await prisma.passwordResetToken.findUnique({
      where: {
        tokenHash,
      },
      select: {
        expiresAt: true,
        usedAt: true,
        revokedAt: true,

        user: {
          select: {
            status: true,
          },
        },
      },
    });

  if (!resetToken) {
    return {
      valid: false,
      message:
        "Dieser Zurücksetzungslink ist nicht bekannt oder wurde bereits entfernt.",
    };
  }

  if (resetToken.usedAt) {
    return {
      valid: false,
      message:
        "Dieser Zurücksetzungslink wurde bereits verwendet.",
    };
  }

  if (resetToken.revokedAt) {
    return {
      valid: false,
      message:
        "Dieser Zurücksetzungslink wurde widerrufen. Möglicherweise wurde bereits ein neuer Link angefordert.",
    };
  }

  if (
    resetToken.expiresAt <= new Date()
  ) {
    return {
      valid: false,
      message:
        "Dieser Zurücksetzungslink ist abgelaufen.",
    };
  }

  if (
    resetToken.user.status !== "ACTIVE"
  ) {
    return {
      valid: false,
      message:
        "Das zugehörige Benutzerkonto ist derzeit nicht aktiv.",
    };
  }

  return {
    valid: true,
  };
}

function getSingleSearchParameter(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}