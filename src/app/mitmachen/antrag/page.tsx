import type { Metadata } from "next";
import {
  ArrowLeft,
  CircleAlert,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { MembershipApplicationForm } from "@/components/membership/membership-application-form";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Mitgliedsantrag",
  description:
    "Digitaler Mitgliedsantrag der Historischen Schiene.",
};

export default function MembershipApplicationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Mitglied werden"
        title="Digitaler Mitgliedsantrag"
        description="Fülle den Antrag vollständig aus. Nach der Prüfung erhältst du eine Mitgliedsnummer und kannst anschließend dein Konto im Mitgliederportal aktivieren."
      />

      <section className="border-b border-line bg-page-soft">
        <div className="site-container py-8">
          <Link
            href="/mitmachen"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-content"
          >
            <ArrowLeft size={17} />
            Zurück zu Mitmachen
          </Link>

          <div className="mt-6 flex gap-4 rounded-2xl border border-accent-border bg-accent-soft p-5">
            <CircleAlert
              size={22}
              className="mt-0.5 shrink-0 text-accent-light"
            />

            <div>
              <h2 className="font-semibold text-content">
                Antrag wird zunächst geprüft
              </h2>

              <p className="mt-2 text-sm leading-7 text-muted">
                Durch das Absenden entsteht noch keine
                Mitgliedschaft und noch kein Benutzerkonto. Der
                Antrag wird zunächst gespeichert und muss später
                durch die Mitgliederverwaltung genehmigt werden.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container grid gap-10 lg:grid-cols-[1fr_19rem]">
          <MembershipApplicationForm />

          <aside className="h-fit space-y-6 lg:sticky lg:top-28">
            <div className="surface-card p-6">
              <FileCheck2
                size={28}
                className="text-accent-light"
              />

              <h2 className="mt-5 text-xl font-bold text-content">
                Ablauf
              </h2>

              <ol className="mt-5 space-y-5 text-sm leading-7 text-muted">
                <li>
                  <strong className="text-content">
                    1. Antrag absenden
                  </strong>
                  <br />
                  Deine Angaben werden in der
                  Mitgliederverwaltung gespeichert.
                </li>

                <li>
                  <strong className="text-content">
                    2. Prüfung
                  </strong>
                  <br />
                  Eine berechtigte Person prüft den
                  Antrag.
                </li>

                <li>
                  <strong className="text-content">
                    3. Genehmigung
                  </strong>
                  <br />
                  Nach der Aufnahme wird eine
                  Mitgliedsnummer vergeben.
                </li>

                <li>
                  <strong className="text-content">
                    4. Konto aktivieren
                  </strong>
                  <br />
                  Anschließend kannst du deinen
                  Portalzugang einrichten.
                </li>
              </ol>
            </div>

            <div className="rounded-2xl border border-accent-border bg-accent-soft p-6">
              <ShieldCheck
                size={27}
                className="text-accent-light"
              />

              <h2 className="mt-5 text-lg font-bold text-content">
                Minderjährige
              </h2>

              <p className="mt-3 text-sm leading-7 text-muted">
                Bei Personen unter 18 Jahren werden
                automatisch zusätzliche Pflichtfelder
                für einen Sorgeberechtigten und einen
                Notfallkontakt eingeblendet.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}