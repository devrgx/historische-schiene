"use client";

import {
  useActionState,
  useState,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleAlert,
  Eye,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  MapPin,
  X,
} from "lucide-react";

import { ActivationCodeInput } from "@/components/portal/activation-code-input";

import {
  activatePortalAccount,
  verifyPortalRegistrationData,
  type PortalRegistrationState,
} from "./actions";

const initialPortalRegistrationState: PortalRegistrationState = {
  status: "IDLE",
};

type RegistrationFormProps = {
  initialActivationCode: string;
};

export function RegistrationForm({
  initialActivationCode,
}: RegistrationFormProps) {
  const [
    verificationState,
    verificationAction,
    verificationPending,
  ] = useActionState(
    verifyPortalRegistrationData,
    initialPortalRegistrationState,
  );

  const [
    activationState,
    activationAction,
    activationPending,
  ] = useActionState(
    activatePortalAccount,
    initialPortalRegistrationState,
  );

  const activeState =
    activationState.status !== "IDLE"
      ? activationState
      : verificationState;

  if (activeState.status === "ACTIVATED") {
    return (
      <div className="surface-card mx-auto max-w-2xl p-7 sm:p-9">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
            <CheckCircle2 size={28} />
          </span>

          <div>
            <p className="text-sm font-semibold text-emerald-300">
              Konto aktiviert
            </p>

            <h2 className="mt-1 text-2xl font-bold text-content">
              Willkommen
              {activeState.memberFirstName
                ? `, ${activeState.memberFirstName}`
                : ""}
              !
            </h2>

            <p className="mt-3 leading-7 text-muted">
              Dein Mitgliedskonto wurde erfolgreich aktiviert. Du
              kannst dich jetzt mit deiner E-Mail-Adresse und deinem
              neuen Passwort anmelden.
            </p>
          </div>
        </div>

        <div className="mt-7 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-5">
          <p className="font-semibold text-content">
            Aktivierung abgeschlossen
          </p>

          <p className="mt-2 text-sm leading-7 text-muted">
            Der verwendete Aktivierungscode ist ab sofort ungültig.
          </p>
        </div>

        <Link
          href="/portal/login"
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-hover"
        >
          <LogIn size={18} />
          Zur Anmeldung
        </Link>
      </div>
    );
  }

  if (verificationState.status === "VERIFIED") {
    return (
      <PasswordCreationForm
        verificationState={verificationState}
        activationState={activationState}
        activationAction={activationAction}
        activationPending={activationPending}
      />
    );
  }

  const memberNumber =
    verificationState.memberNumber ?? "";

  const postalCode =
    verificationState.postalCode ?? "";

  const birthDate =
    verificationState.birthDate ?? "";

  const verificationCode =
    verificationState.verificationCode ??
    initialActivationCode;

  return (
    <form
      action={verificationAction}
      className="surface-card mx-auto max-w-2xl p-7 sm:p-9"
    >
      {verificationState.status === "ERROR" ? (
        <ErrorMessage
          message={
            verificationState.message ??
            "Die eingegebenen Daten konnten nicht geprüft werden."
          }
        />
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          key={`member-${memberNumber}`}
          id="member-number"
          name="memberNumber"
          label="Mitgliedsnummer"
          placeholder="z. B. HS-000001"
          defaultValue={memberNumber}
          autoComplete="username"
          icon={BadgeCheck}
        />

        <Field
          key={`postal-${postalCode}`}
          id="postal-code"
          name="postalCode"
          label="Postleitzahl"
          placeholder="84453"
          defaultValue={postalCode}
          autoComplete="postal-code"
          inputMode="numeric"
          icon={MapPin}
        />

        <Field
          key={`birth-${birthDate}`}
          id="birth-date"
          name="birthDate"
          label="Geburtsdatum"
          type="date"
          defaultValue={birthDate}
          autoComplete="bday"
          icon={CalendarDays}
        />

        <div>
          <label
            htmlFor="verification-code"
            className="text-sm font-semibold text-content"
          >
            Bestätigungscode
          </label>

          <div className="relative mt-2">
            <KeyRound
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-subtle"
            />

            <ActivationCodeInput
              key={`code-${verificationCode}`}
              id="verification-code"
              name="verificationCode"
              defaultValue={verificationCode}
              required
              autoComplete="one-time-code"
              aria-describedby="verification-code-hint"
              className="py-3 pl-12 pr-4 text-left tracking-[0.2em]"
            />
          </div>

          <p
            id="verification-code-hint"
            className="mt-2 text-xs leading-5 text-muted"
          >
            Der Code besteht aus sechs Zeichen, zum Beispiel K7M-4XP.
          </p>
        </div>
      </div>

      <div className="mt-7 rounded-2xl border border-accent-border bg-accent-soft p-5">
        <p className="font-semibold text-content">
          Kontoaktivierung
        </p>

        <p className="mt-2 text-sm leading-7 text-muted">
          Den Bestätigungscode erhältst du nach der Freischaltung
          deines Mitgliedskontos.
        </p>

        {initialActivationCode ? (
          <p className="mt-3 text-sm font-semibold text-accent-light">
            Der Aktivierungscode aus deiner E-Mail wurde automatisch
            übernommen.
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={verificationPending}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-hover disabled:cursor-wait disabled:opacity-60"
      >
        {verificationPending ? (
          <>
            <LoaderCircle
              size={18}
              className="animate-spin"
            />
            Mitgliedsdaten werden geprüft …
          </>
        ) : (
          <>
            <BadgeCheck size={18} />
            Mitgliedsdaten prüfen
          </>
        )}
      </button>
    </form>
  );
}

type PasswordCreationFormProps = {
  verificationState: PortalRegistrationState;
  activationState: PortalRegistrationState;

  activationAction: (
    payload: FormData,
  ) => void;

  activationPending: boolean;
};

function PasswordCreationForm({
  verificationState,
  activationState,
  activationAction,
  activationPending,
}: PasswordCreationFormProps) {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] =
    useState("");

  const passwordChecks = {
    minimumLength: password.length >= 12,
    maximumLength: password.length <= 128,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),

    matching:
      password.length > 0 &&
      passwordConfirmation.length > 0 &&
      password === passwordConfirmation,
  };

  const passwordIsValid =
    passwordChecks.minimumLength &&
    passwordChecks.maximumLength &&
    passwordChecks.lowercase &&
    passwordChecks.uppercase &&
    passwordChecks.number &&
    passwordChecks.matching;

  return (
    <form
      action={activationAction}
      className="surface-card mx-auto max-w-2xl p-7 sm:p-9"
    >
      <input
        type="hidden"
        name="memberNumber"
        value={verificationState.memberNumber ?? ""}
      />

      <input
        type="hidden"
        name="postalCode"
        value={verificationState.postalCode ?? ""}
      />

      <input
        type="hidden"
        name="birthDate"
        value={verificationState.birthDate ?? ""}
      />

      <input
        type="hidden"
        name="verificationCode"
        value={verificationState.verificationCode ?? ""}
      />

      {activationState.status !== "IDLE" &&
      activationState.message ? (
        <ErrorMessage message={activationState.message} />
      ) : null}

      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
          <CheckCircle2 size={24} />
        </span>

        <div>
          <p className="text-sm font-semibold text-emerald-300">
            Mitgliedsdaten bestätigt
          </p>

          <h2 className="mt-1 text-2xl font-bold text-content">
            Hallo {verificationState.memberFirstName}
          </h2>

          <p className="mt-3 leading-7 text-muted">
            Lege jetzt dein persönliches Passwort für das
            Mitgliederportal fest.
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-6">
        <PasswordField
          id="password"
          name="password"
          label="Neues Passwort"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          autoComplete="new-password"
        />

        <PasswordField
          id="password-confirmation"
          name="passwordConfirmation"
          label="Passwort bestätigen"
          value={passwordConfirmation}
          onChange={(event) => {
            setPasswordConfirmation(event.target.value);
          }}
          autoComplete="new-password"
        />
      </div>

      <div className="mt-7 rounded-2xl border border-accent-border bg-accent-soft p-5">
        <p className="font-semibold text-content">
          Anforderungen an das Passwort
        </p>

        <div
          className="mt-4 grid gap-3 sm:grid-cols-2"
          aria-live="polite"
        >
          <PasswordRequirement
            fulfilled={passwordChecks.minimumLength}
            label="Mindestens 12 Zeichen"
          />

          <PasswordRequirement
            fulfilled={passwordChecks.maximumLength}
            label="Höchstens 128 Zeichen"
          />

          <PasswordRequirement
            fulfilled={passwordChecks.uppercase}
            label="Mindestens ein Großbuchstabe"
          />

          <PasswordRequirement
            fulfilled={passwordChecks.lowercase}
            label="Mindestens ein Kleinbuchstabe"
          />

          <PasswordRequirement
            fulfilled={passwordChecks.number}
            label="Mindestens eine Zahl"
          />

          <PasswordRequirement
            fulfilled={passwordChecks.matching}
            label="Passwörter stimmen überein"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={
          activationPending ||
          !passwordIsValid
        }
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {activationPending ? (
          <>
            <LoaderCircle
              size={18}
              className="animate-spin"
            />
            Konto wird aktiviert …
          </>
        ) : (
          <>
            <LockKeyhole size={18} />
            Mitgliedskonto aktivieren
          </>
        )}
      </button>
    </form>
  );
}

type PasswordRequirementProps = {
  fulfilled: boolean;
  label: string;
};

function PasswordRequirement({
  fulfilled,
  label,
}: PasswordRequirementProps) {
  return (
    <div
      className={[
        "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition",
        fulfilled
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
          : "border-red-400/25 bg-red-400/10 text-red-200",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          fulfilled
            ? "bg-emerald-400/20"
            : "bg-red-400/20",
        ].join(" ")}
      >
        {fulfilled ? (
          <Check
            size={13}
            strokeWidth={3}
          />
        ) : (
          <X
            size={13}
            strokeWidth={3}
          />
        )}
      </span>

      <span>{label}</span>
    </div>
  );
}

type ErrorMessageProps = {
  message: string;
};

function ErrorMessage({
  message,
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-red-100"
    >
      <CircleAlert
        size={20}
        className="mt-0.5 shrink-0"
      />

      <p className="text-sm leading-6">
        {message}
      </p>
    </div>
  );
}

type FieldProps = {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "date";
  defaultValue?: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric";
  icon: typeof BadgeCheck;
};

function Field({
  id,
  name,
  label,
  placeholder,
  type = "text",
  defaultValue,
  autoComplete,
  inputMode,
  icon: Icon,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-sm font-semibold text-content"
      >
        {label}
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
          defaultValue={defaultValue}
          autoComplete={autoComplete}
          inputMode={inputMode}
          required
          className="w-full rounded-xl border border-line bg-page-soft py-3 pl-12 pr-4 text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
        />
      </div>
    </div>
  );
}

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  autoComplete: string;

  onChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
};

function PasswordField({
  id,
  name,
  label,
  value,
  autoComplete,
  onChange,
}: PasswordFieldProps) {
  const [passwordVisible, setPasswordVisible] =
    useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="text-sm font-semibold text-content"
      >
        {label}
      </label>

      <div className="relative mt-2">
        <LockKeyhole
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
        />

        <input
          id={id}
          name={name}
          type={
            passwordVisible
              ? "text"
              : "password"
          }
          value={value}
          onChange={onChange}
          required
          minLength={12}
          maxLength={128}
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-line bg-page-soft py-3 pl-12 pr-12 text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
        />

        <button
          type="button"
          onClick={() => {
            setPasswordVisible(
              (currentValue) =>
                !currentValue,
            );
          }}
          aria-label={
            passwordVisible
              ? "Passwort ausblenden"
              : "Passwort anzeigen"
          }
          aria-pressed={passwordVisible}
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-subtle transition hover:bg-surface-elevated hover:text-content"
        >
          <Eye size={17} />
        </button>
      </div>
    </div>
  );
}