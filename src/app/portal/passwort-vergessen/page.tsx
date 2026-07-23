"use client";

import {
  useActionState,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  Mail,
  Send,
} from "lucide-react";

import { PortalShell } from "@/components/portal/portal-shell";

import {
  requestPasswordReset,
  type PasswordResetRequestState,
} from "./actions";

const initialState: PasswordResetRequestState = {
  status: "IDLE",
};

export default function ForgotPasswordPage() {
  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    requestPasswordReset,
    initialState,
  );

  return (
    <PortalShell
      title="Passwort vergessen"
      description="Fordere einen zeitlich begrenzten Link an, um ein neues Passwort für dein Mitgliedskonto festzulegen."
    >
      <div className="surface-card mx-auto max-w-xl p-7 sm:p-9">
        {state.status === "SUCCESS" ? (
          <>
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                <CheckCircle2 size={24} />
              </span>

              <div>
                <p className="text-sm font-semibold text-emerald-300">
                  Anfrage verarbeitet
                </p>

                <h1 className="mt-1 text-2xl font-bold text-content">
                  Prüfe dein E-Mail-Postfach
                </h1>

                <p className="mt-3 leading-7 text-muted">
                  {state.message}
                </p>
              </div>
            </div>

            <div className="mt-7 rounded-2xl border border-accent-border bg-accent-soft p-5">
              <p className="font-semibold text-content">
                Keine Nachricht erhalten?
              </p>

              <p className="mt-2 text-sm leading-7 text-muted">
                Prüfe auch deinen Spam-Ordner. Die Zustellung kann
                außerdem einige Minuten dauern.
              </p>
            </div>

            <Link
              href="/portal/login"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-hover"
            >
              <ArrowLeft size={18} />
              Zur Anmeldung
            </Link>
          </>
        ) : (
          <form action={formAction}>
            {state.status === "ERROR" ? (
              <div
                role="alert"
                className="mb-6 flex gap-3 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200"
              >
                <CircleAlert
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <p>
                  {state.message ??
                    "Die Anfrage konnte nicht verarbeitet werden."}
                </p>
              </div>
            ) : null}

            <div>
              <label
                htmlFor="reset-email"
                className="text-sm font-semibold text-content"
              >
                E-Mail-Adresse
              </label>

              <div className="relative mt-2">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
                />

                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  defaultValue={state.email ?? ""}
                  autoComplete="email"
                  placeholder="name@beispiel.de"
                  required
                  className="w-full rounded-xl border border-line bg-page-soft py-3 pl-12 pr-4 text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
                />
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-accent-border bg-accent-soft p-5">
              <p className="font-semibold text-content">
                So funktioniert es
              </p>

              <p className="mt-2 text-sm leading-7 text-muted">
                Existiert zu deiner E-Mail-Adresse ein aktives
                Vereinskonto, erhältst du einen Link. Dieser ist
                60 Minuten gültig und kann nur einmal verwendet
                werden.
              </p>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-hover disabled:cursor-wait disabled:opacity-60"
            >
              {pending ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Anfrage wird verarbeitet …
                </>
              ) : (
                <>
                  <Send size={18} />
                  Zurücksetzungslink anfordern
                </>
              )}
            </button>

            <Link
              href="/portal/login"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 text-sm font-semibold text-muted transition hover:text-content"
            >
              <ArrowLeft size={17} />
              Zurück zur Anmeldung
            </Link>
          </form>
        )}
      </div>
    </PortalShell>
  );
}