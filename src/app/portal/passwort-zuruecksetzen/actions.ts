"use server";

import { hashPassword } from "@/lib/auth";
import {
  hashPasswordResetToken,
  isPasswordResetTokenPlausible,
  normalizePasswordResetToken,
} from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";

type PasswordResetState = {
  status: "IDLE" | "ERROR" | "SUCCESS";
  message?: string;
};

export async function resetPassword(
  previousState: PasswordResetState,
  formData: FormData,
): Promise<PasswordResetState> {
  void previousState;

  const token = normalizePasswordResetToken(
    getFormValue(formData, "token"),
  );

  const password = getFormValue(
    formData,
    "password",
  );

  const passwordConfirmation = getFormValue(
    formData,
    "passwordConfirmation",
  );

  if (!isPasswordResetTokenPlausible(token)) {
    return {
      status: "ERROR",
      message:
        "Der Zurücksetzungslink ist ungültig oder unvollständig.",
    };
  }

  const passwordError = validatePassword(
    password,
    passwordConfirmation,
  );

  if (passwordError) {
    return {
      status: "ERROR",
      message: passwordError,
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
        id: true,
        userId: true,
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
      status: "ERROR",
      message:
        "Der Zurücksetzungslink ist ungültig.",
    };
  }

  if (resetToken.usedAt) {
    return {
      status: "ERROR",
      message:
        "Dieser Zurücksetzungslink wurde bereits verwendet.",
    };
  }

  if (resetToken.revokedAt) {
    return {
      status: "ERROR",
      message:
        "Dieser Zurücksetzungslink wurde widerrufen. Fordere bitte einen neuen Link an.",
    };
  }

  if (resetToken.expiresAt <= new Date()) {
    return {
      status: "ERROR",
      message:
        "Dieser Zurücksetzungslink ist abgelaufen. Fordere bitte einen neuen Link an.",
    };
  }

  if (resetToken.user.status !== "ACTIVE") {
    return {
      status: "ERROR",
      message:
        "Das zugehörige Benutzerkonto ist derzeit nicht aktiv.",
    };
  }

  const passwordHash =
    await hashPassword(password);

  try {
    await prisma.$transaction(
      async (transaction) => {
        const now = new Date();

        /*
         * Der Token wird atomar als verwendet markiert.
         * Dadurch kann derselbe Link auch bei zwei nahezu
         * gleichzeitigen Anfragen nur einmal benutzt werden.
         */
        const consumedToken =
          await transaction.passwordResetToken.updateMany({
            where: {
              id: resetToken.id,
              userId: resetToken.userId,
              usedAt: null,
              revokedAt: null,
              expiresAt: {
                gt: now,
              },
            },
            data: {
              usedAt: now,
            },
          });

        if (consumedToken.count !== 1) {
          throw new Error(
            "RESET_TOKEN_NO_LONGER_VALID",
          );
        }

        await transaction.user.update({
          where: {
            id: resetToken.userId,
          },
          data: {
            passwordHash,
          },
        });

        /*
         * Alle anderen noch offenen Links des Benutzers werden
         * ebenfalls ungültig.
         */
        await transaction.passwordResetToken.updateMany({
          where: {
            userId: resetToken.userId,
            id: {
              not: resetToken.id,
            },
            usedAt: null,
            revokedAt: null,
          },
          data: {
            revokedAt: now,
          },
        });
      },
    );
  } catch (error) {
    console.error(
      "Passwort konnte nicht zurückgesetzt werden:",
      error,
    );

    if (
      error instanceof Error &&
      error.message ===
        "RESET_TOKEN_NO_LONGER_VALID"
    ) {
      return {
        status: "ERROR",
        message:
          "Der Zurücksetzungslink ist nicht mehr gültig. Fordere bitte einen neuen Link an.",
      };
    }

    return {
      status: "ERROR",
      message:
        "Das Passwort konnte nicht gespeichert werden. Bitte versuche es erneut.",
    };
  }

  return {
    status: "SUCCESS",
    message:
      "Dein Passwort wurde erfolgreich geändert.",
  };
}

function validatePassword(
  password: string,
  confirmation: string,
): string | null {
  if (!password) {
    return "Bitte lege ein neues Passwort fest.";
  }

  if (password.length < 12) {
    return "Das Passwort muss mindestens 12 Zeichen lang sein.";
  }

  if (password.length > 128) {
    return "Das Passwort darf höchstens 128 Zeichen lang sein.";
  }

  if (!/[a-z]/.test(password)) {
    return "Das Passwort muss mindestens einen Kleinbuchstaben enthalten.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Das Passwort muss mindestens einen Großbuchstaben enthalten.";
  }

  if (!/[0-9]/.test(password)) {
    return "Das Passwort muss mindestens eine Zahl enthalten.";
  }

  if (password !== confirmation) {
    return "Die beiden Passwörter stimmen nicht überein.";
  }

  return null;
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