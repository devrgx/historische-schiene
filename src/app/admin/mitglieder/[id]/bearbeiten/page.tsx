import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  HeartHandshake,
  House,
  Mail,
  Phone,
  Save,
  TrainFront,
  UserRound,
  Users,
} from "lucide-react";

import {
  MemberStatus,
  MembershipType,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type EditMemberPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    error?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Mitglied bearbeiten",
};

export const dynamic = "force-dynamic";

export default async function EditMemberPage({
  params,
  searchParams,
}: EditMemberPageProps) {
  const { id } = await params;
  const { error } = await searchParams;

  const memberId = Number(id);

  if (!Number.isInteger(memberId) || memberId < 1) {
    notFound();
  }

  const member = await prisma.member.findUnique({
    where: {
      id: memberId,
    },
  });

  if (!member) {
    notFound();
  }

  async function updateMemberAction(formData: FormData) {
    "use server";

    const currentMemberId = Number(formData.get("memberId"));

    if (!Number.isInteger(currentMemberId) || currentMemberId < 1) {
      notFound();
    }

    const firstName = getRequiredText(formData, "firstName");
    const lastName = getRequiredText(formData, "lastName");
    const birthDateValue = getRequiredText(formData, "birthDate");

    const street = getRequiredText(formData, "street");
    const houseNumber = getRequiredText(formData, "houseNumber");
    const postalCode = getRequiredText(formData, "postalCode");
    const city = getRequiredText(formData, "city");
    const country = getRequiredText(formData, "country");

    const email = getOptionalText(formData, "email");
    const phone = getOptionalText(formData, "phone");

    const occupation = getOptionalText(formData, "occupation");
    const railwayQualification = getOptionalText(
      formData,
      "railwayQualification",
    );
    const telegramUsername = getOptionalText(
      formData,
      "telegramUsername",
    );

    const emergencyContactName = getOptionalText(
      formData,
      "emergencyContactName",
    );
    const emergencyContactPhone = getOptionalText(
      formData,
      "emergencyContactPhone",
    );

    const guardianFirstName = getOptionalText(
      formData,
      "guardianFirstName",
    );
    const guardianLastName = getOptionalText(
      formData,
      "guardianLastName",
    );
    const guardianEmail = getOptionalText(
      formData,
      "guardianEmail",
    );
    const guardianPhone = getOptionalText(
      formData,
      "guardianPhone",
    );
    const guardianRelationship = getOptionalText(
      formData,
      "guardianRelationship",
    );

    const membershipTypeValue = getRequiredText(
      formData,
      "membershipType",
    );
    const statusValue = getRequiredText(formData, "status");

    const joinedAtValue = getOptionalText(formData, "joinedAt");
    const leftAtValue = getOptionalText(formData, "leftAt");

    const birthDate = parseDateInput(birthDateValue);
    const joinedAt = joinedAtValue
      ? parseDateInput(joinedAtValue)
      : null;
    const leftAt = leftAtValue
      ? parseDateInput(leftAtValue)
      : null;

    if (
      !firstName ||
      !lastName ||
      !birthDate ||
      !street ||
      !houseNumber ||
      !postalCode ||
      !city ||
      !country
    ) {
      redirect(
        `/admin/mitglieder/${currentMemberId}/bearbeiten?error=required`,
      );
    }

    if (
      !Object.values(MembershipType).includes(
        membershipTypeValue as MembershipType,
      )
    ) {
      redirect(
        `/admin/mitglieder/${currentMemberId}/bearbeiten?error=invalid`,
      );
    }

    if (
      !Object.values(MemberStatus).includes(
        statusValue as MemberStatus,
      )
    ) {
      redirect(
        `/admin/mitglieder/${currentMemberId}/bearbeiten?error=invalid`,
      );
    }

    if (email && !isValidEmail(email)) {
      redirect(
        `/admin/mitglieder/${currentMemberId}/bearbeiten?error=email`,
      );
    }

    if (!/^[0-9]{5}$/.test(postalCode)) {
      redirect(
        `/admin/mitglieder/${currentMemberId}/bearbeiten?error=postal-code`,
      );
    }

    const isMinor = calculateAge(birthDate) < 18;

    await prisma.member.update({
      where: {
        id: currentMemberId,
      },
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
        country,

        occupation,
        railwayQualification,
        telegramUsername,

        emergencyContactName,
        emergencyContactPhone,

        isMinor,

        guardianFirstName: isMinor
          ? guardianFirstName
          : null,
        guardianLastName: isMinor
          ? guardianLastName
          : null,
        guardianEmail: isMinor ? guardianEmail : null,
        guardianPhone: isMinor ? guardianPhone : null,
        guardianRelationship: isMinor
          ? guardianRelationship
          : null,

        membershipType:
          membershipTypeValue as MembershipType,
        status: statusValue as MemberStatus,

        joinedAt,
        leftAt,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/mitglieder");
    revalidatePath(`/admin/mitglieder/${currentMemberId}`);

    redirect(
      `/admin/mitglieder/${currentMemberId}?updated=true`,
    );
  }

  return (
    <>
      <Link
        href={`/admin/mitglieder/${member.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-content"
      >
        <ArrowLeft size={17} />
        Zurück zur Mitgliedsakte
      </Link>

      <section className="mt-6">
        <p className="text-sm font-semibold text-accent-light">
          Mitgliederverwaltung
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-content sm:text-4xl">
          Mitglied bearbeiten
        </h1>

        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Stammdaten und Mitgliedschaft von {member.firstName}{" "}
          {member.lastName} ({member.membershipNumber}) bearbeiten.
        </p>
      </section>

      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100"
        >
          {getErrorMessage(error)}
        </div>
      ) : null}

      <form
        action={updateMemberAction}
        className="mt-8 space-y-6"
      >
        <input
          type="hidden"
          name="memberId"
          value={member.id}
        />

        <FormSection
          title="Persönliche Daten"
          description="Name, Geburtsdatum und Kontaktdaten"
          icon={UserRound}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Vorname"
              name="firstName"
              defaultValue={member.firstName}
              required
            />

            <TextField
              label="Nachname"
              name="lastName"
              defaultValue={member.lastName}
              required
            />

            <TextField
              label="Geburtsdatum"
              name="birthDate"
              type="date"
              defaultValue={formatInputDate(member.birthDate)}
              required
              icon={CalendarDays}
            />

            <TextField
              label="E-Mail-Adresse"
              name="email"
              type="email"
              defaultValue={member.email ?? ""}
              icon={Mail}
            />

            <TextField
              label="Telefonnummer"
              name="phone"
              type="tel"
              defaultValue={member.phone ?? ""}
              icon={Phone}
            />

            <TextField
              label="Telegram-Benutzername"
              name="telegramUsername"
              defaultValue={member.telegramUsername ?? ""}
            />
          </div>
        </FormSection>

        <FormSection
          title="Anschrift"
          description="Postalische Anschrift des Mitglieds"
          icon={House}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Straße"
              name="street"
              defaultValue={member.street}
              required
            />

            <TextField
              label="Hausnummer"
              name="houseNumber"
              defaultValue={member.houseNumber}
              required
            />

            <TextField
              label="Postleitzahl"
              name="postalCode"
              inputMode="numeric"
              defaultValue={member.postalCode}
              required
            />

            <TextField
              label="Ort"
              name="city"
              defaultValue={member.city}
              required
            />

            <TextField
              label="Land"
              name="country"
              defaultValue={member.country}
              required
            />
          </div>
        </FormSection>

        <FormSection
          title="Mitgliedschaft"
          description="Mitgliedsart, Status und Zeitraum"
          icon={BadgeCheck}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <SelectField
              label="Mitgliedsart"
              name="membershipType"
              defaultValue={member.membershipType}
              options={[
                {
                  value: MembershipType.REGULAR,
                  label: "Ordentliches Mitglied",
                },
                {
                  value: MembershipType.REDUCED,
                  label: "Ermäßigtes Mitglied",
                },
                {
                  value: MembershipType.SUPPORTING,
                  label: "Fördermitglied",
                },
              ]}
            />

            <SelectField
              label="Mitgliederstatus"
              name="status"
              defaultValue={member.status}
              options={[
                {
                  value: MemberStatus.ACTIVE,
                  label: "Aktiv",
                },
                {
                  value: MemberStatus.INACTIVE,
                  label: "Inaktiv",
                },
                {
                  value: MemberStatus.RESIGNED,
                  label: "Ausgetreten",
                },
                {
                  value: MemberStatus.EXPELLED,
                  label: "Ausgeschlossen",
                },
                {
                  value: MemberStatus.DECEASED,
                  label: "Verstorben",
                },
              ]}
            />

            <TextField
              label="Eintrittsdatum"
              name="joinedAt"
              type="date"
              defaultValue={
                member.joinedAt
                  ? formatInputDate(member.joinedAt)
                  : ""
              }
            />

            <TextField
              label="Austrittsdatum"
              name="leftAt"
              type="date"
              defaultValue={
                member.leftAt
                  ? formatInputDate(member.leftAt)
                  : ""
              }
            />
          </div>

          <div className="mt-5 rounded-xl border border-line bg-page-soft p-4">
            <p className="text-sm font-semibold text-content">
              Mitgliedsnummer
            </p>

            <p className="mt-1 font-mono text-sm text-muted">
              {member.membershipNumber}
            </p>

            <p className="mt-2 text-xs leading-5 text-subtle">
              Die Mitgliedsnummer ist dauerhaft und kann in dieser
              Maske nicht geändert werden.
            </p>
          </div>
        </FormSection>

        <FormSection
          title="Beruf und Eisenbahn"
          description="Freiwillige fachliche Angaben"
          icon={TrainFront}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Beruf oder Tätigkeit"
              name="occupation"
              defaultValue={member.occupation ?? ""}
              icon={BriefcaseBusiness}
            />

            <TextField
              label="Eisenbahnqualifikation"
              name="railwayQualification"
              defaultValue={
                member.railwayQualification ?? ""
              }
              icon={TrainFront}
            />
          </div>
        </FormSection>

        <FormSection
          title="Notfallkontakt"
          description="Kontaktperson für dringende Fälle"
          icon={HeartHandshake}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Name des Notfallkontakts"
              name="emergencyContactName"
              defaultValue={
                member.emergencyContactName ?? ""
              }
            />

            <TextField
              label="Telefonnummer des Notfallkontakts"
              name="emergencyContactPhone"
              type="tel"
              defaultValue={
                member.emergencyContactPhone ?? ""
              }
            />
          </div>
        </FormSection>

        <FormSection
          title="Sorgeberechtigte Person"
          description="Wird nur bei minderjährigen Mitgliedern gespeichert"
          icon={Users}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Vorname"
              name="guardianFirstName"
              defaultValue={
                member.guardianFirstName ?? ""
              }
            />

            <TextField
              label="Nachname"
              name="guardianLastName"
              defaultValue={
                member.guardianLastName ?? ""
              }
            />

            <TextField
              label="E-Mail-Adresse"
              name="guardianEmail"
              type="email"
              defaultValue={member.guardianEmail ?? ""}
            />

            <TextField
              label="Telefonnummer"
              name="guardianPhone"
              type="tel"
              defaultValue={member.guardianPhone ?? ""}
            />

            <TextField
              label="Beziehung zum Mitglied"
              name="guardianRelationship"
              defaultValue={
                member.guardianRelationship ?? ""
              }
            />
          </div>
        </FormSection>

        <div className="flex flex-wrap justify-end gap-3 rounded-2xl border border-line bg-surface p-5">
          <Link
            href={`/admin/mitglieder/${member.id}`}
            className="inline-flex items-center justify-center rounded-xl border border-line bg-page-soft px-5 py-3 text-sm font-semibold text-content transition hover:border-line-strong hover:bg-surface-hover"
          >
            Abbrechen
          </Link>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
          >
            <Save size={17} />
            Änderungen speichern
          </button>
        </div>
      </form>
    </>
  );
}

type FormSectionProps = {
  title: string;
  description: string;
  icon: typeof UserRound;
  children: React.ReactNode;
};

function FormSection({
  title,
  description,
  icon: Icon,
  children,
}: FormSectionProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-start gap-3 border-b border-line px-5 py-5 sm:px-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-page-soft text-muted">
          <Icon size={19} />
        </span>

        <div>
          <h2 className="font-bold text-content">
            {title}
          </h2>

          <p className="mt-1 text-sm text-muted">
            {description}
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

type TextFieldProps = {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  required?: boolean;
  inputMode?:
    | "none"
    | "text"
    | "decimal"
    | "numeric"
    | "tel"
    | "search"
    | "email"
    | "url";
  icon?: typeof UserRound;
};

function TextField({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
  inputMode,
  icon: Icon,
}: TextFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-semibold text-content"
      >
        {label}
        {required ? (
          <span className="ml-1 text-red-300">*</span>
        ) : null}
      </label>

      <div className="relative mt-2">
        {Icon ? (
          <Icon
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
          />
        ) : null}

        <input
          id={name}
          name={name}
          type={type}
          inputMode={inputMode}
          defaultValue={defaultValue}
          required={required}
          className={[
            "w-full rounded-xl border border-line bg-page-soft py-3 pr-4 text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent-soft",
            Icon ? "pl-11" : "pl-4",
          ].join(" ")}
        />
      </div>
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  name: string;
  defaultValue: string;
  options: Array<{
    value: string;
    label: string;
  }>;
};

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: SelectFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-semibold text-content"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-xl border border-line bg-page-soft px-4 py-3 text-content outline-none transition focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function getRequiredText(
  formData: FormData,
  name: string,
): string {
  return String(formData.get(name) ?? "").trim();
}

function getOptionalText(
  formData: FormData,
  name: string,
): string | null {
  const value = String(formData.get(name) ?? "").trim();

  return value || null;
}

function parseDateInput(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Ungültiges Datum.");
  }

  return date;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function calculateAge(birthDate: Date): number {
  const today = new Date();

  let age = today.getFullYear() - birthDate.getUTCFullYear();

  const birthdayOccurred =
    today.getMonth() > birthDate.getUTCMonth() ||
    (today.getMonth() === birthDate.getUTCMonth() &&
      today.getDate() >= birthDate.getUTCDate());

  if (!birthdayOccurred) {
    age -= 1;
  }

  return age;
}

function formatInputDate(date: Date): string {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function getErrorMessage(error: string): string {
  switch (error) {
    case "required":
      return "Bitte fülle alle Pflichtfelder vollständig aus.";

    case "email":
      return "Bitte gib eine gültige E-Mail-Adresse ein.";

    case "postal-code":
      return "Die Postleitzahl muss aus fünf Ziffern bestehen.";

    case "invalid":
      return "Mindestens eine übermittelte Angabe ist ungültig.";

    default:
      return "Die Änderungen konnten nicht gespeichert werden.";
  }
}