import "server-only";

export type SepaBusinessArea =
  | "GENERAL"
  | "MEMBERSHIP"
  | "EVENTS"
  | "DONATIONS";

const businessCodeEnvironmentVariables: Record<
  SepaBusinessArea,
  string
> = {
  GENERAL: "SEPA_BUSINESS_CODE_GENERAL",
  MEMBERSHIP: "SEPA_BUSINESS_CODE_MEMBERSHIP",
  EVENTS: "SEPA_BUSINESS_CODE_EVENTS",
  DONATIONS: "SEPA_BUSINESS_CODE_DONATIONS",
};

const defaultBusinessCodes: Record<SepaBusinessArea, string> = {
  GENERAL: "HSA",
  MEMBERSHIP: "HSM",
  EVENTS: "HSE",
  DONATIONS: "HSP",
};

export function getBaseCreditorId(): string {
  const creditorId = process.env.SEPA_CREDITOR_ID
    ?.trim()
    .toUpperCase();

  if (!creditorId) {
    throw new Error(
      "SEPA_CREDITOR_ID ist nicht in der .env hinterlegt.",
    );
  }

  if (!/^DE\d{2}[A-Z0-9]{3}[A-Z0-9]{11}$/.test(creditorId)) {
    throw new Error(
      "SEPA_CREDITOR_ID hat nicht das erwartete deutsche Format.",
    );
  }

  return creditorId;
}

export function getSepaBusinessCode(
  area: SepaBusinessArea,
): string {
  const environmentVariable =
    businessCodeEnvironmentVariables[area];

  const configuredCode = process.env[environmentVariable]
    ?.trim()
    .toUpperCase();

  const businessCode =
    configuredCode || defaultBusinessCodes[area];

  if (!/^[A-Z0-9]{3}$/.test(businessCode)) {
    throw new Error(
      `${environmentVariable} muss genau drei Buchstaben oder Ziffern enthalten.`,
    );
  }

  return businessCode;
}

export function getCreditorId(
  area: SepaBusinessArea,
): string {
  const baseCreditorId = getBaseCreditorId();
  const businessCode = getSepaBusinessCode(area);

  return [
    baseCreditorId.slice(0, 4),
    businessCode,
    baseCreditorId.slice(7),
  ].join("");
}