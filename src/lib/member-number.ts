import "server-only";

import type { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

const MEMBER_SEQUENCE_KEY = "MEMBER";
const DEFAULT_MEMBER_NUMBER_PREFIX = "HS";
const DEFAULT_MEMBER_NUMBER_DIGITS = 6;

type TransactionClient = Prisma.TransactionClient;

function getMemberNumberPrefix(): string {
  const prefix =
    process.env.MEMBER_NUMBER_PREFIX?.trim().toUpperCase() ||
    DEFAULT_MEMBER_NUMBER_PREFIX;

  if (!/^[A-Z0-9]{2,8}$/.test(prefix)) {
    throw new Error(
      "MEMBER_NUMBER_PREFIX muss aus 2 bis 8 Großbuchstaben oder Ziffern bestehen.",
    );
  }

  return prefix;
}

function getMemberNumberDigits(): number {
  const configuredDigits = Number(
    process.env.MEMBER_NUMBER_DIGITS ??
      DEFAULT_MEMBER_NUMBER_DIGITS,
  );

  if (
    !Number.isInteger(configuredDigits) ||
    configuredDigits < 3 ||
    configuredDigits > 12
  ) {
    throw new Error(
      "MEMBER_NUMBER_DIGITS muss eine ganze Zahl zwischen 3 und 12 sein.",
    );
  }

  return configuredDigits;
}

export function formatMemberNumber(sequenceValue: number): string {
  if (!Number.isInteger(sequenceValue) || sequenceValue < 1) {
    throw new Error(
      "Eine Mitgliedsnummer kann nur aus einer positiven laufenden Nummer erzeugt werden.",
    );
  }

  const prefix = getMemberNumberPrefix();
  const digits = getMemberNumberDigits();

  return `${prefix}-${String(sequenceValue).padStart(digits, "0")}`;
}

async function allocateMemberSequenceValue(
  transaction: TransactionClient,
): Promise<number> {
  /*
   * Beim ersten Aufruf wird der Nummernkreis mit nextValue 2 angelegt.
   * Damit wurde die laufende Nummer 1 vergeben.
   *
   * Bei jedem weiteren Aufruf wird nextValue atomar um 1 erhöht.
   * Der vorherige Wert ist die neu vergebene Nummer.
   */
  const sequence = await transaction.numberSequence.upsert({
    where: {
      key: MEMBER_SEQUENCE_KEY,
    },
    create: {
      key: MEMBER_SEQUENCE_KEY,
      nextValue: 2,
      description:
        "Fortlaufender Nummernkreis für Vereinsmitglieder",
    },
    update: {
      nextValue: {
        increment: 1,
      },
    },
    select: {
      nextValue: true,
    },
  });

  return sequence.nextValue - 1;
}

export async function createNextMemberNumber(
  transaction?: TransactionClient,
): Promise<string> {
  if (transaction) {
    const sequenceValue =
      await allocateMemberSequenceValue(transaction);

    return formatMemberNumber(sequenceValue);
  }

  return prisma.$transaction(async (databaseTransaction) => {
    const sequenceValue =
      await allocateMemberSequenceValue(databaseTransaction);

    return formatMemberNumber(sequenceValue);
  });
}