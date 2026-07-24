import type {
  MembershipType,
} from "@/generated/prisma/client";

import {
  assertValidMembershipStartDate,
  formatContributionMonth,
  getAdmissionFeeCents,
  getMembershipFee,
  getMonthlyMembershipFeeCents,
} from "@/config/membership-fees";

export type MembershipBillingProfileInput = {
  monthlyFeeOverrideCents?: number | null;
  admissionFeeOverrideCents?: number | null;
  admissionFeeChargedAt?: Date | null;
  contributionExemptUntil?: Date | null;
};

export type MemberBillingInput = {
  memberId: number;
  membershipNumber: string;
  membershipType: MembershipType;
  joinedAt: Date;
  leftAt?: Date | null;
  billingProfile?: MembershipBillingProfileInput | null;
};

export type MembershipChargeItemDraft = {
  type:
    | "MEMBERSHIP_FEE"
    | "ADMISSION_FEE";

  description: string;
  quantity: number;
  unitAmountCents: number;
  totalAmountCents: number;
};

export type MembershipChargeDraft = {
  memberId: number;

  billingYear: number;
  billingMonth: number;

  membershipType: MembershipType;
  membershipLabel: string;

  monthlyAmountCents: number;
  admissionFeeCents: number;
  totalAmountCents: number;

  items: MembershipChargeItemDraft[];
};

export type MembershipChargeResult =
  | {
      chargeable: true;
      charge: MembershipChargeDraft;
    }
  | {
      chargeable: false;
      reason:
        | "NOT_JOINED_YET"
        | "MEMBERSHIP_ENDED"
        | "CONTRIBUTION_EXEMPT"
        | "FREE_MEMBERSHIP";
    };

/**
 * Erstellt die Berechnungsgrundlage für einen Monatsbeitrag.
 *
 * Diese Funktion speichert noch nichts in der Datenbank.
 * Sie berechnet lediglich die unveränderlichen Werte, die
 * später in MembershipCharge und InvoiceItem übernommen werden.
 */
export function buildMembershipCharge(
  member: MemberBillingInput,
  billingYear: number,
  billingMonth: number,
): MembershipChargeResult {
  assertValidMember(member);
  assertValidBillingPeriod(
    billingYear,
    billingMonth,
  );

  const billingDate =
    createBillingDate(
      billingYear,
      billingMonth,
    );

  if (
    billingDate.getTime() <
    member.joinedAt.getTime()
  ) {
    return {
      chargeable: false,
      reason: "NOT_JOINED_YET",
    };
  }

  if (
    member.leftAt &&
    billingDate.getTime() >=
      getFirstDayOfMonth(
        member.leftAt,
      ).getTime()
  ) {
    return {
      chargeable: false,
      reason: "MEMBERSHIP_ENDED",
    };
  }

  const billingProfile =
    member.billingProfile ?? null;

  if (
    billingProfile
      ?.contributionExemptUntil &&
    billingDate.getTime() <=
      getLastDayOfMonth(
        billingProfile
          .contributionExemptUntil,
      ).getTime()
  ) {
    return {
      chargeable: false,
      reason: "CONTRIBUTION_EXEMPT",
    };
  }

  const feeDefinition =
    getMembershipFee(
      member.membershipType,
      billingYear,
    );

  if (feeDefinition.isFree) {
    return {
      chargeable: false,
      reason: "FREE_MEMBERSHIP",
    };
  }

  const monthlyAmountCents =
    resolveMonthlyAmountCents(
      member.membershipType,
      billingYear,
      billingProfile,
    );

  const admissionFeeCents =
    resolveAdmissionFeeCents(
      member,
      billingYear,
      billingMonth,
    );

  const contributionMonth =
    formatContributionMonth(
      billingYear,
      billingMonth,
    );

  const items: MembershipChargeItemDraft[] = [
    {
      type: "MEMBERSHIP_FEE",
      description:
        `Mitgliedsbeitrag ${contributionMonth}`,
      quantity: 1,
      unitAmountCents:
        monthlyAmountCents,
      totalAmountCents:
        monthlyAmountCents,
    },
  ];

  if (admissionFeeCents > 0) {
    items.push({
      type: "ADMISSION_FEE",
      description:
        "Einmalige Aufnahmegebühr",
      quantity: 1,
      unitAmountCents:
        admissionFeeCents,
      totalAmountCents:
        admissionFeeCents,
    });
  }

  return {
    chargeable: true,

    charge: {
      memberId: member.memberId,

      billingYear,
      billingMonth,

      membershipType:
        member.membershipType,

      membershipLabel:
        feeDefinition.label,

      monthlyAmountCents,
      admissionFeeCents,

      totalAmountCents:
        monthlyAmountCents +
        admissionFeeCents,

      items,
    },
  };
}

function resolveMonthlyAmountCents(
  membershipType: MembershipType,
  billingYear: number,
  billingProfile:
    | MembershipBillingProfileInput
    | null,
): number {
  const override =
    billingProfile
      ?.monthlyFeeOverrideCents;

  if (
    override !== undefined &&
    override !== null
  ) {
    assertValidAmount(
      override,
      "individueller Monatsbeitrag",
    );

    return override;
  }

  return getMonthlyMembershipFeeCents(
  membershipType,
  billingYear,
);
}

function resolveAdmissionFeeCents(
  member: MemberBillingInput,
  billingYear: number,
  billingMonth: number,
): number {
  const billingProfile =
    member.billingProfile ?? null;

  if (
    billingProfile
      ?.admissionFeeChargedAt
  ) {
    return 0;
  }

  const isJoiningMonth =
    member.joinedAt.getUTCFullYear() ===
      billingYear &&
    member.joinedAt.getUTCMonth() + 1 ===
      billingMonth;

  if (!isJoiningMonth) {
    return 0;
  }

  const override =
    billingProfile
      ?.admissionFeeOverrideCents;

  if (
    override !== undefined &&
    override !== null
  ) {
    assertValidAmount(
      override,
      "individuelle Aufnahmegebühr",
    );

    return override;
  }

  return getAdmissionFeeCents(
    member.membershipType,
    billingYear,
  );
}

function assertValidMember(
  member: MemberBillingInput,
): void {
  if (
    !Number.isInteger(
      member.memberId,
    ) ||
    member.memberId < 1
  ) {
    throw new Error(
      "Die Mitglieds-ID ist ungültig.",
    );
  }

  if (
    !member.membershipNumber.trim()
  ) {
    throw new Error(
      "Die Mitgliedsnummer fehlt.",
    );
  }

  assertValidDate(
    member.joinedAt,
    "Eintrittsdatum",
  );

  assertValidMembershipStartDate(
    member.joinedAt,
  );

  if (member.leftAt) {
    assertValidDate(
      member.leftAt,
      "Austrittsdatum",
    );

    if (
      member.leftAt.getTime() <
      member.joinedAt.getTime()
    ) {
      throw new Error(
        "Das Austrittsdatum darf nicht vor dem Eintrittsdatum liegen.",
      );
    }
  }
}

function assertValidBillingPeriod(
  year: number,
  month: number,
): void {
  if (
    !Number.isInteger(year) ||
    year < 2_000 ||
    year > 9_999
  ) {
    throw new Error(
      `Ungültiges Beitragsjahr: ${year}`,
    );
  }

  if (
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    throw new Error(
      `Ungültiger Beitragsmonat: ${month}`,
    );
  }
}

function assertValidAmount(
  amountCents: number,
  fieldName: string,
): void {
  if (
    !Number.isSafeInteger(
      amountCents,
    ) ||
    amountCents < 0
  ) {
    throw new Error(
      `Der Wert für „${fieldName}“ ist ungültig.`,
    );
  }
}

function assertValidDate(
  date: Date,
  fieldName: string,
): void {
  if (
    !(date instanceof Date) ||
    Number.isNaN(date.getTime())
  ) {
    throw new Error(
      `${fieldName} ist ungültig.`,
    );
  }
}

function createBillingDate(
  year: number,
  month: number,
): Date {
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

function getFirstDayOfMonth(
  date: Date,
): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      1,
      12,
      0,
      0,
    ),
  );
}

function getLastDayOfMonth(
  date: Date,
): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    ),
  );
}