import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole, Mail } from "lucide-react";

import { PortalShell } from "@/components/portal/portal-shell";

export const metadata: Metadata = {
  title: "Anmelden",
};

export default function PortalLoginPage() {
  return (
    <PortalShell
      title="Im Mitgliederportal anmelden"
      description="Die Anmeldung wird im nächsten Schritt mit der lokalen MariaDB und sicheren Sitzungen verbunden."
    >
      <form className="surface-card mx-auto max-w-xl p-7 sm:p-9">
        <div>
          <label
            htmlFor="login-email"
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
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@beispiel.de"
              className="w-full rounded-xl border border-line bg-page-soft py-3 pl-12 pr-4 text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
            />
          </div>
        </div>

        <div className="mt-6">
          <label
            htmlFor="login-password"
            className="text-sm font-semibold text-content"
          >
            Passwort
          </label>

          <div className="relative mt-2">
            <LockKeyhole
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
            />

            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Dein Passwort"
              className="w-full rounded-xl border border-line bg-page-soft py-3 pl-12 pr-4 text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
            />
          </div>
        </div>

        <button
          type="button"
          disabled
          className="mt-7 inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-surface-elevated px-5 py-3 font-semibold text-subtle"
        >
          Anmeldung folgt
        </button>

        <p className="mt-6 text-center text-sm text-muted">
          Noch nicht registriert?{" "}
          <Link
            href="/portal/registrieren"
            className="font-semibold text-content transition hover:text-accent-light"
          >
            Konto aktivieren
          </Link>
        </p>
      </form>
    </PortalShell>
  );
}