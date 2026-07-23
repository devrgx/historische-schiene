import "server-only";

import nodemailer from "nodemailer";
import type {
  SendMailOptions,
  SentMessageInfo,
  Transporter,
} from "nodemailer";

type MailConfiguration = {
  host: string;
  port: number;
  secure: boolean;
  user: string | null;
  password: string | null;

  fromName: string;
  fromAddress: string;
  replyTo: string | null;
};

export type SendMailResult = {
  messageId: string | null;
  accepted: string[];
  rejected: string[];
  response: string | null;
};

let cachedTransporter: Transporter | null = null;

export async function sendMail(
  options: Omit<
    SendMailOptions,
    "from" | "replyTo"
  > & {
    from?: SendMailOptions["from"];
    replyTo?: SendMailOptions["replyTo"];
  },
): Promise<SendMailResult> {
  const configuration = getMailConfiguration();
  const transporter = getMailTransporter(configuration);

  const result: SentMessageInfo =
    await transporter.sendMail({
      ...options,

      from:
        options.from ??
        formatAddress(
          configuration.fromName,
          configuration.fromAddress,
        ),

      replyTo:
        options.replyTo ??
        configuration.replyTo ??
        undefined,
    });

  return {
    messageId:
      typeof result.messageId === "string"
        ? result.messageId
        : null,

    accepted: normalizeAddressResult(
      result.accepted,
    ),

    rejected: normalizeAddressResult(
      result.rejected,
    ),

    response:
      typeof result.response === "string"
        ? result.response
        : null,
  };
}

export async function verifyMailConnection(): Promise<void> {
  const configuration = getMailConfiguration();
  const transporter = getMailTransporter(configuration);

  await transporter.verify();
}

function getMailTransporter(
  configuration: MailConfiguration,
): Transporter {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: configuration.host,
    port: configuration.port,
    secure: configuration.secure,

    auth:
      configuration.user &&
      configuration.password
        ? {
            user: configuration.user,
            pass: configuration.password,
          }
        : undefined,

    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  return cachedTransporter;
}

function getMailConfiguration(): MailConfiguration {
  const host = getRequiredEnvironmentValue(
    "SMTP_HOST",
  );

  const port = parsePort(
    getRequiredEnvironmentValue("SMTP_PORT"),
  );

  const secure = parseBoolean(
    process.env.SMTP_SECURE,
    false,
  );

  const user = getOptionalEnvironmentValue(
    "SMTP_USER",
  );

  const password = getOptionalEnvironmentValue(
    "SMTP_PASSWORD",
  );

  if (
    (user && !password) ||
    (!user && password)
  ) {
    throw new Error(
      "SMTP_USER und SMTP_PASSWORD müssen entweder beide gesetzt oder beide leer sein.",
    );
  }

  return {
    host,
    port,
    secure,
    user,
    password,

    fromName:
      getOptionalEnvironmentValue(
        "MAIL_FROM_NAME",
      ) ?? "Historische Schiene",

    fromAddress:
      getRequiredEnvironmentValue(
        "MAIL_FROM_ADDRESS",
      ),

    replyTo:
      getOptionalEnvironmentValue(
        "MAIL_REPLY_TO",
      ),
  };
}

function getRequiredEnvironmentValue(
  name: string,
): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Die Umgebungsvariable ${name} ist nicht gesetzt.`,
    );
  }

  return value;
}

function getOptionalEnvironmentValue(
  name: string,
): string | null {
  const value = process.env[name]?.trim();

  return value || null;
}

function parsePort(value: string): number {
  const port = Number(value);

  if (
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65_535
  ) {
    throw new Error(
      `SMTP_PORT enthält keinen gültigen Port: ${value}`,
    );
  }

  return port;
}

function parseBoolean(
  value: string | undefined,
  fallback: boolean,
): boolean {
  if (value === undefined || value === "") {
    return fallback;
  }

  const normalizedValue = value
    .trim()
    .toLowerCase();

  if (
    normalizedValue === "true" ||
    normalizedValue === "1" ||
    normalizedValue === "yes"
  ) {
    return true;
  }

  if (
    normalizedValue === "false" ||
    normalizedValue === "0" ||
    normalizedValue === "no"
  ) {
    return false;
  }

  throw new Error(
    `Ungültiger Boolean-Wert: ${value}`,
  );
}

function formatAddress(
  name: string,
  address: string,
): {
  name: string;
  address: string;
} {
  return {
    name,
    address,
  };
}

function normalizeAddressResult(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) =>
    typeof entry === "string"
      ? entry
      : String(entry),
  );
}