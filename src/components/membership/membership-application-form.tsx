"use client";

import type { ReactNode } from "react";
import {
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  useActionState,
  useState,
} from "react";

import {
  submitMembershipApplication,
  type MembershipApplicationState,
} from "@/app/mitmachen/antrag/actions";

const initialState: MembershipApplicationState = {
  success: false,
  message: "",
};

export function MembershipApplicationForm() {
  const [state, formAction, pending] =
    useActionState(
      submitMembershipApplication,
      initialState,
    );

  const [birthDate, setBirthDate] =
    useState("");

  const age = calculateAge(birthDate);

  const showGuardianFields =
    age !== null && age < 18;

  return (
    <form
      action={formAction}
      className="surface-card p-7 sm:p-10"
    >
      <FormSection
        title="Persönliche Daten"
        description="Diese Angaben benötigen wir zur Prüfung und späteren Mitgliederverwaltung."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            id="firstName"
            name="firstName"
            label="Vorname"
            autoComplete="given-name"
            icon={UserRound}
            error={state.errors?.firstName}
            required
          />

          <Field
            id="lastName"
            name="lastName"
            label="Nachname"
            autoComplete="family-name"
            icon={UserRound}
            error={state.errors?.lastName}
            required
          />

          <div>
            <label
              htmlFor="birthDate"
              className="text-sm font-semibold text-content"
            >
              Geburtsdatum
              <span className="ml-1 text-accent-light">
                *
              </span>
            </label>

            <div className="relative mt-2">
              <CalendarDays
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
              />

              <input
                id="birthDate"
                name="birthDate"
                type="date"
                value={birthDate}
                onChange={(event) =>
                  setBirthDate(
                    event.target.value,
                  )
                }
                required
                aria-invalid={Boolean(
                  state.errors?.birthDate,
                )}
                aria-describedby={
                  state.errors?.birthDate
                    ? "birthDate-error"
                    : undefined
                }
                className="w-full rounded-xl border border-line bg-page-soft py-3 pl-12 pr-4 text-content outline-none transition focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
              />
            </div>

            <FieldError
              id="birthDate-error"
              message={state.errors?.birthDate}
            />

            {showGuardianFields ? (
              <p className="mt-2 text-sm text-accent-light">
                Minderjähriger Antrag: Die
                Zustimmung eines Sorgeberechtigten
                ist erforderlich.
              </p>
            ) : null}
          </div>

          <Field
            id="email"
            name="email"
            label="E-Mail-Adresse"
            type="email"
            autoComplete="email"
            icon={Mail}
            error={state.errors?.email}
            required
          />

          <Field
            id="phone"
            name="phone"
            label="Telefonnummer"
            type="tel"
            autoComplete="tel"
            icon={Phone}
          />
        </div>
      </FormSection>

      <FormSection
        title="Anschrift"
        description="Die Anschrift wird später auch für Mitgliedsunterlagen und Rechnungen verwendet."
      >
        <div className="grid gap-6 sm:grid-cols-[1fr_10rem]">
          <Field
            id="street"
            name="street"
            label="Straße"
            autoComplete="address-line1"
            icon={MapPin}
            error={state.errors?.street}
            required
          />

          <Field
            id="houseNumber"
            name="houseNumber"
            label="Hausnummer"
            icon={MapPin}
            error={state.errors?.houseNumber}
            required
          />
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-[10rem_1fr]">
          <Field
            id="postalCode"
            name="postalCode"
            label="Postleitzahl"
            inputMode="numeric"
            autoComplete="postal-code"
            icon={MapPin}
            error={state.errors?.postalCode}
            required
          />

          <Field
            id="city"
            name="city"
            label="Ort"
            autoComplete="address-level2"
            icon={MapPin}
            error={state.errors?.city}
            required
          />
        </div>
      </FormSection>

      <FormSection
        title="Mitgliedschaft"
        description="Wähle die gewünschte Form der Mitgliedschaft."
      >
        <div>
          <label
            htmlFor="membershipType"
            className="text-sm font-semibold text-content"
          >
            Mitgliedsform
            <span className="ml-1 text-accent-light">
              *
            </span>
          </label>

          <select
            id="membershipType"
            name="membershipType"
            defaultValue=""
            required
            className="mt-2 w-full rounded-xl border border-line bg-page-soft px-4 py-3 text-content outline-none transition focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
          >
            <option value="" disabled>
              Bitte auswählen
            </option>

            <option value="REGULAR">
              Ordentliche Mitgliedschaft – 30 €
              jährlich
            </option>

            <option value="REDUCED">
              Ermäßigte Mitgliedschaft – 16 €
              jährlich
            </option>

            <option value="SUPPORTING">
              Fördermitgliedschaft – 70 € jährlich
            </option>
          </select>

          <FieldError
            message={
              state.errors?.membershipType
            }
          />
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Field
            id="occupation"
            name="occupation"
            label="Beruf oder Tätigkeit"
            placeholder="Optional"
            icon={UserRound}
          />

          <Field
            id="railwayQualification"
            name="railwayQualification"
            label="Eisenbahnfachliche Qualifikation"
            placeholder="Optional"
            icon={UserRound}
          />

          <Field
            id="telegramUsername"
            name="telegramUsername"
            label="Telegram-Benutzername"
            placeholder="Optional"
            icon={UserRound}
          />
        </div>
      </FormSection>

      <FormSection
        title="Notfallkontakt"
        description={
          showGuardianFields
            ? "Bei minderjährigen Antragstellern ist ein Notfallkontakt verpflichtend."
            : "Diese Angaben sind freiwillig und können später im Portal geändert werden."
        }
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            id="emergencyContactName"
            name="emergencyContactName"
            label="Name des Notfallkontakts"
            icon={UserRound}
            error={
              state.errors
                ?.emergencyContactName
            }
            required={showGuardianFields}
          />

          <Field
            id="emergencyContactPhone"
            name="emergencyContactPhone"
            label="Telefonnummer"
            type="tel"
            icon={Phone}
            error={
              state.errors
                ?.emergencyContactPhone
            }
            required={showGuardianFields}
          />
        </div>
      </FormSection>

      {showGuardianFields ? (
        <FormSection
          title="Zustimmung des Sorgeberechtigten"
          description="Da die antragstellende Person minderjährig ist, benötigen wir zusätzliche Angaben und die Zustimmung eines Sorgeberechtigten."
        >
          <div className="rounded-2xl border border-accent-border bg-accent-soft p-5">
            <div className="flex gap-4">
              <ShieldCheck
                size={22}
                className="mt-0.5 shrink-0 text-accent-light"
              />

              <div>
                <p className="font-semibold text-content">
                  Zustimmung erforderlich
                </p>

                <p className="mt-2 text-sm leading-7 text-muted">
                  Die folgenden Angaben müssen
                  durch einen Sorgeberechtigten
                  ausgefüllt und bestätigt werden.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Field
              id="guardianFirstName"
              name="guardianFirstName"
              label="Vorname des Sorgeberechtigten"
              autoComplete="given-name"
              icon={UserRound}
              error={
                state.errors
                  ?.guardianFirstName
              }
              required
            />

            <Field
              id="guardianLastName"
              name="guardianLastName"
              label="Nachname des Sorgeberechtigten"
              autoComplete="family-name"
              icon={UserRound}
              error={
                state.errors
                  ?.guardianLastName
              }
              required
            />

            <Field
              id="guardianEmail"
              name="guardianEmail"
              label="E-Mail-Adresse"
              type="email"
              autoComplete="email"
              icon={Mail}
              error={
                state.errors?.guardianEmail
              }
              required
            />

            <Field
              id="guardianPhone"
              name="guardianPhone"
              label="Telefonnummer"
              type="tel"
              autoComplete="tel"
              icon={Phone}
              error={
                state.errors?.guardianPhone
              }
              required
            />

            <Field
              id="guardianRelationship"
              name="guardianRelationship"
              label="Verhältnis zur antragstellenden Person"
              placeholder="z. B. Mutter, Vater oder Vormund"
              icon={UserRound}
              error={
                state.errors
                  ?.guardianRelationship
              }
              required
            />

            <Field
              id="guardianNameConfirmation"
              name="guardianNameConfirmation"
              label="Vollständiger Name zur Bestätigung"
              placeholder="Vorname und Nachname"
              icon={UserRound}
              error={
                state.errors
                  ?.guardianNameConfirmation
              }
              required
            />
          </div>

          <div className="mt-7 space-y-4">
            <Checkbox
              id="guardianConsentAccepted"
              name="guardianConsentAccepted"
              label="Ich stimme dem Beitritt der minderjährigen Person und den damit verbundenen Beitragspflichten zu."
              error={
                state.errors
                  ?.guardianConsentAccepted
              }
              required
            />

            <Checkbox
              id="guardianAuthorityConfirmed"
              name="guardianAuthorityConfirmed"
              label="Ich bestätige, sorgeberechtigt zu sein und, soweit erforderlich, mit Zustimmung des weiteren Sorgeberechtigten zu handeln."
              error={
                state.errors
                  ?.guardianAuthorityConfirmed
              }
              required
            />
          </div>
        </FormSection>
      ) : null}

      <FormSection
        title="Zusätzliche Nachricht"
        description="Hier kannst du weitere Informationen oder Fragen ergänzen."
      >
        <textarea
          id="message"
          name="message"
          rows={6}
          placeholder="Optionale Nachricht"
          className="w-full resize-y rounded-xl border border-line bg-page-soft px-4 py-3 leading-7 text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
        />
      </FormSection>

      <FormSection
        title="Bestätigungen"
        description="Bitte bestätige die erforderlichen Grundlagen für den Antrag."
      >
        <div className="space-y-4">
          <Checkbox
            id="privacyAccepted"
            name="privacyAccepted"
            label="Ich habe die Datenschutzerklärung gelesen."
            error={
              state.errors?.privacyAccepted
            }
            required
          />

          <Checkbox
            id="statutesAccepted"
            name="statutesAccepted"
            label="Ich erkenne die Satzung in ihrer jeweils gültigen Fassung an."
            error={
              state.errors?.statutesAccepted
            }
            required
          />

          <Checkbox
            id="contributionRulesAccepted"
            name="contributionRulesAccepted"
            label="Ich erkenne die Beitragsordnung und die entstehenden Beiträge an."
            error={
              state.errors
                ?.contributionRulesAccepted
            }
            required
          />
        </div>
      </FormSection>

      {state.message ? (
        <div className="mt-8 rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-sm text-red-200">
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-light disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? (
          "Antrag wird gespeichert …"
        ) : (
          <>
            <Send size={18} />
            Mitgliedsantrag absenden
          </>
        )}
      </button>
    </form>
  );
}

type FormSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <section className="border-b border-line py-8 first:pt-0 last:border-b-0 last:pb-0">
      <h2 className="text-xl font-bold text-content">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-7 text-muted">
        {description}
      </p>

      <div className="mt-6">{children}</div>
    </section>
  );
}

type FieldProps = {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "date";
  placeholder?: string;
  autoComplete?: string;
  inputMode?:
    | "text"
    | "numeric"
    | "email"
    | "tel";
  icon: typeof UserRound;
  error?: string;
  required?: boolean;
};

function Field({
  id,
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  icon: Icon,
  error,
  required = false,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-sm font-semibold text-content"
      >
        {label}

        {required ? (
          <span className="ml-1 text-accent-light">
            *
          </span>
        ) : null}
      </label>

      <div className="relative mt-2">
        <Icon
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
        />

        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${id}-error` : undefined
          }
          className="w-full rounded-xl border border-line bg-page-soft py-3 pl-12 pr-4 text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
        />
      </div>

      <FieldError
        id={`${id}-error`}
        message={error}
      />
    </div>
  );
}

type CheckboxProps = {
  id: string;
  name: string;
  label: string;
  error?: string;
  required?: boolean;
};

function Checkbox({
  id,
  name,
  label,
  error,
  required = false,
}: CheckboxProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-start gap-3"
      >
        <input
          id={id}
          name={name}
          type="checkbox"
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${id}-error` : undefined
          }
          className="mt-1 h-4 w-4 rounded border-line bg-page-soft"
        />

        <span className="text-sm leading-7 text-muted">
          {label}
        </span>
      </label>

      <FieldError
        id={`${id}-error`}
        message={error}
      />
    </div>
  );
}

type FieldErrorProps = {
  id?: string;
  message?: string;
};

function FieldError({
  id,
  message,
}: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      className="mt-2 text-sm text-red-300"
    >
      {message}
    </p>
  );
}

function calculateAge(
  birthDateValue: string,
): number | null {
  if (!birthDateValue) {
    return null;
  }

  const birthDate = new Date(
    `${birthDateValue}T00:00:00`,
  );

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const birthdayOccurred =
    today.getMonth() >
      birthDate.getMonth() ||
    (today.getMonth() ===
      birthDate.getMonth() &&
      today.getDate() >=
        birthDate.getDate());

  if (!birthdayOccurred) {
    age -= 1;
  }

  return age;
}