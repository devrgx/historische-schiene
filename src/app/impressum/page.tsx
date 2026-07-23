import type { Metadata } from "next";
import {
  Building2,
  CircleAlert,
  Mail,
  MapPin,
  Phone,
  Scale,
  UserRound,
} from "lucide-react";

import { LegalPlaceholder } from "@/components/legal/legal-placeholder";
import { LegalSection } from "@/components/legal/legal-section";
import { PageHeader } from "@/components/ui/page-header";
import { legalConfig } from "@/config/legal";

export const metadata: Metadata = {
  title: "Impressum",
  description:
    "Anbieterkennzeichnung und rechtliche Informationen der Historischen Schiene.",
};

function hasPlaceholder(value: string): boolean {
  return value.includes("[") || value.includes("]");
}

export default function ImpressumPage() {
  const fullAddress = [
    legalConfig.address.street,
    `${legalConfig.address.postalCode} ${legalConfig.address.city}`,
    legalConfig.address.country,
  ];

  const addressIncomplete = fullAddress.some(
    hasPlaceholder,
  );

  const representationIncomplete =
    legalConfig.representedBy.some(hasPlaceholder);

  return (
    <>
      <PageHeader
        eyebrow="Rechtliche Informationen"
        title="Impressum"
        description="Anbieterkennzeichnung und Kontaktinformationen der Historischen Schiene."
      />

      <section className="border-b border-line bg-page-soft">
        <div className="site-container py-8">
          <div className="flex gap-4 rounded-2xl border border-accent-border bg-accent-soft p-5">
            <CircleAlert
              size={23}
              className="mt-0.5 shrink-0 text-accent-light"
            />

            <div>
              <h2 className="font-semibold text-content">
                Angaben noch nicht vollständig
              </h2>

              <p className="mt-2 text-sm leading-7 text-muted">
                Diese Seite befindet sich noch in Vorbereitung.
                Vor der öffentlichen Freischaltung müssen alle
                Platzhalter durch die tatsächlichen Angaben der
                verantwortlichen Person beziehungsweise des
                gegründeten Vereins ersetzt werden.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container grid gap-10 lg:grid-cols-[17rem_1fr]">
          <aside className="h-fit lg:sticky lg:top-28">
            <nav
              aria-label="Inhaltsverzeichnis des Impressums"
              className="surface-card p-5"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent-light">
                Inhalt
              </p>

              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  <a
                    href="#anbieter"
                    className="text-muted transition hover:text-content"
                  >
                    Anbieter
                  </a>
                </li>

                <li>
                  <a
                    href="#vertretung"
                    className="text-muted transition hover:text-content"
                  >
                    Vertretung
                  </a>
                </li>

                <li>
                  <a
                    href="#kontakt"
                    className="text-muted transition hover:text-content"
                  >
                    Kontakt
                  </a>
                </li>

                <li>
                  <a
                    href="#register"
                    className="text-muted transition hover:text-content"
                  >
                    Vereinsregister
                  </a>
                </li>

                <li>
                  <a
                    href="#inhalt"
                    className="text-muted transition hover:text-content"
                  >
                    Inhaltlich verantwortlich
                  </a>
                </li>

                <li>
                  <a
                    href="#haftung"
                    className="text-muted transition hover:text-content"
                  >
                    Haftungshinweise
                  </a>
                </li>
              </ul>
            </nav>
          </aside>

          <article className="surface-card space-y-10 p-7 sm:p-10">
            <LegalSection
              id="anbieter"
              title="Angaben zum Anbieter"
            >
              <div className="flex gap-4">
                <Building2
                  size={22}
                  className="mt-1 shrink-0 text-accent-light"
                />

                <address className="not-italic">
                  <p className="font-semibold text-content">
                    {legalConfig.legalName}
                  </p>

                  {fullAddress.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </address>
              </div>

              {addressIncomplete ? (
                <LegalPlaceholder>
                  Die vollständige ladungsfähige Anschrift muss
                  vor Veröffentlichung in{" "}
                  <code className="rounded bg-page-soft px-1.5 py-0.5 text-content">
                    src/config/legal.ts
                  </code>{" "}
                  ergänzt werden.
                </LegalPlaceholder>
              ) : null}

              {legalConfig.formationStatus ===
              "in-formation" ? (
                <p>
                  Die Historische Schiene befindet sich derzeit
                  in der Aufbau- und Gründungsphase. Eine
                  Eintragung in das Vereinsregister ist noch
                  nicht erfolgt.
                </p>
              ) : null}
            </LegalSection>

            <LegalSection
              id="vertretung"
              title="Vertretung"
            >
              <div className="flex gap-4">
                <UserRound
                  size={22}
                  className="mt-1 shrink-0 text-accent-light"
                />

                <div>
                  <p>
                    Verantwortlich beziehungsweise vertreten
                    durch:
                  </p>

                  <ul className="mt-3 space-y-2">
                    {legalConfig.representedBy.map(
                      (representative) => (
                        <li
                          key={representative}
                          className="font-medium text-content"
                        >
                          {representative}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>

              {representationIncomplete ? (
                <LegalPlaceholder>
                  Name und Funktion der tatsächlich
                  verantwortlichen Person müssen noch ergänzt
                  werden.
                </LegalPlaceholder>
              ) : null}
            </LegalSection>

            <LegalSection
              id="kontakt"
              title="Kontakt"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <a
                  href={`mailto:${legalConfig.email}`}
                  className="flex items-start gap-3 rounded-2xl border border-line bg-page-soft p-5 transition hover:border-accent-border"
                >
                  <Mail
                    size={21}
                    className="mt-0.5 shrink-0 text-accent-light"
                  />

                  <div>
                    <p className="text-sm text-subtle">
                      E-Mail
                    </p>

                    <p className="mt-1 break-all font-semibold text-content">
                      {legalConfig.email}
                    </p>
                  </div>
                </a>

                {legalConfig.phone ? (
                  <a
                    href={`tel:${legalConfig.phone.replace(/\s/g, "")}`}
                    className="flex items-start gap-3 rounded-2xl border border-line bg-page-soft p-5 transition hover:border-accent-border"
                  >
                    <Phone
                      size={21}
                      className="mt-0.5 shrink-0 text-accent-light"
                    />

                    <div>
                      <p className="text-sm text-subtle">
                        Telefon
                      </p>

                      <p className="mt-1 font-semibold text-content">
                        {legalConfig.phone}
                      </p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-start gap-3 rounded-2xl border border-line bg-page-soft p-5">
                    <Phone
                      size={21}
                      className="mt-0.5 shrink-0 text-subtle"
                    />

                    <div>
                      <p className="text-sm text-subtle">
                        Telefon
                      </p>

                      <p className="mt-1 text-muted">
                        Derzeit nicht öffentlich angegeben
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </LegalSection>

            <LegalSection
              id="register"
              title="Vereinsregister"
            >
              {legalConfig.registerCourt &&
              legalConfig.registerNumber ? (
                <div className="flex gap-4">
                  <Scale
                    size={22}
                    className="mt-1 shrink-0 text-accent-light"
                  />

                  <div>
                    <p>
                      Registergericht:{" "}
                      <span className="font-semibold text-content">
                        {legalConfig.registerCourt}
                      </span>
                    </p>

                    <p>
                      Registernummer:{" "}
                      <span className="font-semibold text-content">
                        {legalConfig.registerNumber}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <LegalPlaceholder title="Noch keine Registereintragung">
                  Der Verein ist derzeit noch nicht in das
                  Vereinsregister eingetragen. Registergericht
                  und Registernummer werden nach erfolgter
                  Eintragung ergänzt.
                </LegalPlaceholder>
              )}
            </LegalSection>

            <LegalSection
              id="inhalt"
              title="Verantwortlich für redaktionelle Inhalte"
            >
              <div className="flex gap-4">
                <MapPin
                  size={22}
                  className="mt-1 shrink-0 text-accent-light"
                />

                <p>
                  {legalConfig.responsibleForContent}
                </p>
              </div>

              {hasPlaceholder(
                legalConfig.responsibleForContent,
              ) ? (
                <LegalPlaceholder>
                  Die für redaktionelle Inhalte verantwortliche
                  Person und ihre vollständige Anschrift müssen
                  noch ergänzt werden.
                </LegalPlaceholder>
              ) : null}
            </LegalSection>

            <LegalSection
              id="haftung"
              title="Haftung für Inhalte und Verweise"
            >
              <p>
                Die Inhalte dieser Website werden mit
                größtmöglicher Sorgfalt erstellt. Eine Gewähr
                für Vollständigkeit, Richtigkeit und ständige
                Aktualität kann jedoch nicht übernommen werden.
              </p>

              <p>
                Diese Website kann Verweise auf externe
                Internetseiten enthalten. Auf deren Inhalte
                haben wir keinen unmittelbaren Einfluss. Für die
                Inhalte der verlinkten Seiten ist der jeweilige
                Betreiber verantwortlich.
              </p>

              <p>
                Sollten rechtswidrige oder problematische Inhalte
                auffallen, bitten wir um einen Hinweis an{" "}
                <a
                  href={`mailto:${legalConfig.email}`}
                  className="font-semibold text-content transition hover:text-accent-light"
                >
                  {legalConfig.email}
                </a>
                .
              </p>
            </LegalSection>
          </article>
        </div>
      </section>
    </>
  );
}