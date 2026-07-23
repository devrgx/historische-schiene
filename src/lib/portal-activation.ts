import "server-only";

import {
  createHash,
  randomBytes,
} from "node:crypto";

const ACTIVATION_CODE_BYTES = 18;
const ACTIVATION_DURATION_DAYS = 14;

export type GeneratedActivationCode = {
  code: string;
  tokenHash: string;
  expiresAt: Date;
};

export function generatePortalActivationCode(): GeneratedActivationCode {
  const code = randomBytes(ACTIVATION_CODE_BYTES)
    .toString("base64url")
    .toUpperCase();

  return {
    code,
    tokenHash: hashPortalActivationCode(code),
    expiresAt: createExpirationDate(),
  };
}

export function hashPortalActivationCode(
  code: string,
): string {
  const normalizedCode = normalizeActivationCode(code);

  return createHash("sha256")
    .update(normalizedCode, "utf8")
    .digest("hex");
}

export function normalizeActivationCode(
  code: string,
): string {
  return code
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

export function formatActivationCode(
  code: string,
): string {
  const normalizedCode = normalizeActivationCode(code);

  return normalizedCode.match(/.{1,6}/g)?.join("-") ??
    normalizedCode;
}

function createExpirationDate(): Date {
  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() + ACTIVATION_DURATION_DAYS,
  );

  return expiresAt;
}