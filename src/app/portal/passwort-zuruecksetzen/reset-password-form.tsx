"use client";

import {
  useActionState,
  useState,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  CircleAlert,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  X,
} from "lucide-react";

import {
  resetPassword,
} from "./actions";

type PasswordResetState = {
  status: "IDLE" | "ERROR" | "SUCCESS";
  message?: string;
};

const initialState: PasswordResetState = {
  status: "IDLE",
};

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({
  token,
}: ResetPasswordFormProps) {
  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    resetPassword,
    initialState,
  );

  const [password, setPassword] =
    useState("");

  const [
    passwordConfirmation,
    setPasswordConfirmation,
  ] = useState("");

  const checks = {
    minimumLength:
      password.length >= 12,

    maximumLength:
      password.length <= 128,

    lowercase:
      /[a-z]/.test(password),

    uppercase:
      /[A-Z]/.test(password),

    number:
      /[0-9]/.test(password),

    matching:
      password.length > 0 &&
      passwordConfirmation.length > 0 &&
      password ===
        passwordConfirmation,
  };

  const passwordIsValid =
    checks.minimumLength &&
    checks.maximumLength &&
    checks.lowercase &&
    checks.uppercase &&
    checks.number &&
    checks.matching;

  if (state.status === "SUCCESS") {
    return (
      <div className="surface-card mx-auto max-w-xl p-7 sm:p-9">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
            <CheckCircle2 size={28} />
          </span>

          <div>
            <p className="text-sm font-semibold text-emerald-300">
              Änderung abgeschlossen
            </p>

            <h1 className="mt-1 text-2xl font-bold text-content">
              Neues Passwort gespeichert
            </h1>

            <p className="mt-3 leading-7 text-muted">
              {state.message} Du kannst dich jetzt mit deiner
              E-Mail-Adresse und dem neuen Passwort anmelden.
            </p>
          </div>
        </div>

        <div className="mt-7 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-5">
          <p className="font-semibold text-content">
            Zurücksetzungslink verbraucht
          </p>

          <p className="mt-2 text-sm leading-7 text-muted">
            Der verwendete Link kann nicht erneut benutzt werden.
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

  return (
    <form
      action={formAction}
      className="surface-card mx-auto max-w-2xl p-7 sm:p-9"
    >
      <input
        type="hidden"
        name="token"
        value={token}
      />

      {state.status === "ERROR" ? (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-red-100"
        >
          <CircleAlert
            size={20}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="text-sm leading-6">
              {state.message ??
                "Das Passwort konnte nicht geändert werden."}
            </p>

            <Link
              href="/portal/passwort-vergessen"
              className="mt-2 inline-flex text-sm font-semibold text-red-100 underline underline-offset-4"
            >
              Neuen Link anfordern
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6">
        <PasswordField
          id="new-password"
          name="password"
          label="Neues Passwort"
          value={password}
          onChange={(event) => {
            setPassword(
              event.target.value,
            );
          }}
        />

        <PasswordField
          id="password-confirmation"
          name="passwordConfirmation"
          label="Passwort bestätigen"
          value={passwordConfirmation}
          onChange={(event) => {
            setPasswordConfirmation(
              event.target.value,
            );
          }}
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
            fulfilled={
              checks.minimumLength
            }
            label="Mindestens 12 Zeichen"
          />

          <PasswordRequirement
            fulfilled={
              checks.maximumLength
            }
            label="Höchstens 128 Zeichen"
          />

          <PasswordRequirement
            fulfilled={
              checks.uppercase
            }
            label="Mindestens ein Großbuchstabe"
          />

          <PasswordRequirement
            fulfilled={
              checks.lowercase
            }
            label="Mindestens ein Kleinbuchstabe"
          />

          <PasswordRequirement
            fulfilled={checks.number}
            label="Mindestens eine Zahl"
          />

          <PasswordRequirement
            fulfilled={checks.matching}
            label="Passwörter stimmen überein"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={
          pending ||
          !passwordIsValid
        }
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          <>
            <LoaderCircle
              size={18}
              className="animate-spin"
            />
            Passwort wird gespeichert …
          </>
        ) : (
          <>
            <LockKeyhole size={18} />
            Neues Passwort speichern
          </>
        )}
      </button>

      <Link
        href="/portal/login"
        className="mt-5 inline-flex w-full items-center justify-center text-sm font-semibold text-muted transition hover:text-content"
      >
        Zurück zur Anmeldung
      </Link>
    </form>
  );
}

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  value: string;

  onChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
};

function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
}: PasswordFieldProps) {
  const [
    passwordVisible,
    setPasswordVisible,
  ] = useState(false);

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
          autoComplete="new-password"
          className="w-full rounded-xl border border-line bg-page-soft py-3 pl-12 pr-12 text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
        />

        <button
          type="button"
          onClick={() => {
            setPasswordVisible(
              (current) => !current,
            );
          }}
          aria-label={
            passwordVisible
              ? "Passwort ausblenden"
              : "Passwort anzeigen"
          }
          aria-pressed={
            passwordVisible
          }
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-subtle transition hover:bg-surface-elevated hover:text-content"
        >
          {passwordVisible ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </button>
      </div>
    </div>
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