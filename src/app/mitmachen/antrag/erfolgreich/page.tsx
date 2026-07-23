import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

import { PortalShell } from "@/components/portal/portal-shell";

export const metadata: Metadata = {
  title: "Antrag eingegangen",
};

export default function ApplicationSuccessPage() {
  return (
    <PortalShell
      eyebrow="Mitgliedsantrag"
      title="Dein Antrag wurde gespeichert"
      description="Der Antrag ist erfolgreich in der lokalen Mitgliederverwaltung eingegangen und wartet jetzt auf die Prüfung."
    >
      <div className="surface-card mx-auto max-w-2xl p-8 text-center sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent-light">
          <CheckCircle2 size={32} />
        </div>

        <h2 className="mt-6 text-2xl font-bold text-content">
          Vielen Dank für dein Interesse
        </h2>

        <p className="mt-4 leading-8 text-muted">
          Aktuell wird noch keine Bestätigungs-E-Mail
          verschickt. In der Testumgebung kann der
          Antrag direkt über Prisma Studio oder später
          über den Adminbereich eingesehen werden.
        </p>

        <p className="mt-4 text-sm leading-7 text-subtle">
          Durch das Absenden wurde noch kein
          Benutzerkonto erstellt. Das Konto kann erst
          nach der Genehmigung und Vergabe einer
          Mitgliedsnummer aktiviert werden.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-5 py-3 text-sm font-semibold text-content transition hover:border-accent-border"
          >
            Zur Startseite
          </Link>

          <Link
            href="/portal"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-light"
          >
            Zum Mitgliederportal
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </PortalShell>
  );
}