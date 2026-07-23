import "server-only";

import {
  createHash,
  randomInt,
  timingSafeEqual,
} from "node:crypto";

const ACTIVATION_CODE_CHARACTERS =
  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const ACTIVATION_CODE_LENGTH = 6;
const ACTIVATION_CODE_VALIDITY_HOURS = 24;

export type GeneratedPortalActivationCode = {
  code: string;
  tokenHash: string;
  expiresAt: Date;
};

export function generatePortalActivationCode(): GeneratedPortalActivationCode {
  const characters: string[] = [];

  for (
    let index = 0;
    index < ACTIVATION_CODE_LENGTH;
    index += 1
  ) {
    const characterIndex = randomInt(
      0,
      ACTIVATION_CODE_CHARACTERS.length,
    );

    characters.push(
      ACTIVATION_CODE_CHARACTERS[
        characterIndex
      ],
    );
  }

  const code = formatPortalActivationCode(
    characters.join(""),
  );

  const expiresAt = new Date(
    Date.now() +
      ACTIVATION_CODE_VALIDITY_HOURS *
        60 *
        60 *
        1_000,
  );

  return {
    code,
    tokenHash:
      hashPortalActivationCode(code),
    expiresAt,
  };
}

export function normalizePortalActivationCode(
  value: string,
): string {
  const normalizedValue = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, ACTIVATION_CODE_LENGTH);

  return normalizedValue;
}

export function formatPortalActivationCode(
  value: string,
): string {
  const normalizedValue =
    normalizePortalActivationCode(value);

  if (normalizedValue.length <= 3) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(
    0,
    3,
  )}-${normalizedValue.slice(3)}`;
}

export function hashPortalActivationCode(
  value: string,
): string {
  const normalizedValue =
    normalizePortalActivationCode(value);

  return createHash("sha256")
    .update(normalizedValue, "utf8")
    .digest("hex");
}

export function verifyPortalActivationCode(
  value: string,
  expectedHash: string,
): boolean {
  const actualHash =
    hashPortalActivationCode(value);

  const actualBuffer =
    Buffer.from(actualHash, "hex");

  const expectedBuffer =
    Buffer.from(expectedHash, "hex");

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

export function isPortalActivationCodeValid(
  value: string,
): boolean {
  return (
    normalizePortalActivationCode(value)
      .length === ACTIVATION_CODE_LENGTH
  );
}