import type { Metadata } from "next";
import {
  CircleAlert,
  Database,
  FileClock,
  Globe2,
  LockKeyhole,
  Mail,
  Server,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import { LegalPlaceholder } from "@/components/legal/legal-placeholder";
import { LegalSection } from "@/components/legal/legal-section";
import { PageHeader } from "@/components/ui/page-header";
import { legalConfig } from "@/config/legal";

export const metadata: Metadata = {
  title: "Datenschutz",
  description:
    "Informationen zur Verarbeitung personenbezogener Daten auf der Website der Historischen Schiene.",
};

function hasPlaceholder(value: string): boolean {
  return value.includes("[") || value.includes("]");
}

export default function DatenschutzPage() {
  const addressLines = [
    legalConfig.address.street,
    `${legalConfig.address.postalCode} ${legalConfig.address.city}`,
    legalConfig.address.country,
  ];

  const addressIncomplete =
    addressLines.some(hasPlaceholder);

  return (
    <>
      <PageHeader
        eyebrow="Schutz personenbezogener Daten"
        title="Datenschutzerklärung"
        description="Hier informieren wir über die Verarbeitung personenbezogener Daten beim Besuch unserer Website und bei der Kontaktaufnahme."
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
                Datenschutzerklärung an den technischen Stand
                anpassen
              </h2>

              <p className="mt-2 text-sm leading-7 text-muted">
                Diese Fassung beschreibt den derzeit vorgesehenen
                Betrieb ohne aktives Kontaktformular, Newsletter,
                Analysewerkzeuge und Mitgliederanmeldung. Sobald
                weitere Funktionen aktiviert werden, muss die
                Erklärung entsprechend erweitert werden.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container grid gap-10 lg:grid-cols-[17rem_1fr]">
          <aside className="h-fit lg:sticky lg:top-28">
            <nav
              aria-label="Inhaltsverzeichnis der Datenschutzerklärung"
              className="surface-card p-5"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent-light">
                Inhalt
              </p>

              <ul className="mt-5 space-y-3 text-sm">
                {[
                  ["verantwortlicher", "Verantwortlicher"],
                  ["hosting", "Hosting und Serverdaten"],
                  ["kontakt", "Kontaktaufnahme"],
                  ["cookies", "Cookies und Tracking"],
                  ["empfaenger", "Empfänger"],
                  ["speicherdauer", "Speicherdauer"],
                  ["rechte", "Betroffenenrechte"],
                  ["beschwerde", "Beschwerderecht"],
                  ["sicherheit", "Datensicherheit"],
                  ["aenderungen", "Änderungen"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <a
                      href={`#${href}`}
                      className="text-muted transition hover:text-content"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <article className="surface-card space-y-10 p-7 sm:p-10">
            <LegalSection
              id="verantwortlicher"
              title="1. Verantwortlicher"
            >
              <p>
                Verantwortlich für die Verarbeitung
                personenbezogener Daten im Zusammenhang mit
                dieser Website ist:
              </p>

              <address className="not-italic">
                <p className="font-semibold text-content">
                  {legalConfig.legalName}
                </p>

                {addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}

                <p className="mt-3">
                  E-Mail:{" "}
                  <a
                    href={`mailto:${legalConfig.privacyContactEmail}`}
                    className="font-semibold text-content transition hover:text-accent-light"
                  >
                    {legalConfig.privacyContactEmail}
                  </a>
                </p>
              </address>

              {addressIncomplete ? (
                <LegalPlaceholder>
                  Die vollständige Anschrift des
                  Verantwortlichen muss vor Veröffentlichung
                  ergänzt werden.
                </LegalPlaceholder>
              ) : null}
            </LegalSection>

            <LegalSection
              id="hosting"
              title="2. Hosting und Server-Protokolldaten"
            >
              <div className="flex gap-4">
                <Server
                  size={23}
                  className="mt-1 shrink-0 text-accent-light"
                />

                <div>
                  <p>
                    Diese Website wird bei folgendem Anbieter
                    betrieben:
                  </p>

                  <div className="mt-3">
                    <p className="font-semibold text-content">
                      {legalConfig.hostingProvider.name}
                    </p>

                    {legalConfig.hostingProvider.addressLines.map(
                      (line) => (
                        <p key={line}>{line}</p>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <p>
                Beim Aufruf der Website können technisch
                erforderliche Informationen in Server-
                Protokolldateien verarbeitet werden. Dazu können
                insbesondere gehören:
              </p>

              <ul className="space-y-2">
                {[
                  "IP-Adresse des zugreifenden Geräts",
                  "Datum und Uhrzeit des Zugriffs",
                  "aufgerufene Seite oder Datei",
                  "übertragene Datenmenge",
                  "Browsertyp und Browserversion",
                  "Betriebssystem",
                  "zuvor besuchte Seite beziehungsweise Referrer",
                  "HTTP-Statuscode",
                ].map((entry) => (
                  <li
                    key={entry}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-light" />
                    <span>{entry}</span>
                  </li>
                ))}
              </ul>

              <p>
                Die Verarbeitung dient der sicheren und
                zuverlässigen Bereitstellung der Website, der
                Fehleranalyse und der Abwehr missbräuchlicher
                Zugriffe. Als Rechtsgrundlage kommt insbesondere
                Art. 6 Abs. 1 Buchstabe f DSGVO in Betracht. Das
                berechtigte Interesse liegt im sicheren und
                funktionsfähigen Betrieb des Internetangebots.
              </p>

              <p>
                Mit dem Hostinganbieter sollte vor dem
                Produktivbetrieb geprüft werden, ob ein Vertrag
                zur Auftragsverarbeitung erforderlich und
                abgeschlossen ist. Ebenso sind die tatsächlichen
                Speicherfristen der Server-Protokolldaten anhand
                des verwendeten Hostingtarifs zu ergänzen.
              </p>
            </LegalSection>

            <LegalSection
              id="kontakt"
              title="3. Kontaktaufnahme"
            >
              <div className="flex gap-4">
                <Mail
                  size={23}
                  className="mt-1 shrink-0 text-accent-light"
                />

                <p>
                  Bei einer Kontaktaufnahme per E-Mail verarbeiten
                  wir die übermittelten Angaben, um die Anfrage zu
                  bearbeiten und gegebenenfalls Rückfragen zu
                  beantworten.
                </p>
              </div>

              <p>
                Verarbeitet werden können insbesondere Name,
                E-Mail-Adresse, Inhalt der Nachricht,
                Kommunikationszeitpunkt und weitere freiwillig
                übermittelte Angaben.
              </p>

              <p>
                Die Rechtsgrundlage richtet sich nach dem Inhalt
                der Anfrage. Bei vorvertraglichen oder
                mitgliedschaftsbezogenen Anfragen kommt
                insbesondere Art. 6 Abs. 1 Buchstabe b DSGVO in
                Betracht. Bei allgemeinen Anfragen kann die
                Verarbeitung auf Art. 6 Abs. 1 Buchstabe f DSGVO
                gestützt werden. Das berechtigte Interesse liegt
                in der sachgerechten Bearbeitung der Anfrage.
              </p>

              {!legalConfig.usesContactForm ? (
                <LegalPlaceholder title="Kontaktformular noch nicht aktiv">
                  Das auf der Kontaktseite dargestellte Formular
                  versendet aktuell keine Daten. Sobald es
                  aktiviert wird, müssen Übermittlungsweg,
                  Pflichtfelder, Rechtsgrundlage, Speicherfrist
                  und gegebenenfalls Spamschutz hier ergänzt
                  werden.
                </LegalPlaceholder>
              ) : null}
            </LegalSection>

            <LegalSection
              id="cookies"
              title="4. Cookies, lokale Speicherung und Analyse"
            >
              <div className="flex gap-4">
                <LockKeyhole
                  size={23}
                  className="mt-1 shrink-0 text-accent-light"
                />

                <p>
                  Nach der aktuellen Planung verwendet die
                  öffentlich zugängliche Website keine
                  Analysewerkzeuge, Werbetracker oder externen
                  Trackingdienste.
                </p>
              </div>

              {!legalConfig.usesAnalytics ? (
                <p>
                  Es findet derzeit keine Reichweitenmessung mit
                  Diensten wie Google Analytics, Matomo oder
                  vergleichbaren Werkzeugen statt.
                </p>
              ) : null}

              {!legalConfig.usesExternalFonts ? (
                <p>
                  Schriftarten werden nach der aktuellen Planung
                  nicht direkt von externen Schriftanbietern
                  geladen.
                </p>
              ) : null}

              {!legalConfig.usesNecessaryCookies ? (
                <p>
                  Die öffentliche Website setzt nach der
                  aktuellen Planung keine Cookies oder
                  vergleichbaren Speichermechanismen ein.
                </p>
              ) : (
                <p>
                  Es werden ausschließlich technisch notwendige
                  Speichermechanismen eingesetzt, soweit diese
                  für ausdrücklich angeforderte Funktionen
                  erforderlich sind.
                </p>
              )}

              <LegalPlaceholder title="Bei technischen Änderungen prüfen">
                Sobald Login, Mitgliederportal, eingebettete
                Videos, Karten, Statistikdienste oder andere
                Drittinhalte aktiviert werden, muss dieser
                Abschnitt vor der Veröffentlichung angepasst
                werden.
              </LegalPlaceholder>
            </LegalSection>

            <LegalSection
              id="empfaenger"
              title="5. Empfänger und Auftragsverarbeitung"
            >
              <div className="flex gap-4">
                <Database
                  size={23}
                  className="mt-1 shrink-0 text-accent-light"
                />

                <p>
                  Personenbezogene Daten werden nur an solche
                  Empfänger übermittelt, die für den Betrieb der
                  Website oder die Bearbeitung einer Anfrage
                  erforderlich sind.
                </p>
              </div>

              <p>
                Dazu kann insbesondere der Hostinganbieter{" "}
                <span className="font-semibold text-content">
                  {legalConfig.hostingProvider.name}
                </span>{" "}
                gehören. Eine darüber hinausgehende Weitergabe
                erfolgt nur, wenn eine Rechtsgrundlage besteht,
                eine gesetzliche Verpflichtung vorliegt oder die
                betroffene Person eingewilligt hat.
              </p>

              <p>
                Eine Verarbeitung außerhalb der Europäischen
                Union beziehungsweise des Europäischen
                Wirtschaftsraums ist nach der aktuellen Planung
                nicht vorgesehen. Diese Angabe muss bei der
                Einbindung externer Dienste erneut geprüft
                werden.
              </p>
            </LegalSection>

            <LegalSection
              id="speicherdauer"
              title="6. Speicherdauer"
            >
              <div className="flex gap-4">
                <FileClock
                  size={23}
                  className="mt-1 shrink-0 text-accent-light"
                />

                <p>
                  Personenbezogene Daten werden nur so lange
                  gespeichert, wie dies für den jeweiligen Zweck
                  erforderlich ist oder gesetzliche
                  Aufbewahrungspflichten bestehen.
                </p>
              </div>

              <p>
                Anfragen werden gelöscht, sobald sie abschließend
                bearbeitet wurden und keine gesetzlichen oder
                vertraglichen Gründe für eine weitere
                Speicherung bestehen.
              </p>

              <p>
                Die konkrete Speicherdauer der
                Server-Protokolldaten richtet sich nach der
                tatsächlichen Konfiguration des
                Hostinganbieters und muss vor dem
                Produktivbetrieb geprüft werden.
              </p>
            </LegalSection>

            <LegalSection
              id="rechte"
              title="7. Rechte betroffener Personen"
            >
              <div className="flex gap-4">
                <UserRoundCheck
                  size={23}
                  className="mt-1 shrink-0 text-accent-light"
                />

                <p>
                  Betroffene Personen können im Rahmen der
                  gesetzlichen Voraussetzungen insbesondere
                  folgende Rechte geltend machen:
                </p>
              </div>

              <ul className="grid gap-3 sm:grid-cols-2">
                {[
                  "Auskunft über verarbeitete Daten",
                  "Berichtigung unrichtiger Daten",
                  "Löschung personenbezogener Daten",
                  "Einschränkung der Verarbeitung",
                  "Datenübertragbarkeit",
                  "Widerspruch gegen bestimmte Verarbeitungen",
                  "Widerruf erteilter Einwilligungen",
                  "Beschwerde bei einer Aufsichtsbehörde",
                ].map((right) => (
                  <li
                    key={right}
                    className="rounded-xl border border-line bg-page-soft p-4 text-sm"
                  >
                    {right}
                  </li>
                ))}
              </ul>

              <p>
                Zur Ausübung dieser Rechte genügt eine Nachricht
                an{" "}
                <a
                  href={`mailto:${legalConfig.privacyContactEmail}`}
                  className="font-semibold text-content transition hover:text-accent-light"
                >
                  {legalConfig.privacyContactEmail}
                </a>
                .
              </p>
            </LegalSection>

            <LegalSection
              id="beschwerde"
              title="8. Beschwerderecht"
            >
              <p>
                Betroffene Personen haben das Recht, sich bei
                einer Datenschutzaufsichtsbehörde über die
                Verarbeitung ihrer personenbezogenen Daten zu
                beschweren.
              </p>

              <div className="rounded-2xl border border-line bg-page-soft p-5">
                <p className="font-semibold text-content">
                  {legalConfig.supervisoryAuthority.name}
                </p>

                <div className="mt-2">
                  {legalConfig.supervisoryAuthority.addressLines.map(
                    (line) => (
                      <p key={line}>{line}</p>
                    ),
                  )}
                </div>

                {legalConfig.supervisoryAuthority.website ? (
                  <a
                    href={
                      legalConfig.supervisoryAuthority.website
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex text-sm font-semibold text-content transition hover:text-accent-light"
                  >
                    Website der Aufsichtsbehörde
                  </a>
                ) : null}
              </div>
            </LegalSection>

            <LegalSection
              id="sicherheit"
              title="9. Datensicherheit"
            >
              <div className="flex gap-4">
                <ShieldCheck
                  size={23}
                  className="mt-1 shrink-0 text-accent-light"
                />

                <p>
                  Wir treffen angemessene technische und
                  organisatorische Maßnahmen, um
                  personenbezogene Daten vor Verlust,
                  Manipulation, unberechtigtem Zugriff und
                  sonstigem Missbrauch zu schützen.
                </p>
              </div>

              <p>
                Die Website soll ausschließlich verschlüsselt
                über HTTPS bereitgestellt werden. Dennoch kann
                bei der Kommunikation über das Internet keine
                absolute Sicherheit garantiert werden.
              </p>
            </LegalSection>

            <LegalSection
              id="aenderungen"
              title="10. Änderungen dieser Datenschutzerklärung"
            >
              <div className="flex gap-4">
                <Globe2
                  size={23}
                  className="mt-1 shrink-0 text-accent-light"
                />

                <p>
                  Diese Datenschutzerklärung wird angepasst,
                  sobald sich rechtliche Anforderungen,
                  eingesetzte Dienste oder Funktionen der Website
                  ändern.
                </p>
              </div>

              <p className="text-sm text-subtle">
                Stand: Juli 2026
              </p>
            </LegalSection>
          </article>
        </div>
      </section>
    </>
  );
}