"use server";

import { headers } from "next/headers";

import { sendMail } from "@/lib/mail";
import {
  createPasswordResetUrl,
  generatePasswordResetToken,
} from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";

export type PasswordResetRequestState = {
  status: "IDLE" | "ERROR" | "SUCCESS";
  message?: string;
  email?: string;
};

export async function requestPasswordReset(
  previousState: PasswordResetRequestState,
  formData: FormData,
): Promise<PasswordResetRequestState> {
  void previousState;

  const email = normalizeEmail(
    getFormValue(formData, "email"),
  );

  if (!email || !isPlausibleEmail(email)) {
    return {
      status: "ERROR",
      message:
        "Bitte gib eine gültige E-Mail-Adresse ein.",
      email,
    };
  }

  const genericSuccessState: PasswordResetRequestState = {
    status: "SUCCESS",
    message:
      "Falls zu dieser E-Mail-Adresse ein aktives Vereinskonto existiert, wurde eine Nachricht mit weiteren Schritten versendet.",
  };

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      status: true,
      passwordHash: true,
    },
  });

  /*
   * Aus Sicherheitsgründen wird auch bei unbekannten,
   * deaktivierten oder noch nicht aktivierten Konten dieselbe
   * Erfolgsmeldung zurückgegeben.
   */
  if (
    !user ||
    user.status !== "ACTIVE" ||
    !user.passwordHash
  ) {
    return genericSuccessState;
  }

  const generatedToken =
    generatePasswordResetToken();

  const requestHeaders = await headers();

  const requestedIp =
    getClientIp(requestHeaders);

  const requestedUserAgent =
    requestHeaders
      .get("user-agent")
      ?.slice(0, 2_000) ?? null;

  let resetTokenId: number | null = null;

  try {
    const result = await prisma.$transaction(
      async (transaction) => {
        /*
         * Alle bisherigen, noch nutzbaren Reset-Links werden
         * widerrufen. Dadurch ist immer nur der neueste Link gültig.
         */
        await transaction.passwordResetToken.updateMany({
          where: {
            userId: user.id,
            usedAt: null,
            revokedAt: null,
          },
          data: {
            revokedAt: new Date(),
          },
        });

        return transaction.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash:
              generatedToken.tokenHash,
            expiresAt:
              generatedToken.expiresAt,
            requestedIp,
            requestedUserAgent,
          },
          select: {
            id: true,
          },
        });
      },
    );

    resetTokenId = result.id;
  } catch (error) {
    console.error(
      "Passwort-Reset-Token konnte nicht erstellt werden:",
      error,
    );

    /*
     * Auch interne Fehler werden nicht nach außen offengelegt.
     */
    return genericSuccessState;
  }

  const resetUrl = createPasswordResetUrl(
    generatedToken.token,
  );

  const mail = createPasswordResetMail({
    displayName: user.displayName,
    resetUrl,
    expiresAt:
      generatedToken.expiresAt,
  });

  try {
    const mailResult = await sendMail({
      to: user.email,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });

    if (mailResult.accepted.length === 0) {
      throw new Error(
        "Der Mailserver hat keinen Empfänger akzeptiert.",
      );
    }
  } catch (error) {
    console.error(
      "Passwort-Reset-Mail konnte nicht versendet werden:",
      error,
    );

    /*
     * Der nicht zugestellte Reset-Link wird direkt wieder
     * ungültig gemacht.
     */
    if (resetTokenId) {
      try {
        await prisma.passwordResetToken.update({
          where: {
            id: resetTokenId,
          },
          data: {
            revokedAt: new Date(),
          },
        });
      } catch (revokeError) {
        console.error(
          "Fehlgeschlagener Reset-Token konnte nicht widerrufen werden:",
          revokeError,
        );
      }
    }
  }

  return genericSuccessState;
}

type PasswordResetMailInput = {
  displayName: string;
  resetUrl: string;
  expiresAt: Date;
};

function createPasswordResetMail(
  input: PasswordResetMailInput,
) {
  const formattedExpiration =
    formatDateTime(input.expiresAt);

  const subject =
    "Passwort für das Mitgliederportal zurücksetzen";

  const text = [
    `Hallo ${input.displayName},`,
    "",
    "für dein Konto im Mitgliederportal von Historische Schiene wurde eine Passwort-Zurücksetzung angefordert.",
    "",
    "Über den folgenden Link kannst du ein neues Passwort festlegen:",
    input.resetUrl,
    "",
    `Der Link ist bis ${formattedExpiration} gültig und kann nur einmal verwendet werden.`,
    "",
    "Falls du die Zurücksetzung nicht angefordert hast, kannst du diese Nachricht ignorieren. Dein bisheriges Passwort bleibt unverändert.",
    "",
    "Viele Grüße",
    "",
    "Historische Schiene",
    "Der Vorstand",
  ].join("\n");

  const html = `
<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    >
    <title>${escapeHtml(subject)}</title>
  </head>

  <body style="margin:0;padding:0;background:#0b1020;color:#e8edf7;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      Setze dein Passwort für das Mitgliederportal zurück.
    </div>

    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      style="width:100%;background:#0b1020;padding:32px 16px;"
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            style="width:100%;max-width:640px;background:#141b2d;border:1px solid #27324a;border-radius:18px;overflow:hidden;"
          >
            <tr>
              <td style="padding:30px 32px;background:#19233b;border-bottom:1px solid #27324a;">
                <div style="font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#8fb4ff;">
                  Historische Schiene
                </div>

                <h1 style="margin:10px 0 0;font-size:28px;line-height:1.25;color:#ffffff;">
                  Passwort zurücksetzen
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:32px;">
                <p style="margin:0;font-size:17px;line-height:1.7;color:#e8edf7;">
                  Hallo ${escapeHtml(input.displayName)},
                </p>

                <p style="margin:18px 0 0;font-size:16px;line-height:1.7;color:#b9c4d8;">
                  für dein Konto im Mitgliederportal wurde eine
                  Passwort-Zurücksetzung angefordert.
                </p>

                <div style="margin-top:28px;text-align:center;">
                  <a
                    href="${escapeHtml(input.resetUrl)}"
                    style="display:inline-block;background:#496ee8;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 24px;border-radius:10px;"
                  >
                    Neues Passwort festlegen
                  </a>
                </div>

                <div style="margin-top:28px;padding:18px;background:#112b25;border:1px solid #2d6b5d;border-radius:14px;">
                  <p style="margin:0;font-size:14px;font-weight:700;color:#ffffff;">
                    Gültigkeit des Links
                  </p>

                  <p style="margin:8px 0 0;font-size:14px;line-height:1.7;color:#a7cabf;">
                    Der Link ist bis
                    ${escapeHtml(formattedExpiration)}
                    gültig und kann nur einmal verwendet werden.
                  </p>
                </div>

                <div style="margin-top:20px;padding:18px;background:#2a2110;border:1px solid #6e5721;border-radius:14px;">
                  <p style="margin:0;font-size:14px;font-weight:700;color:#ffe7a3;">
                    Du hast das nicht angefordert?
                  </p>

                  <p style="margin:8px 0 0;font-size:14px;line-height:1.7;color:#d8c99f;">
                    Dann kannst du diese Nachricht ignorieren.
                    Dein bisheriges Passwort bleibt unverändert.
                  </p>
                </div>

                <p style="margin:28px 0 0;font-size:15px;line-height:1.7;color:#b9c4d8;">
                  Falls der Button nicht funktioniert, kopiere diese
                  Adresse in deinen Browser:
                </p>

                <p style="margin:8px 0 0;font-size:13px;line-height:1.6;word-break:break-all;color:#8fb4ff;">
                  ${escapeHtml(input.resetUrl)}
                </p>

                <p style="margin:30px 0 0;font-size:15px;line-height:1.7;color:#b9c4d8;">
                  Viele Grüße<br>
                  <strong style="color:#ffffff;">
                    Historische Schiene
                  </strong><br>
                  Der Vorstand
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 32px;background:#101728;border-top:1px solid #27324a;">
                <p style="margin:0;text-align:center;font-size:12px;line-height:1.6;color:#76849d;">
                  Diese Nachricht wurde automatisch erstellt.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  return {
    subject,
    text,
    html,
  };
}

function getFormValue(
  formData: FormData,
  name: string,
): string {
  const value = formData.get(name);

  return typeof value === "string"
    ? value
    : "";
}

function normalizeEmail(
  value: string,
): string {
  return value.trim().toLowerCase();
}

function isPlausibleEmail(
  value: string,
): boolean {
  return (
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}

function getClientIp(
  requestHeaders: Headers,
): string | null {
  const forwardedFor =
    requestHeaders.get("x-forwarded-for");

  if (forwardedFor) {
    return (
      forwardedFor
        .split(",")[0]
        ?.trim()
        .slice(0, 100) || null
    );
  }

  const realIp =
    requestHeaders.get("x-real-ip");

  return realIp?.trim().slice(0, 100) || null;
}

function formatDateTime(
  date: Date,
): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(date);
}

function escapeHtml(
  value: string,
): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}