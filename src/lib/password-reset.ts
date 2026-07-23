import "server-only";

import {
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const PASSWORD_RESET_VALIDITY_MINUTES = 60;

export type GeneratedPasswordResetToken = {
  token: string;
  tokenHash: string;
  expiresAt: Date;
};

export function generatePasswordResetToken(): GeneratedPasswordResetToken {
  const token = randomBytes(32).toString("base64url");

  const expiresAt = new Date(
    Date.now() +
      PASSWORD_RESET_VALIDITY_MINUTES *
        60 *
        1_000,
  );

  return {
    token,
    tokenHash: hashPasswordResetToken(token),
    expiresAt,
  };
}

export function hashPasswordResetToken(
  token: string,
): string {
  return createHash("sha256")
    .update(normalizePasswordResetToken(token), "utf8")
    .digest("hex");
}

export function verifyPasswordResetToken(
  token: string,
  expectedHash: string,
): boolean {
  const actualHash = hashPasswordResetToken(token);

  const actualBuffer = Buffer.from(
    actualHash,
    "hex",
  );

  const expectedBuffer = Buffer.from(
    expectedHash,
    "hex",
  );

  if (
    actualBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    actualBuffer,
    expectedBuffer,
  );
}

export function normalizePasswordResetToken(
  token: string,
): string {
  return token.trim();
}

export function isPasswordResetTokenPlausible(
  token: string,
): boolean {
  const normalizedToken =
    normalizePasswordResetToken(token);

  return (
    normalizedToken.length >= 40 &&
    normalizedToken.length <= 100 &&
    /^[A-Za-z0-9_-]+$/.test(normalizedToken)
  );
}

export function createPasswordResetUrl(
  token: string,
): string {
  const appUrl = process.env.APP_URL?.trim();

  if (!appUrl) {
    throw new Error(
      "Die Umgebungsvariable APP_URL ist nicht gesetzt.",
    );
  }

  const url = new URL(
    "/portal/passwort-zuruecksetzen",
    ensureTrailingSlash(appUrl),
  );

  url.searchParams.set("token", token);

  return url.toString();
}

function ensureTrailingSlash(
  value: string,
): string {
  return value.endsWith("/")
    ? value
    : `${value}/`;
}