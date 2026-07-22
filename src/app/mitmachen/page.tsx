import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeEuro,
  BookOpen,
  CalendarCheck,
  Camera,
  Check,
  CircleAlert,
  ClipboardCheck,
  FileSignature,
  HandCoins,
  HeartHandshake,
  Mail,
  Megaphone,
  MessagesSquare,
  ShieldCheck,
  TrainFront,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";

import { MembershipCard } from "@/components/membership/membership-card";
import { ParticipationCard } from "@/components/membership/participation-card";
import { ButtonLink } from "@/components/ui/button-link";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Mitmachen",
  description:
    "Mitglied werden, die Historische Schiene unterstützen oder sich aktiv an unseren Projekten beteiligen.",
};

const memberships = [
  {
    title: "Ordentliche Mitgliedschaft",
    price: "30 €",
    priceDescription: "pro Jahr",
    description:
      "Für alle, die den Verein unterstützen und sich aktiv an seiner Entwicklung beteiligen möchten.",
    features: [
      "Teilnahme an Mitgliederversammlungen",
      "Stimmrecht entsprechend der Satzung",
      "Zugang zum späteren Mitgliederportal",
      "Teilnahme an internen Veranstaltungen",
      "Möglichkeit zur aktiven Projektmitarbeit",
    ],
    icon: Users,
    featured: true,
    badge: "Empfohlen",
  },
  {
    title: "Fördermitgliedschaft",
    price: "70 €",
    priceDescription: "pro Jahr",
    description:
      "Für Personen und Organisationen, die unsere Arbeit insbesondere finanziell unterstützen möchten.",
    features: [
      "Regelmäßige Informationen über Vereinsprojekte",
      "Einladung zu ausgewählten Veranstaltungen",
      "Unterstützung der Fahrzeugerhaltung",
      "Keine verpflichtende aktive Mitarbeit",
      "Höherer Beitrag zur Projektfinanzierung",
    ],
    icon: HeartHandshake,
  },
  {
    title: "Ermäßigte Mitgliedschaft",
    price: "16 €",
    priceDescription: "pro Jahr",
    description:
      "Eine ermäßigte Mitgliedschaft ist für bestimmte Personengruppen mit entsprechendem Nachweis vorgesehen.",
    features: [
      "Grundsätzlich gleiche Vereinsmitgliedschaft",
      "Ermäßigter Jahresbeitrag",
      "Nachweis der Berechtigung erforderlich",
      "Jährliche Prüfung der Voraussetzungen möglich",
      "Halbjährliche Zahlung nach Beitragsordnung möglich",
    ],
    icon: BadgeEuro,
  },
];

const participationAreas = [
  {
    title: "Technik und Fahrzeuge",
    description:
      "Unterstütze die Prüfung, Pflege, Aufarbeitung und Dokumentation historischer Eisenbahnfahrzeuge.",
    examples: [
      "Mechanische und elektrische Arbeiten",
      "Fahrzeugreinigung und Konservierung",
      "Technische Dokumentation",
      "Werkzeug- und Materialverwaltung",
    ],
    icon: Wrench,
  },
  {
    title: "Organisation",
    description:
      "Plane Veranstaltungen, interne Abläufe und die organisatorische Entwicklung des Vereins.",
    examples: [
      "Veranstaltungsplanung",
      "Mitgliederverwaltung",
      "Terminorganisation",
      "Unterstützung bei Versammlungen",
    ],
    icon: CalendarCheck,
  },
  {
    title: "Öffentlichkeitsarbeit",
    description:
      "Hilf dabei, unsere Arbeit verständlich, transparent und ansprechend nach außen darzustellen.",
    examples: [
      "Texte und Vereinsnachrichten",
      "Social Media",
      "Pressearbeit",
      "Gestaltung von Informationsmaterial",
    ],
    icon: Megaphone,
  },
  {
    title: "Foto und Medien",
    description:
      "Dokumentiere Projekte, Veranstaltungen, Fahrzeuge und die Entwicklung des Vereins.",
    examples: [
      "Fotografie",
      "Videoaufnahmen",
      "Bildarchiv",
      "Web- und Grafikgestaltung",
    ],
    icon: Camera,
  },
  {
    title: "Geschichte und Archiv",
    description:
      "Sammle, ordne und vermittle historische Unterlagen und Informationen.",
    examples: [
      "Recherche",
      "Archivierung",
      "Zeitzeugenberichte",
      "Fahrzeug- und Streckengeschichte",
    ],
    icon: BookOpen,
  },
  {
    title: "Veranstaltungen und Fahrten",
    description:
      "Unterstütze langfristig bei öffentlichen Veranstaltungen und möglichen Sonderfahrten.",
    examples: [
      "Gästebetreuung",
      "Einlass und Information",
      "Verkauf und Organisation",
      "Unterstützung im Zug",
    ],
    icon: TrainFront,
  },
];

const joiningSteps = [
  {
    title: "Mitgliedschaft auswählen",
    description:
      "Entscheide, welche Mitgliedsform am besten zu deiner gewünschten Unterstützung passt.",
    icon: UserCheck,
  },
  {
    title: "Antrag ausfüllen",
    description:
      "Der digitale Mitgliedsantrag wird später direkt über diese Website bereitgestellt.",
    icon: FileSignature,
  },
  {
    title: "Antrag wird geprüft",
    description:
      "Der Vorstand prüft den Antrag nach den Bestimmungen der Satzung.",
    icon: ClipboardCheck,
  },
  {
    title: "Aufnahme und Mitgliedsnummer",
    description:
      "Nach erfolgreicher Aufnahme erhältst du deine Mitgliedsnummer und weitere Informationen.",
    icon: ShieldCheck,
  },
];

export default function MitmachenPage() {
  return (
    <>
      <PageHeader
        eyebrow="Gemeinsam aktiv"
        title="Mitmachen und unterstützen"
        description="Historische Eisenbahn kann nur durch Menschen erhalten werden, die sich mit Zeit, Wissen, Ideen oder finanzieller Unterstützung einbringen."
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
                Mitgliedschaft noch in Vorbereitung
              </h2>

              <p className="mt-2 text-sm leading-7 text-muted">
                Die Historische Schiene befindet sich derzeit in der Aufbau-
                und Gründungsphase. Mitgliedschaften, Beiträge und
                Aufnahmeverfahren werden erst nach der Vereinsgründung und den
                notwendigen Beschlüssen verbindlich angeboten.
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
                eyebrow="Warum mitmachen?"
                title="Geschichte braucht Menschen"
                description="Unsere Projekte bestehen nicht nur aus Fahrzeugen. Sie benötigen Organisation, Fachwissen, Kreativität und eine Gemeinschaft, die langfristig Verantwortung übernimmt."
              />

              <div className="mt-8 space-y-5 text-lg leading-8 text-muted">
                <p>
                  Als Mitglied kannst du die Entwicklung des Vereins
                  mitgestalten und dich entsprechend deiner Interessen und
                  Möglichkeiten einbringen.
                </p>

                <p>
                  Eine berufliche Eisenbahnausbildung oder technische
                  Erfahrung ist dabei keine Voraussetzung. Viele wichtige
                  Aufgaben liegen in Verwaltung, Medienarbeit, Organisation,
                  Recherche und Veranstaltungsplanung.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-accent-border bg-accent-soft p-8 sm:p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-accent-light">
                <HeartHandshake size={27} />
              </div>

              <h2 className="mt-7 text-2xl font-bold text-content">
                Jede Unterstützung zählt
              </h2>

              <p className="mt-4 leading-8 text-muted">
                Du kannst regelmäßig aktiv mitarbeiten, einzelne Projekte
                unterstützen oder den Verein als Fördermitglied begleiten.
              </p>

              <ButtonLink
                href="#mitgliedschaften"
                variant="secondary"
                className="mt-7"
              >
                Mitgliedschaften ansehen
                <ArrowRight
                  size={18}
                  className="ml-2"
                />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section
        id="mitgliedschaften"
        className="scroll-mt-24 border-y border-line bg-page-soft"
      >
        <div className="site-container section-spacing">
          <SectionHeading
            eyebrow="Mitgliedschaft"
            title="Wie möchtest du uns unterstützen?"
            description="Die folgenden Mitgliedsformen und Beiträge entsprechen dem aktuellen Entwurf der Beitragsordnung."
            centered
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {memberships.map((membership) => (
              <MembershipCard
                key={membership.title}
                title={membership.title}
                price={membership.price}
                priceDescription={membership.priceDescription}
                description={membership.description}
                features={membership.features}
                icon={membership.icon}
                featured={membership.featured}
                badge={membership.badge}
              />
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
            <div className="flex gap-4">
              <HandCoins
                size={22}
                className="mt-0.5 shrink-0 text-accent-light"
              />

              <div>
                <h3 className="font-semibold text-content">
                  Aufnahmegebühr
                </h3>

                <p className="mt-2 text-sm leading-7 text-muted">
                  Zusätzlich zum Mitgliedsbeitrag ist nach dem derzeitigen
                  Entwurf eine einmalige Aufnahmegebühr von 5 € vorgesehen.
                  Bei einem Eintritt während des Jahres kann der Beitrag
                  anteilig berechnet werden.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container">
          <SectionHeading
            eyebrow="Aktive Mitarbeit"
            title="Wo du dich einbringen kannst"
            description="Unsere Vereinsarbeit umfasst technische, organisatorische, geschichtliche und kreative Aufgaben."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {participationAreas.map((area) => (
              <ParticipationCard
                key={area.title}
                title={area.title}
                description={area.description}
                examples={area.examples}
                icon={area.icon}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-page-soft">
        <div className="site-container section-spacing">
          <SectionHeading
            eyebrow="Für junge Mitglieder"
            title="Gemeinsam lernen und Verantwortung übernehmen"
            description="Auch junge Menschen sollen sich entsprechend ihres Alters, ihrer Fähigkeiten und unter geeigneter Aufsicht an der Vereinsarbeit beteiligen können."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <article className="surface-card p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft font-bold text-accent-light">
                U14
              </span>

              <h3 className="mt-6 text-xl font-bold text-content">
                Unter 14 Jahren
              </h3>

              <p className="mt-3 leading-7 text-muted">
                Teilnahme an geeigneten Vereinsveranstaltungen. Tätigkeiten in
                Werkstatt- und Arbeitsbereichen sind nicht vorgesehen.
              </p>
            </article>

            <article className="surface-card p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft font-bold text-accent-light">
                14+
              </span>

              <h3 className="mt-6 text-xl font-bold text-content">
                Ab 14 Jahren
              </h3>

              <p className="mt-3 leading-7 text-muted">
                Einfache und geeignete Arbeiten können unter fachkundiger
                Aufsicht und unter Beachtung des Jugendarbeitsschutzes
                ermöglicht werden.
              </p>
            </article>

            <article className="surface-card p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft font-bold text-accent-light">
                U18
              </span>

              <h3 className="mt-6 text-xl font-bold text-content">
                Minderjährige Mitglieder
              </h3>

              <p className="mt-3 leading-7 text-muted">
                Für Mitgliedschaft und bestimmte Aktivitäten ist die
                Zustimmung der Erziehungsberechtigten erforderlich.
              </p>
            </article>
          </div>

          <p className="mt-7 text-sm leading-7 text-subtle">
            Die konkreten Regelungen ergeben sich später aus Satzung,
            Jugendordnung, Sicherheitsvorgaben und den gesetzlichen
            Bestimmungen.
          </p>
        </div>
      </section>

      <section
        id="beitritt"
        className="scroll-mt-24 section-spacing"
      >
        <div className="site-container">
          <SectionHeading
            eyebrow="Aufnahmeverfahren"
            title="So läuft der Beitritt künftig ab"
            description="Der Mitgliedsantrag wird später digital und alternativ als herunterladbares Dokument angeboten."
            centered
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {joiningSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.title}
                  className="surface-card relative p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
                      <Icon size={22} />
                    </span>

                    <span className="text-3xl font-bold text-white/10">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-content">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-muted">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-10 rounded-3xl border border-accent-border bg-accent-soft p-8 text-center sm:p-10">
            <FileSignature
              size={38}
              className="mx-auto text-accent-light"
            />

            <h2 className="mt-6 text-3xl font-bold text-content">
              Digitaler Mitgliedsantrag folgt
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-8 text-muted">
              Der Mitgliedsantrag ist noch nicht freigeschaltet. Nach der
              Vereinsgründung wird hier ein sicheres Onlineformular
              bereitgestellt.
            </p>

            <button
              type="button"
              disabled
              className="mt-7 cursor-not-allowed rounded-lg bg-surface px-6 py-3 text-sm font-semibold text-subtle"
            >
              Antrag noch nicht verfügbar
            </button>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-page-soft">
        <div className="site-container section-spacing">
          <div className="grid gap-8 lg:grid-cols-2">
            <article className="surface-card p-8 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
                <MessagesSquare size={24} />
              </div>

              <h2 className="mt-6 text-3xl font-bold text-content">
                Fragen zur Mitgliedschaft?
              </h2>

              <p className="mt-5 leading-8 text-muted">
                Bei Fragen zu Mitgliedsformen, Beiträgen oder Möglichkeiten
                zur Mitarbeit kannst du uns bereits jetzt kontaktieren.
              </p>

              <ButtonLink
                href="/kontakt"
                variant="secondary"
                className="mt-7"
              >
                Kontakt aufnehmen
                <Mail
                  size={18}
                  className="ml-2"
                />
              </ButtonLink>
            </article>

            <article className="rounded-3xl border border-accent-border bg-accent-soft p-8 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-accent-light">
                <TrainFront size={24} />
              </div>

              <h2 className="mt-6 text-3xl font-bold text-content">
                Unsere Ziele unterstützen
              </h2>

              <p className="mt-5 leading-8 text-muted">
                Erfahre mehr über unsere geplanten Fahrzeugprojekte und unsere
                langfristige Vision einer eigenen Abstell- und
                Restaurierungsanlage.
              </p>

              <ButtonLink
                href="/projekte"
                className="mt-7"
              >
                Projekte entdecken
                <ArrowRight
                  size={18}
                  className="ml-2"
                />
              </ButtonLink>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}