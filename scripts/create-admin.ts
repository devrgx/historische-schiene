import "dotenv/config";

import {
  randomBytes,
  scrypt as scryptCallback,
} from "node:crypto";
import { promisify } from "node:util";
import { createInterface } from "node:readline/promises";
import {
  stdin as input,
  stdout as output,
} from "node:process";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import {
  PrismaClient,
  UserStatus,
} from "../src/generated/prisma/client";
import { getMariaDbConfig } from "../src/lib/database-config";

const scrypt = promisify(scryptCallback);

const adapter = new PrismaMariaDb(
  getMariaDbConfig(),
);

const prisma = new PrismaClient({
  adapter,
});

async function main(): Promise<void> {
  const readline = createInterface({
    input,
    output,
  });

  try {
    printHeader();

    const displayName = (
      await readline.question(
        "Anzeigename: ",
      )
    ).trim();

    const email = normalizeEmail(
      await readline.question(
        "E-Mail-Adresse: ",
      ),
    );

    const password =
      await readline.question(
        "Passwort: ",
      );

    const passwordConfirmation =
      await readline.question(
        "Passwort wiederholen: ",
      );

    validateDisplayName(displayName);
    validateEmail(email);
    validatePassword(
      password,
      passwordConfirmation,
    );

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          email: true,
          displayName: true,
          status: true,
          sessionVersion: true,
        },
      });

    if (existingUser) {
      console.log("");
      console.log(
        "Zu dieser E-Mail-Adresse existiert bereits ein Benutzer:",
      );
      console.log(
        `Name:   ${existingUser.displayName}`,
      );
      console.log(
        `E-Mail: ${existingUser.email}`,
      );
      console.log(
        `Status: ${existingUser.status}`,
      );
      console.log("");

      const confirmation = (
        await readline.question(
          "Diesen Benutzer zum Administrator machen und das Passwort ersetzen? (ja/nein): ",
        )
      )
        .trim()
        .toLowerCase();

      if (
        confirmation !== "ja" &&
        confirmation !== "j"
      ) {
        console.log("");
        console.log(
          "Vorgang wurde abgebrochen.",
        );

        return;
      }
    }

    console.log("");
    console.log(
      "Administrator wird eingerichtet …",
    );

    const passwordHash =
      await hashPassword(password);

    const result =
      await prisma.$transaction(
        async (transaction) => {
          const adminRole =
            await transaction.role.upsert({
              where: {
                key: "ADMIN",
              },

              update: {
                name: "Administrator",
                description:
                  "Vollständiger Zugriff auf den Administrationsbereich.",
                isSystem: true,
              },

              create: {
                key: "ADMIN",
                name: "Administrator",
                description:
                  "Vollständiger Zugriff auf den Administrationsbereich.",
                isSystem: true,
              },
            });

          const user = existingUser
            ? await transaction.user.update({
                where: {
                  id: existingUser.id,
                },

                data: {
                  displayName,
                  email,
                  passwordHash,
                  status:
                    UserStatus.ACTIVE,
                  isSystemUser: false,

                  /*
                   * Bereits vorhandene Sitzungen des Benutzers
                   * werden ungültig, da das Passwort geändert wird.
                   */
                  sessionVersion: {
                    increment: 1,
                  },
                },
              })
            : await transaction.user.create({
                data: {
                  displayName,
                  email,
                  passwordHash,
                  status:
                    UserStatus.ACTIVE,
                  isSystemUser: false,
                },
              });

          await transaction.userRole.upsert({
            where: {
              userId_roleId: {
                userId: user.id,
                roleId: adminRole.id,
              },
            },

            update: {},

            create: {
              userId: user.id,
              roleId: adminRole.id,
            },
          });

          return {
            user,
            adminRole,
            updatedExistingUser:
              Boolean(existingUser),
          };
        },
      );

    console.log("");
    console.log(
      result.updatedExistingUser
        ? "Der bestehende Benutzer wurde erfolgreich als Administrator eingerichtet."
        : "Der Administrator wurde erfolgreich erstellt.",
    );

    console.log("");
    console.log(
      `Benutzer-ID: ${result.user.id}`,
    );
    console.log(
      `Name:        ${result.user.displayName}`,
    );
    console.log(
      `E-Mail:      ${result.user.email}`,
    );
    console.log(
      `Status:      ${result.user.status}`,
    );
    console.log(
      `Rolle:       ${result.adminRole.name} (${result.adminRole.key})`,
    );
    console.log("");

    console.log(
      "Das Konto ist bereits aktiviert und benötigt keinen Aktivierungscode.",
    );

    console.log(
      "Die Anmeldung ist unter /portal/login möglich.",
    );
    console.log("");
  } finally {
    readline.close();
  }
}

async function hashPassword(
  password: string,
): Promise<string> {
  const salt =
    randomBytes(16).toString("hex");

  const derivedKey = (await scrypt(
    password,
    salt,
    64,
  )) as Buffer;

  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

function validateDisplayName(
  displayName: string,
): void {
  if (displayName.length < 2) {
    throw new Error(
      "Der Anzeigename muss mindestens 2 Zeichen lang sein.",
    );
  }

  if (displayName.length > 100) {
    throw new Error(
      "Der Anzeigename darf höchstens 100 Zeichen lang sein.",
    );
  }
}

function validateEmail(
  email: string,
): void {
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email,
    )
  ) {
    throw new Error(
      "Bitte gib eine gültige E-Mail-Adresse ein.",
    );
  }
}

function validatePassword(
  password: string,
  confirmation: string,
): void {
  if (password.length < 12) {
    throw new Error(
      "Das Passwort muss mindestens 12 Zeichen lang sein.",
    );
  }

  if (password.length > 128) {
    throw new Error(
      "Das Passwort darf höchstens 128 Zeichen lang sein.",
    );
  }

  if (!/[a-z]/.test(password)) {
    throw new Error(
      "Das Passwort muss mindestens einen Kleinbuchstaben enthalten.",
    );
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error(
      "Das Passwort muss mindestens einen Großbuchstaben enthalten.",
    );
  }

  if (!/[0-9]/.test(password)) {
    throw new Error(
      "Das Passwort muss mindestens eine Zahl enthalten.",
    );
  }

  if (password !== confirmation) {
    throw new Error(
      "Die beiden Passwörter stimmen nicht überein.",
    );
  }
}

function normalizeEmail(
  email: string,
): string {
  return email
    .trim()
    .toLowerCase();
}

function printHeader(): void {
  console.log("");
  console.log(
    "Administrator für Historische Schiene erstellen",
  );
  console.log(
    "------------------------------------------------",
  );
  console.log("");
}

main()
  .catch((error: unknown) => {
    console.error("");
    console.error(
      "Administrator konnte nicht eingerichtet werden.",
    );

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });