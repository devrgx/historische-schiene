import type { Metadata } from "next";
import {
  BadgeCheck,
  CalendarDays,
  KeyRound,
  MapPin,
} from "lucide-react";

import { PortalShell } from "@/components/portal/portal-shell";

export const metadata: Metadata = {
  title: "Konto aktivieren",
};

export default function PortalRegisterPage() {
  return (
    <PortalShell
      title="Mitgliedskonto aktivieren"
      description="Nach Genehmigung deines Mitgliedsantrags kannst du deinen Zugang anhand deiner Mitgliedsdaten aktivieren."
    >
      <form className="surface-card mx-auto max-w-2xl p-7 sm:p-9">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            id="member-number"
            name="memberNumber"
            label="Mitgliedsnummer"
            placeholder="z. B. HS-2026-0001"
            icon={BadgeCheck}
          />

          <Field
            id="postal-code"
            name="postalCode"
            label="Postleitzahl"
            placeholder="84453"
            icon={MapPin}
          />

          <Field
            id="birth-date"
            name="birthDate"
            label="Geburtsdatum"
            type="date"
            icon={CalendarDays}
          />

          <Field
            id="verification-code"
            name="verificationCode"
            label="Bestätigungscode"
            placeholder="Testcode eingeben"
            icon={KeyRound}
          />
        </div>

        <div className="mt-7 rounded-2xl border border-accent-border bg-accent-soft p-5">
          <p className="font-semibold text-content">
            Lokale Testumgebung
          </p>

          <p className="mt-2 text-sm leading-7 text-muted">
            In der Entwicklungsumgebung wird zunächst ein fester
            Bestätigungscode verwendet. Die Prüfung wird im nächsten Schritt
            serverseitig umgesetzt.
          </p>
        </div>

        <button
          type="button"
          disabled
          className="mt-7 inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-surface-elevated px-5 py-3 font-semibold text-subtle"
        >
          Mitgliedsdaten prüfen
        </button>
      </form>
    </PortalShell>
  );
}

type FieldProps = {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "date";
  icon: typeof BadgeCheck;
};

function Field({
  id,
  name,
  label,
  placeholder,
  type = "text",
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
          className="w-full rounded-xl border border-line bg-page-soft py-3 pl-12 pr-4 text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
        />
      </div>
    </div>
  );
}