"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export type MembershipApplicationState = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

const validMembershipTypes = [
  "REGULAR",
  "REDUCED",
  "SUPPORTING",
] as const;

type ValidMembershipType =
  (typeof validMembershipTypes)[number];

function getString(
  formData: FormData,
  name: string,
): string {
  const value = formData.get(name);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function getOptionalString(
  formData: FormData,
  name: string,
): string | null {
  const value = getString(formData, name);

  return value.length > 0 ? value : null;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidGermanPostalCode(
  value: string,
): boolean {
  return /^\d{5}$/.test(value);
}

function parseBirthDate(
  value: string,
): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const [
    expectedYear,
    expectedMonth,
    expectedDay,
  ] = value.split("-").map(Number);

  if (
    date.getUTCFullYear() !== expectedYear ||
    date.getUTCMonth() + 1 !== expectedMonth ||
    date.getUTCDate() !== expectedDay
  ) {
    return null;
  }

  return date;
}

function calculateAge(
  birthDate: Date,
  referenceDate = new Date(),
): number {
  let age =
    referenceDate.getUTCFullYear() -
    birthDate.getUTCFullYear();

  const birthdayOccurred =
    referenceDate.getUTCMonth() >
      birthDate.getUTCMonth() ||
    (referenceDate.getUTCMonth() ===
      birthDate.getUTCMonth() &&
      referenceDate.getUTCDate() >=
        birthDate.getUTCDate());

  if (!birthdayOccurred) {
    age -= 1;
  }

  return age;
}

function parseMembershipType(
  value: string,
): ValidMembershipType | null {
  return validMembershipTypes.includes(
    value as ValidMembershipType,
  )
    ? (value as ValidMembershipType)
    : null;
}

export async function submitMembershipApplication(
  _previousState: MembershipApplicationState,
  formData: FormData,
): Promise<MembershipApplicationState> {
  const firstName = getString(
    formData,
    "firstName",
  );

  const lastName = getString(
    formData,
    "lastName",
  );

  const birthDateValue = getString(
    formData,
    "birthDate",
  );

  const birthDate = parseBirthDate(
    birthDateValue,
  );

  const email = getString(
    formData,
    "email",
  ).toLowerCase();

  const phone = getOptionalString(
    formData,
    "phone",
  );

  const street = getString(
    formData,
    "street",
  );

  const houseNumber = getString(
    formData,
    "houseNumber",
  );

  const postalCode = getString(
    formData,
    "postalCode",
  );

  const city = getString(
    formData,
    "city",
  );

  const membershipType =
    parseMembershipType(
      getString(formData, "membershipType"),
    );

  const occupation = getOptionalString(
    formData,
    "occupation",
  );

  const railwayQualification =
    getOptionalString(
      formData,
      "railwayQualification",
    );

  const telegramUsername =
    getOptionalString(
      formData,
      "telegramUsername",
    );

  const emergencyContactName =
    getOptionalString(
      formData,
      "emergencyContactName",
    );

  const emergencyContactPhone =
    getOptionalString(
      formData,
      "emergencyContactPhone",
    );

  const guardianFirstName =
    getOptionalString(
      formData,
      "guardianFirstName",
    );

  const guardianLastName =
    getOptionalString(
      formData,
      "guardianLastName",
    );

  const guardianEmailValue =
    getOptionalString(
      formData,
      "guardianEmail",
    );

  const guardianEmail =
    guardianEmailValue?.toLowerCase() ?? null;

  const guardianPhone =
    getOptionalString(
      formData,
      "guardianPhone",
    );

  const guardianRelationship =
    getOptionalString(
      formData,
      "guardianRelationship",
    );

  const guardianNameConfirmation =
    getOptionalString(
      formData,
      "guardianNameConfirmation",
    );

  const guardianConsentAccepted =
    formData.get("guardianConsentAccepted") ===
    "on";

  const guardianAuthorityConfirmed =
    formData.get(
      "guardianAuthorityConfirmed",
    ) === "on";

  const message = getOptionalString(
    formData,
    "message",
  );

  const privacyAccepted =
    formData.get("privacyAccepted") === "on";

  const statutesAccepted =
    formData.get("statutesAccepted") === "on";

  const contributionRulesAccepted =
    formData.get(
      "contributionRulesAccepted",
    ) === "on";

  const errors: Record<string, string> = {};

  if (firstName.length < 2) {
    errors.firstName =
      "Bitte gib deinen Vornamen an.";
  }

  if (lastName.length < 2) {
    errors.lastName =
      "Bitte gib deinen Nachnamen an.";
  }

  if (!birthDate) {
    errors.birthDate =
      "Bitte gib ein gültiges Geburtsdatum an.";
  }

  const age = birthDate
    ? calculateAge(birthDate)
    : null;

  if (age !== null && age < 0) {
    errors.birthDate =
      "Das Geburtsdatum darf nicht in der Zukunft liegen.";
  }

  if (age !== null && age > 120) {
    errors.birthDate =
      "Bitte prüfe das angegebene Geburtsdatum.";
  }

  const isMinor =
    age !== null && age >= 0 && age < 18;

  if (!isValidEmail(email)) {
    errors.email =
      "Bitte gib eine gültige E-Mail-Adresse an.";
  }

  if (street.length < 2) {
    errors.street =
      "Bitte gib deine Straße an.";
  }

  if (houseNumber.length < 1) {
    errors.houseNumber =
      "Bitte gib deine Hausnummer an.";
  }

  if (!isValidGermanPostalCode(postalCode)) {
    errors.postalCode =
      "Bitte gib eine fünfstellige Postleitzahl an.";
  }

  if (city.length < 2) {
    errors.city =
      "Bitte gib deinen Wohnort an.";
  }

  if (!membershipType) {
    errors.membershipType =
      "Bitte wähle eine Mitgliedsform aus.";
  }

  if (isMinor) {
    if (!emergencyContactName) {
      errors.emergencyContactName =
        "Bei Minderjährigen ist ein Notfallkontakt erforderlich.";
    }

    if (!emergencyContactPhone) {
      errors.emergencyContactPhone =
        "Bitte gib die Telefonnummer des Notfallkontakts an.";
    }

    if (!guardianFirstName) {
      errors.guardianFirstName =
        "Bitte gib den Vornamen des Sorgeberechtigten an.";
    }

    if (!guardianLastName) {
      errors.guardianLastName =
        "Bitte gib den Nachnamen des Sorgeberechtigten an.";
    }

    if (
      !guardianEmail ||
      !isValidEmail(guardianEmail)
    ) {
      errors.guardianEmail =
        "Bitte gib eine gültige E-Mail-Adresse des Sorgeberechtigten an.";
    }

    if (!guardianPhone) {
      errors.guardianPhone =
        "Bitte gib eine Telefonnummer des Sorgeberechtigten an.";
    }

    if (!guardianRelationship) {
      errors.guardianRelationship =
        "Bitte gib das Verhältnis zur minderjährigen Person an.";
    }

    if (!guardianNameConfirmation) {
      errors.guardianNameConfirmation =
        "Bitte bestätige den vollständigen Namen des Sorgeberechtigten.";
    }

    if (!guardianConsentAccepted) {
      errors.guardianConsentAccepted =
        "Die Zustimmung zur Mitgliedschaft ist erforderlich.";
    }

    if (!guardianAuthorityConfirmed) {
      errors.guardianAuthorityConfirmed =
        "Die Sorgeberechtigung muss bestätigt werden.";
    }
  }

  if (!privacyAccepted) {
    errors.privacyAccepted =
      "Die Datenschutzerklärung muss bestätigt werden.";
  }

  if (!statutesAccepted) {
    errors.statutesAccepted =
      "Die Satzung muss bestätigt werden.";
  }

  if (!contributionRulesAccepted) {
    errors.contributionRulesAccepted =
      "Die Beitragsordnung muss bestätigt werden.";
  }

  if (
    Object.keys(errors).length > 0 ||
    !birthDate ||
    !membershipType
  ) {
    return {
      success: false,
      message:
        "Bitte prüfe die markierten Angaben.",
      errors,
    };
  }

  const existingOpenApplication =
    await prisma.membershipApplication.findFirst({
      where: {
        email,
        status: {
          in: [
            "PENDING",
            "IN_REVIEW",
            "APPROVED",
          ],
        },
      },
      select: {
        id: true,
      },
    });

  if (existingOpenApplication) {
    return {
      success: false,
      message:
        "Für diese E-Mail-Adresse besteht bereits ein offener oder genehmigter Antrag.",
      errors: {
        email:
          "Für diese E-Mail-Adresse besteht bereits ein Antrag.",
      },
    };
  }

  await prisma.membershipApplication.create({
    data: {
      firstName,
      lastName,
      birthDate,

      email,
      phone,

      street,
      houseNumber,
      postalCode,
      city,
      country: "Deutschland",

      membershipType,

      occupation,
      railwayQualification,
      telegramUsername,

      emergencyContactName,
      emergencyContactPhone,

      isMinor,

      guardianFirstName:
        isMinor ? guardianFirstName : null,

      guardianLastName:
        isMinor ? guardianLastName : null,

      guardianEmail:
        isMinor ? guardianEmail : null,

      guardianPhone:
        isMinor ? guardianPhone : null,

      guardianRelationship:
        isMinor ? guardianRelationship : null,

      guardianNameConfirmation:
        isMinor
          ? guardianNameConfirmation
          : null,

      guardianConsentAccepted:
        isMinor && guardianConsentAccepted,

      guardianAuthorityConfirmed:
        isMinor && guardianAuthorityConfirmed,

      guardianConsentAt:
        isMinor ? new Date() : null,

      message,

      privacyAccepted,
      statutesAccepted,
      contributionRulesAccepted,

      privacyVersion: "Entwurf Juli 2026",
      statutesVersion: "Entwurf Juli 2026",
      contributionRulesVersion:
        "Entwurf Juli 2026",
    },
  });

  redirect(
    "/mitmachen/antrag/erfolgreich",
  );
}