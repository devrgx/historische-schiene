import type {
  MembershipType,
} from "@/generated/prisma/client";

export type MembershipFeeDefinition = {
  label: string;
  shortLabel: string;
  description: string;

  /**
   * Monatlicher Mitgliedsbeitrag in Cent.
   *
   * 1_200 = 12,00 €
   */
  monthlyAmountCents: number;

  /**
   * Bestimmt, ob für diese Mitgliedschaft eine
   * einmalige Aufnahmegebühr berechnet wird.
   */
  chargeAdmissionFee: boolean;

  /**
   * Beitragsfreie Mitgliedschaft.
   */
  isFree: boolean;
};

export type MembershipFeeSchedule = {
  year: number;

  resolution: {
    decidedAt: string | null;
    effectiveFrom: string;
    note: string | null;
  };

  /**
   * Einmalige Aufnahmegebühr in Cent.
   */
  admissionFeeCents: number;

  memberships: Record<
    MembershipType,
    MembershipFeeDefinition
  >;
};

/**
 * Beitragsstände nach Kalenderjahr.
 *
 * Für jedes Kalenderjahr muss ein eigener Eintrag vorhanden sein.
 * Alte Jahre sollten nachträglich nicht mehr verändert werden.
 *
 * Ausgestellte Rechnungen speichern die verwendeten Daten
 * zusätzlich als unveränderlichen Snapshot.
 */
export const membershipFeeSchedules = {
  2026: {
    year: 2026,

    resolution: {
      decidedAt: null,
      effectiveFrom: "2026-01-01",
      note:
        "Vorläufige Beitragskonfiguration für das Kalenderjahr 2026.",
    },

    admissionFeeCents: 500,

    memberships: {
      ADULT: {
        label: "Volljährige Person",
        shortLabel: "Volljährig",

        description:
          "Ordentliche Mitgliedschaft für volljährige natürliche Personen.",

        monthlyAmountCents: 1_200,

        chargeAdmissionFee: true,
        isFree: false,
      },

      REDUCED: {
        label: "Ermäßigte Mitgliedschaft",
        shortLabel: "Ermäßigt",

        description:
          "Ermäßigte Mitgliedschaft entsprechend der gültigen Beitragsordnung.",

        monthlyAmountCents: 600,

        chargeAdmissionFee: true,
        isFree: false,
      },

      LEGAL_ENTITY: {
        label: "Juristische Person",
        shortLabel: "Juristische Person",

        description:
          "Mitgliedschaft für Vereine, Unternehmen, Körperschaften und andere juristische Personen.",

        monthlyAmountCents: 5_000,

        chargeAdmissionFee: true,
        isFree: false,
      },

      HONORARY: {
        label: "Ehrenmitgliedschaft",
        shortLabel: "Ehrenmitglied",

        description:
          "Beitragsfreie Ehrenmitgliedschaft.",

        monthlyAmountCents: 0,

        chargeAdmissionFee: false,
        isFree: true,
      },
    },
  },
} satisfies Record<
  number,
  MembershipFeeSchedule
>;

export function getMembershipFeeSchedule(
  year: number,
): MembershipFeeSchedule {
  assertValidYear(year);

  const schedules =
    membershipFeeSchedules as Record<
      number,
      MembershipFeeSchedule | undefined
    >;

  const schedule = schedules[year];

  if (!schedule) {
    throw new Error(
      `Für das Kalenderjahr ${year} ist keine Beitragskonfiguration hinterlegt.`,
    );
  }

  return schedule;
}

export function getMembershipFeeScheduleForDate(
  date: Date,
): MembershipFeeSchedule {
  assertValidDate(date);

  return getMembershipFeeSchedule(
    date.getUTCFullYear(),
  );
}

export function getMembershipFee(
  membershipType: MembershipType,
  year: number,
): MembershipFeeDefinition {
  return getMembershipFeeSchedule(year)
    .memberships[membershipType];
}

export function getMonthlyMembershipFeeCents(
  membershipType: MembershipType,
  year: number,
): number {
  const fee = getMembershipFee(
    membershipType,
    year,
  );

  return fee.isFree
    ? 0
    : fee.monthlyAmountCents;
}

export function getAdmissionFeeCents(
  membershipType: MembershipType,
  year: number,
): number {
  const schedule =
    getMembershipFeeSchedule(year);

  const fee =
    schedule.memberships[membershipType];

  if (!fee.chargeAdmissionFee) {
    return 0;
  }

  return schedule.admissionFeeCents;
}

/**
 * Ein Beitritt ist ausschließlich zum ersten Tag
 * eines Monats zulässig.
 */
export function isValidMembershipStartDate(
  date: Date,
): boolean {
  return (
    date instanceof Date &&
    !Number.isNaN(date.getTime()) &&
    date.getUTCDate() === 1
  );
}

export function assertValidMembershipStartDate(
  date: Date,
): void {
  assertValidDate(date);

  if (!isValidMembershipStartDate(date)) {
    throw new Error(
      "Ein Eintritt ist ausschließlich zum ersten Tag eines Monats möglich.",
    );
  }
}

/**
 * Monat entspricht der üblichen Schreibweise:
 *
 * Januar = 1
 * Dezember = 12
 */
export function createMembershipStartDate(
  year: number,
  month: number,
): Date {
  assertValidYear(year);
  assertValidMonth(month);

  return new Date(
    Date.UTC(
      year,
      month - 1,
      1,
      12,
      0,
      0,
    ),
  );
}

export function formatEuroAmount(
  amountCents: number,
): string {
  assertValidAmount(amountCents);

  return new Intl.NumberFormat(
    "de-DE",
    {
      style: "currency",
      currency: "EUR",
    },
  ).format(amountCents / 100);
}

export function formatContributionMonth(
  year: number,
  month: number,
): string {
  const date =
    createMembershipStartDate(
      year,
      month,
    );

  return new Intl.DateTimeFormat(
    "de-DE",
    {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    },
  ).format(date);
}

export function getMembershipTypeLabel(
  membershipType: MembershipType,
  year: number,
): string {
  return getMembershipFee(
    membershipType,
    year,
  ).label;
}

export function getMembershipTypeShortLabel(
  membershipType: MembershipType,
  year: number,
): string {
  return getMembershipFee(
    membershipType,
    year,
  ).shortLabel;
}

function assertValidAmount(
  amountCents: number,
): void {
  if (
    !Number.isSafeInteger(amountCents) ||
    amountCents < 0
  ) {
    throw new Error(
      `Ungültiger Geldbetrag: ${amountCents}`,
    );
  }
}

function assertValidYear(
  year: number,
): void {
  if (
    !Number.isInteger(year) ||
    year < 2_000 ||
    year > 9_999
  ) {
    throw new Error(
      `Ungültiges Kalenderjahr: ${year}`,
    );
  }
}

function assertValidMonth(
  month: number,
): void {
  if (
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    throw new Error(
      `Ungültiger Kalendermonat: ${month}`,
    );
  }
}

function assertValidDate(
  date: Date,
): void {
  if (
    !(date instanceof Date) ||
    Number.isNaN(date.getTime())
  ) {
    throw new Error(
      "Es wurde kein gültiges Datum übergeben.",
    );
  }
}