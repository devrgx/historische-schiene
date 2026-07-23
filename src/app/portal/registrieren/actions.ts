"use server";

import { hashPassword } from "@/lib/auth";
import {
  hashPortalActivationCode,
  isPortalActivationCodeValid,
  normalizePortalActivationCode,
} from "@/lib/portal-activation";
import { prisma } from "@/lib/prisma";

export type PortalRegistrationState = {
  status:
    | "IDLE"
    | "ERROR"
    | "VERIFIED"
    | "ACTIVATED";

  message?: string;

  memberNumber?: string;
  postalCode?: string;
  birthDate?: string;
  verificationCode?: string;

  tokenId?: number;
  memberFirstName?: string;
};

type RegistrationInput = {
  memberNumber: string;
  postalCode: string;
  birthDate: string;
  verificationCode: string;
};

type VerifiedRegistration = {
  tokenId: number;
  userId: number;
  memberFirstName: string;
};

export async function verifyPortalRegistrationData(
  previousState: PortalRegistrationState,
  formData: FormData,
): Promise<PortalRegistrationState> {
  void previousState;

  const input = readRegistrationInput(formData);
  const inputState = createInputState(input);

  const validationError =
    validateRegistrationInput(input);

  if (validationError) {
    return {
      status: "ERROR",
      message: validationError,
      ...inputState,
    };
  }

  const verification =
    await verifyRegistrationInput(input);

  if ("error" in verification) {
    return {
      status: "ERROR",
      message: verification.error,
      ...inputState,
    };
  }

  return {
    status: "VERIFIED",
    message:
      "Deine Mitgliedsdaten wurden erfolgreich geprüft.",
    ...inputState,
    tokenId: verification.tokenId,
    memberFirstName:
      verification.memberFirstName,
  };
}

export async function activatePortalAccount(
  previousState: PortalRegistrationState,
  formData: FormData,
): Promise<PortalRegistrationState> {
  const input = readRegistrationInput(formData);
  const inputState = createInputState(input);

  const password = getFormValue(
    formData,
    "password",
  );

  const passwordConfirmation = getFormValue(
    formData,
    "passwordConfirmation",
  );

  const validationError =
    validateRegistrationInput(input);

  if (validationError) {
    return {
      status: "ERROR",
      message:
        "Die Aktivierungsdaten sind nicht mehr vollständig. Bitte beginne die Prüfung erneut.",
      ...inputState,
    };
  }

  const passwordError = validatePassword(
    password,
    passwordConfirmation,
  );

  if (passwordError) {
    return {
      status: "VERIFIED",
      message: passwordError,
      ...inputState,
      tokenId: previousState.tokenId,
      memberFirstName:
        previousState.memberFirstName,
    };
  }

  /*
   * Die Mitgliedsdaten und der Aktivierungscode werden erneut
   * geprüft. Wir vertrauen nicht allein auf die Daten aus dem
   * vorherigen Formularschritt.
   */
  const verification =
    await verifyRegistrationInput(input);

  if ("error" in verification) {
    return {
      status: "ERROR",
      message: verification.error,
      ...inputState,
    };
  }

  const passwordHash = await hashPassword(password);

  try {
    await prisma.$transaction(
      async (transaction) => {
        /*
         * Der Token wird innerhalb der Transaktion erneut gelesen,
         * damit ein zwischenzeitlich verwendeter oder widerrufener
         * Code nicht doppelt benutzt werden kann.
         */
        const currentToken =
          await transaction.portalActivationToken.findUnique({
            where: {
              id: verification.tokenId,
            },
            select: {
              userId: true,
              usedAt: true,
              revokedAt: true,
              expiresAt: true,
            },
          });

        if (!currentToken) {
          throw new Error(
            "ACTIVATION_TOKEN_NOT_FOUND",
          );
        }

        if (currentToken.usedAt) {
          throw new Error(
            "ACTIVATION_TOKEN_USED",
          );
        }

        if (currentToken.revokedAt) {
          throw new Error(
            "ACTIVATION_TOKEN_REVOKED",
          );
        }

        if (
          currentToken.expiresAt <=
          new Date()
        ) {
          throw new Error(
            "ACTIVATION_TOKEN_EXPIRED",
          );
        }

        if (
          currentToken.userId !==
          verification.userId
        ) {
          throw new Error(
            "ACTIVATION_USER_MISMATCH",
          );
        }

        await transaction.user.update({
          where: {
            id: verification.userId,
          },
          data: {
            passwordHash,
            status: "ACTIVE",
          },
        });

        await transaction.portalActivationToken.update({
          where: {
            id: verification.tokenId,
          },
          data: {
            usedAt: new Date(),
          },
        });

        /*
         * Eventuell noch vorhandene weitere Codes dieses Kontos
         * werden ungültig gemacht.
         */
        await transaction.portalActivationToken.updateMany({
          where: {
            userId: verification.userId,
            id: {
              not: verification.tokenId,
            },
            usedAt: null,
            revokedAt: null,
          },
          data: {
            revokedAt: new Date(),
          },
        });
      },
    );
  } catch (error) {
    console.error(
      "Mitgliedskonto konnte nicht aktiviert werden:",
      error,
    );

    return {
      status: "ERROR",
      message:
        getActivationErrorMessage(error),
      ...inputState,
    };
  }

  return {
    status: "ACTIVATED",
    message:
      "Dein Mitgliedskonto wurde erfolgreich aktiviert.",
    memberFirstName:
      verification.memberFirstName,
  };
}

async function verifyRegistrationInput(
  input: RegistrationInput,
): Promise<
  | VerifiedRegistration
  | {
      error: string;
    }
> {
  const tokenHash =
    hashPortalActivationCode(
      input.verificationCode,
    );

  const activationToken =
    await prisma.portalActivationToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: {
          include: {
            member: {
              select: {
                firstName: true,
                membershipNumber: true,
                postalCode: true,
                birthDate: true,
                status: true,
              },
            },
          },
        },
      },
    });

  if (!activationToken) {
    return {
      error:
        "Die eingegebenen Mitgliedsdaten oder der Aktivierungscode stimmen nicht überein.",
    };
  }

  const member =
    activationToken.user.member;

  if (
    !member ||
    member.status !== "ACTIVE"
  ) {
    return {
      error:
        "Die eingegebenen Mitgliedsdaten oder der Aktivierungscode stimmen nicht überein.",
    };
  }

  if (activationToken.usedAt) {
    return {
      error:
        "Dieser Aktivierungscode wurde bereits verwendet. Du kannst dich möglicherweise bereits anmelden.",
    };
  }

  if (activationToken.revokedAt) {
    return {
      error:
        "Dieser Aktivierungscode wurde widerrufen. Bitte fordere einen neuen Code an.",
    };
  }

  if (
    activationToken.expiresAt <=
    new Date()
  ) {
    return {
      error:
        "Dieser Aktivierungscode ist abgelaufen. Bitte fordere einen neuen Code an.",
    };
  }

  if (
    activationToken.user.status ===
    "BLOCKED"
  ) {
    return {
      error:
        "Dieses Benutzerkonto ist gesperrt. Bitte wende dich an den Verein.",
    };
  }

  if (
    activationToken.user.status ===
    "DISABLED"
  ) {
    return {
      error:
        "Dieses Benutzerkonto wurde deaktiviert. Bitte wende dich an den Verein.",
    };
  }

  const memberDataMatches =
    normalizeMemberNumber(
      member.membershipNumber,
    ) === input.memberNumber &&
    normalizePostalCode(
      member.postalCode,
    ) === input.postalCode &&
    formatStoredBirthDate(
      member.birthDate,
    ) === input.birthDate;

  if (!memberDataMatches) {
    return {
      error:
        "Die eingegebenen Mitgliedsdaten oder der Aktivierungscode stimmen nicht überein.",
    };
  }

  return {
    tokenId: activationToken.id,
    userId: activationToken.userId,
    memberFirstName:
      member.firstName,
  };
}

function readRegistrationInput(
  formData: FormData,
): RegistrationInput {
  return {
    memberNumber:
      normalizeMemberNumber(
        getFormValue(
          formData,
          "memberNumber",
        ),
      ),

    postalCode:
      normalizePostalCode(
        getFormValue(
          formData,
          "postalCode",
        ),
      ),

    birthDate:
      normalizeBirthDate(
        getFormValue(
          formData,
          "birthDate",
        ),
      ),

    verificationCode:
      normalizePortalActivationCode(
        getFormValue(
          formData,
          "verificationCode",
        ),
      ),
  };
}

function createInputState(
  input: RegistrationInput,
) {
  return {
    memberNumber: input.memberNumber,
    postalCode: input.postalCode,
    birthDate: input.birthDate,
    verificationCode:
      formatActivationCodeForDisplay(
        input.verificationCode,
      ),
  };
}

function validateRegistrationInput(
  input: RegistrationInput,
): string | null {
  if (!input.memberNumber) {
    return "Bitte gib deine Mitgliedsnummer ein.";
  }

  if (!input.postalCode) {
    return "Bitte gib deine Postleitzahl ein.";
  }

  if (!input.birthDate) {
    return "Bitte gib dein Geburtsdatum ein.";
  }

  if (
    !isPortalActivationCodeValid(
      input.verificationCode,
    )
  ) {
    return "Der Aktivierungscode muss aus sechs Zeichen bestehen.";
  }

  return null;
}

function validatePassword(
  password: string,
  confirmation: string,
): string | null {
  if (!password) {
    return "Bitte lege ein Passwort fest.";
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

function getActivationErrorMessage(
  error: unknown,
): string {
  if (!(error instanceof Error)) {
    return "Das Mitgliedskonto konnte nicht aktiviert werden.";
  }

  switch (error.message) {
    case "ACTIVATION_TOKEN_USED":
      return "Dieser Aktivierungscode wurde bereits verwendet.";

    case "ACTIVATION_TOKEN_REVOKED":
      return "Dieser Aktivierungscode wurde widerrufen.";

    case "ACTIVATION_TOKEN_EXPIRED":
      return "Dieser Aktivierungscode ist inzwischen abgelaufen.";

    default:
      return "Das Mitgliedskonto konnte nicht aktiviert werden. Bitte versuche es erneut.";
  }
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

function normalizeMemberNumber(
  value: string,
): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function normalizePostalCode(
  value: string,
): string {
  return value
    .trim()
    .replace(/\s+/g, "");
}

function normalizeBirthDate(
  value: string,
): string {
  const normalizedValue =
    value.trim();

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      normalizedValue,
    )
  ) {
    return "";
  }

  const [
    yearString,
    monthString,
    dayString,
  ] = normalizedValue.split("-");

  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
    ),
  );

  const valid =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() ===
      month - 1 &&
    date.getUTCDate() === day;

  return valid
    ? normalizedValue
    : "";
}

function formatStoredBirthDate(
  value: Date,
): string {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone:
          "Europe/Berlin",
      },
    ).formatToParts(value);

  const year =
    parts.find(
      (part) =>
        part.type === "year",
    )?.value;

  const month =
    parts.find(
      (part) =>
        part.type === "month",
    )?.value;

  const day =
    parts.find(
      (part) =>
        part.type === "day",
    )?.value;

  if (!year || !month || !day) {
    return "";
  }

  return `${year}-${month}-${day}`;
}

function formatActivationCodeForDisplay(
  value: string,
): string {
  if (value.length <= 3) {
    return value;
  }

  return `${value.slice(
    0,
    3,
  )}-${value.slice(3)}`;
}