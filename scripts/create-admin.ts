import "dotenv/config";

import {
  randomBytes,
  scrypt as scryptCallback,
} from "node:crypto";
import { promisify } from "node:util";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";

import {
  PrismaClient,
  UserStatus,
} from "../src/generated/prisma/client";
import { getMariaDbConfig } from "../src/lib/database-config";

const scrypt = promisify(scryptCallback);

const adapter = new PrismaMariaDb(getMariaDbConfig());

const prisma = new PrismaClient({
  adapter,
});

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function main(): Promise<void> {
  const readline = createInterface({
    input,
    output,
  });

  try {
    console.log("");
    console.log("Administrator für Historische Schiene erstellen");
    console.log("------------------------------------------------");
    console.log("");

    const displayName = (
      await readline.question("Anzeigename: ")
    ).trim();

    const email = normalizeEmail(
      await readline.question("E-Mail-Adresse: "),
    );

    const password = await readline.question(
      "Passwort (mindestens 8 Zeichen): ",
    );

    const passwordConfirmation = await readline.question(
      "Passwort wiederholen: ",
    );

    if (displayName.length < 2) {
      throw new Error(
        "Der Anzeigename muss mindestens 2 Zeichen lang sein.",
      );
    }

    if (!email.includes("@")) {
      throw new Error(
        "Bitte gib eine gültige E-Mail-Adresse ein.",
      );
    }

    if (password.length < 8) {
      throw new Error(
        "Das Passwort muss mindestens 8 Zeichen lang sein.",
      );
    }

    if (password !== passwordConfirmation) {
      throw new Error(
        "Die beiden Passwörter stimmen nicht überein.",
      );
    }

    const adminRole = await prisma.role.findUnique({
      where: {
        key: "ADMIN",
      },
    });

    if (!adminRole) {
      throw new Error(
        'Die Rolle "ADMIN" wurde nicht gefunden. Führe zuerst "npx prisma db seed" aus.',
      );
    }

    const passwordHash = await hashPassword(password);

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    const user = existingUser
      ? await prisma.user.update({
          where: {
            id: existingUser.id,
          },
          data: {
            displayName,
            passwordHash,
            status: UserStatus.ACTIVE,
            isSystemUser: false,
          },
        })
      : await prisma.user.create({
          data: {
            displayName,
            email,
            passwordHash,
            status: UserStatus.ACTIVE,
            isSystemUser: false,
          },
        });

    await prisma.userRole.upsert({
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

    console.log("");
    console.log("Administrator wurde erfolgreich eingerichtet.");
    console.log("");
    console.log(`Name:   ${user.displayName}`);
    console.log(`E-Mail: ${user.email}`);
    console.log(`Status: ${user.status}`);
    console.log(`Rolle:  ${adminRole.name}`);
    console.log("");
    console.log(
      "Du kannst dich jetzt unter /portal/login anmelden.",
    );
  } finally {
    readline.close();
  }
}

main()
  .catch((error: unknown) => {
    console.error("");
    console.error("Administrator konnte nicht erstellt werden.");

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