import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CircleAlert,
  FileCheck2,
  Handshake,
  HeartHandshake,
  History,
  Landmark,
  MapPin,
  Scale,
  ShieldCheck,
  TrainFront,
  Users,
  Wrench,
} from "lucide-react";

import { BoardCard } from "@/components/club/board-card";
import { DocumentCard } from "@/components/club/document-card";
import { ValueCard } from "@/components/club/value-card";
import { ButtonLink } from "@/components/ui/button-link";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Verein",
  description:
    "Informationen über die Historische Schiene, ihre Ziele, ihre Struktur und ihre geplante Vereinsarbeit.",
};

const values = [
  {
    title: "Erhalten",
    description:
      "Historische Eisenbahnfahrzeuge sollen gesichert, gepflegt und für kommende Generationen bewahrt werden.",
    icon: TrainFront,
  },
  {
    title: "Dokumentieren",
    description:
      "Wir möchten technische, betriebliche und regionale Eisenbahngeschichte verständlich dokumentieren.",
    icon: BookOpen,
  },
  {
    title: "Vermitteln",
    description:
      "Durch Veranstaltungen, Führungen und Medien soll Eisenbahngeschichte öffentlich erlebbar werden.",
    icon: History,
  },
  {
    title: "Gemeinsam arbeiten",
    description:
      "Unsere Projekte leben von Mitgliedern, Unterstützern und fachkundigen Partnern.",
    icon: Users,
  },
];

const workAreas = [
  {
    title: "Fahrzeugerhaltung",
    description:
      "Sicherung, Dokumentation, Pflege und mögliche Aufarbeitung historischer Eisenbahnfahrzeuge.",
    icon: Wrench,
  },
  {
    title: "Sonderfahrten",
    description:
      "Langfristig sollen historische Fahrzeuge bei Veranstaltungen und Sonderfahrten erlebbar werden.",
    icon: TrainFront,
  },
  {
    title: "Geschichtsarbeit",
    description:
      "Sammlung von Dokumenten, Bildern, Zeitzeugenberichten und technischen Informationen.",
    icon: History,
  },
  {
    title: "Öffentlichkeitsarbeit",
    description:
      "Berichte, Veranstaltungen und digitale Angebote zur Vermittlung unserer Vereinsarbeit.",
    icon: Landmark,
  },
  {
    title: "Kooperationen",
    description:
      "Zusammenarbeit mit Eisenbahnunternehmen, Vereinen, Kommunen und weiteren Institutionen.",
    icon: Handshake,
  },
  {
    title: "Infrastruktur",
    description:
      "Langfristige Suche nach Abstellgleisen, Werkstattflächen und geeigneten Restaurierungsmöglichkeiten.",
    icon: Building2,
  },
];

const boardMembers = [
  {
    functionName: "Vorsitz",
    description:
      "Vertretung des Vereins und Koordination der grundsätzlichen Vereinsarbeit.",
  },
  {
    functionName: "Stellvertretender Vorsitz",
    description:
      "Unterstützung und Vertretung des Vorsitzes sowie Begleitung zentraler Vereinsprojekte.",
  },
  {
    functionName: "Kassenwart",
    description:
      "Verantwortung für Finanzen, Beiträge, Buchhaltung und finanzielle Planung.",
  },
  {
    functionName: "Schriftführung",
    description:
      "Dokumentation von Sitzungen, Beschlüssen und organisatorischen Vorgängen.",
  },
];

const documents = [
  {
    title: "Satzung",
    description:
      "Rechtliche Grundlage, Vereinszweck und grundlegende Organisationsstruktur.",
  },
  {
    title: "Beitragsordnung",
    description:
      "Regelungen zu Mitgliedsbeiträgen, Aufnahmegebühren und Ermäßigungen.",
  },
  {
    title: "Jugendordnung",
    description:
      "Regelungen für junge Mitglieder und ihre Beteiligung an der Vereinsarbeit.",
  },
  {
    title: "Datenschutzordnung",
    description:
      "Interne Grundsätze zum Umgang mit personenbezogenen Daten.",
  },
];

export default function VereinPage() {
  return (
    <>
      <PageHeader
        eyebrow="Über uns"
        title="Eisenbahngeschichte gemeinsam bewahren"
        description="Die Historische Schiene befindet sich im Aufbau. Unser Ziel ist es, historische Eisenbahnfahrzeuge, regionale Bahngeschichte und technisches Wissen langfristig zu erhalten."
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
                Aktueller Vereinsstatus
              </h2>

              <p className="mt-2 text-sm leading-7 text-muted">
                Die Historische Schiene befindet sich derzeit in der
                Aufbau- und Gründungsphase. Die Eintragung als eingetragener
                Verein ist vorgesehen. Bis zur erfolgreichen Eintragung wird
                der Namenszusatz „e.V.“ noch nicht verwendet.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Wer wir sind"
                title="Ein Verein für historische Eisenbahn und regionale Geschichte"
                description="Wir möchten Menschen zusammenbringen, die sich für Eisenbahntechnik, historische Fahrzeuge und die Geschichte des Schienenverkehrs interessieren."
              />

              <div className="mt-7 space-y-5 text-lg leading-8 text-muted">
                <p>
                  Im Mittelpunkt stehen der Erhalt historischer Fahrzeuge,
                  ihre fachgerechte Dokumentation und eine langfristige
                  öffentliche Nutzung.
                </p>

                <p>
                  Der Verein soll sowohl technische Arbeiten als auch
                  organisatorische, geschichtliche und mediale Aufgaben
                  ermöglichen. Damit können sich Mitglieder mit
                  unterschiedlichen Fähigkeiten einbringen.
                </p>

                <p>
                  Ein besonderer Schwerpunkt liegt auf Fahrzeugen und
                  Eisenbahngeschichte mit Bezug zu Südostbayern und zum
                  regionalen Schienenverkehr.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-accent-border bg-accent-soft p-8 sm:p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-accent-light">
                <MapPin size={28} />
              </div>

              <h2 className="mt-7 text-2xl font-bold text-content">
                Regional verwurzelt
              </h2>

              <p className="mt-4 leading-8 text-muted">
                Der geplante Sitz des Vereins liegt in Mühldorf am Inn. Von
                dort aus möchten wir uns mit Eisenbahngeschichte in
                Südostbayern und darüber hinaus beschäftigen.
              </p>

              <ButtonLink
                href="/projekte"
                variant="secondary"
                className="mt-7"
              >
                Unsere Projekte ansehen
                <ArrowRight size={18} className="ml-2" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-page-soft">
        <div className="site-container section-spacing">
          <SectionHeading
            eyebrow="Unsere Grundsätze"
            title="Was unsere Vereinsarbeit prägt"
            description="Unsere Projekte sollen fachlich fundiert, nachvollziehbar und langfristig tragfähig umgesetzt werden."
            centered
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <ValueCard
                key={value.title}
                title={value.title}
                description={value.description}
                icon={value.icon}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container">
          <SectionHeading
            eyebrow="Vereinszweck"
            title="Unsere Ziele"
            description="Die Historische Schiene soll nicht nur Fahrzeuge besitzen, sondern Geschichte verantwortungsvoll bewahren und vermitteln."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <article className="surface-card p-7 sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
                <ShieldCheck size={24} />
              </div>

              <h3 className="mt-6 text-2xl font-bold text-content">
                Erhaltung und Pflege
              </h3>

              <ul className="mt-5 space-y-4 text-muted">
                {[
                  "Historische Eisenbahnfahrzeuge sichern und erhalten",
                  "Technische Zustände und Fahrzeuggeschichten dokumentieren",
                  "Fahrzeuge fachgerecht pflegen und restaurieren",
                  "Geeignete Abstell- und Arbeitsmöglichkeiten schaffen",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 leading-7"
                  >
                    <FileCheck2
                      size={18}
                      className="mt-1 shrink-0 text-accent-light"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="surface-card p-7 sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
                <HeartHandshake size={24} />
              </div>

              <h3 className="mt-6 text-2xl font-bold text-content">
                Bildung und Öffentlichkeit
              </h3>

              <ul className="mt-5 space-y-4 text-muted">
                {[
                  "Eisenbahngeschichte öffentlich zugänglich machen",
                  "Veranstaltungen und Führungen durchführen",
                  "Historische Unterlagen und Medien sammeln",
                  "Wissen an junge und interessierte Menschen weitergeben",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 leading-7"
                  >
                    <FileCheck2
                      size={18}
                      className="mt-1 shrink-0 text-accent-light"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-page-soft">
        <div className="site-container section-spacing">
          <SectionHeading
            eyebrow="Aufgabenbereiche"
            title="Viele Möglichkeiten, sich einzubringen"
            description="Ein Eisenbahnverein benötigt nicht nur technische Fachkräfte. Auch Organisation, Medienarbeit, Verwaltung und Geschichtsforschung sind wichtige Bestandteile."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workAreas.map((area) => (
              <ValueCard
                key={area.title}
                title={area.title}
                description={area.description}
                icon={area.icon}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container">
          <SectionHeading
            eyebrow="Vereinsleitung"
            title="Der Vorstand"
            description="Der Vorstand wird nach der Vereinsgründung und den entsprechenden Beschlüssen vollständig veröffentlicht."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {boardMembers.map((member) => (
              <BoardCard
                key={member.functionName}
                functionName={member.functionName}
                description={member.description}
              />
            ))}
          </div>

          <div className="mt-8 flex gap-4 rounded-2xl border border-line bg-surface p-5">
            <Scale
              size={22}
              className="mt-0.5 shrink-0 text-accent-light"
            />

            <p className="text-sm leading-7 text-muted">
              Die hier dargestellten Funktionen sind zunächst Platzhalter.
              Verbindliche Angaben zu Vorstand, Amtszeiten und
              Vertretungsberechtigung werden nach der Gründung und Eintragung
              ergänzt.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-page-soft">
        <div className="site-container section-spacing">
          <SectionHeading
            eyebrow="Regelwerke"
            title="Satzung und Ordnungen"
            description="Unsere Vereinsarbeit soll auf nachvollziehbaren und öffentlich zugänglichen Regelungen beruhen."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {documents.map((document) => (
              <DocumentCard
                key={document.title}
                title={document.title}
                description={document.description}
              />
            ))}
          </div>

          <p className="mt-6 text-sm leading-7 text-subtle">
            Die Dokumente werden nach ihrer endgültigen Beschlussfassung und
            vor der öffentlichen Freigabe hier bereitgestellt.
          </p>
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container">
          <div className="grid gap-8 lg:grid-cols-2">
            <article className="rounded-3xl border border-accent-border bg-accent-soft p-8 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-accent-light">
                <Users size={24} />
              </div>

              <h2 className="mt-6 text-3xl font-bold text-content">
                Mitglied werden
              </h2>

              <p className="mt-5 leading-8 text-muted">
                Unterstütze den Aufbau des Vereins und bringe deine
                Fähigkeiten, Erfahrungen oder Begeisterung für historische
                Eisenbahn ein.
              </p>

              <ButtonLink href="/mitmachen" className="mt-7">
                Möglichkeiten entdecken
                <ArrowRight size={18} className="ml-2" />
              </ButtonLink>
            </article>

            <article className="surface-card p-8 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
                <Handshake size={24} />
              </div>

              <h2 className="mt-6 text-3xl font-bold text-content">
                Zusammenarbeit
              </h2>

              <p className="mt-5 leading-8 text-muted">
                Für unsere langfristigen Ziele sind Kooperationen mit
                Unternehmen, Vereinen, Kommunen und Fachleuten besonders
                wichtig.
              </p>

              <p className="mt-5 text-sm text-subtle">
                Ein eigener Bereich für Partner und Kooperationsanfragen wird
                später ergänzt.
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}