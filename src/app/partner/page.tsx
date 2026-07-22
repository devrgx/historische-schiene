import type { Metadata } from "next";
import {
  ArrowRight,
  Building2,
  CircleAlert,
  Handshake,
  HeartHandshake,
  Landmark,
  Mail,
  Network,
  ShieldCheck,
  TrainFront,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";

import { CooperationCard } from "@/components/partners/cooperation-card";
import { PartnerCard } from "@/components/partners/partner-card";
import { ButtonLink } from "@/components/ui/button-link";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  cooperationOpportunities,
  publicPartners,
} from "@/data/partners";

export const metadata: Metadata = {
  title: "Partner und Kooperationen",
  description:
    "Partnerschaften und Kooperationsmöglichkeiten der Historischen Schiene mit Eisenbahnunternehmen, Werkstätten, Kommunen, Vereinen und Unterstützern.",
};

const partnerGroups = [
  {
    title: "Eisenbahnunternehmen",
    description:
      "Für Fahrzeugüberführungen, technischen Betrieb, Personal und spätere Sonderfahrten.",
    icon: TrainFront,
  },
  {
    title: "Werkstätten und Technik",
    description:
      "Für Instandhaltung, Untersuchungen, Ersatzteile, Werkzeuge und fachliche Unterstützung.",
    icon: Wrench,
  },
  {
    title: "Infrastrukturbetreiber",
    description:
      "Für Abstellgleise, Werkstattzugänge, Rangiermöglichkeiten und Trassenplanung.",
    icon: Network,
  },
  {
    title: "Kommunen und Regionen",
    description:
      "Für regionale Veranstaltungen, Tourismus, Flächen und den Erhalt lokaler Eisenbahngeschichte.",
    icon: Landmark,
  },
  {
    title: "Vereine und Initiativen",
    description:
      "Für Erfahrungsaustausch, gemeinsame Projekte und gegenseitige Unterstützung.",
    icon: Users,
  },
  {
    title: "Unternehmen und Förderer",
    description:
      "Für Sachspenden, Dienstleistungen, finanzielle Förderung und langfristige Zusammenarbeit.",
    icon: Building2,
  },
];

export default function PartnerPage() {
  return (
    <>
      <PageHeader
        eyebrow="Gemeinsam Eisenbahngeschichte erhalten"
        title="Partner und Kooperationen"
        description="Die Erhaltung historischer Eisenbahnfahrzeuge gelingt nur gemeinsam. Deshalb suchen wir zuverlässige Partner aus Eisenbahn, Wirtschaft, Kommunen, Vereinen und Gesellschaft."
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
                Partnerbereich im Aufbau
              </h2>

              <p className="mt-2 text-sm leading-7 text-muted">
                Aktuelle Partner werden erst nach gemeinsamer Abstimmung und
                ausdrücklicher Freigabe öffentlich dargestellt. Die folgenden
                Bereiche zeigen bereits, welche Formen der Zusammenarbeit wir
                langfristig anstreben.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container">
          <SectionHeading
            eyebrow="Gemeinsam mehr erreichen"
            title="Welche Partner wir suchen"
            description="Für unsere Fahrzeug-, Infrastruktur- und Veranstaltungsprojekte sind unterschiedliche Fachbereiche und Unterstützungsformen wichtig."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {partnerGroups.map((group) => {
              const Icon = group.icon;

              return (
                <article
                  key={group.title}
                  className="surface-card p-6 transition duration-300 hover:-translate-y-1 hover:border-accent-border hover:bg-surface-hover sm:p-7"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
                    <Icon size={23} />
                  </div>

                  <h2 className="mt-6 text-xl font-bold text-content">
                    {group.title}
                  </h2>

                  <p className="mt-3 leading-7 text-muted">
                    {group.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-page-soft">
        <div className="site-container section-spacing">
          <SectionHeading
            eyebrow="Möglichkeiten der Zusammenarbeit"
            title="So können Partner unterstützen"
            description="Eine Kooperation kann fachlich, organisatorisch, materiell oder finanziell gestaltet werden."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cooperationOpportunities.map((cooperation) => (
              <CooperationCard
                key={cooperation.id}
                cooperation={cooperation}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container">
          <SectionHeading
            eyebrow="Unsere Partner"
            title="Gemeinsam für historische Schienenfahrzeuge"
            description="Hier stellen wir später öffentlich freigegebene Partner und gemeinsame Projekte vor."
          />

          {publicPartners.length > 0 ? (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {publicPartners.map((partner) => (
                <PartnerCard
                  key={partner.id}
                  partner={partner}
                />
              ))}
            </div>
          ) : (
            <div className="surface-card mt-12 px-6 py-14 text-center sm:px-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent-light">
                <HeartHandshake size={31} />
              </div>

              <h2 className="mt-6 text-2xl font-bold text-content">
                Noch keine Partner veröffentlicht
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-8 text-muted">
                Gespräche und mögliche Kooperationen werden erst nach einer
                gemeinsamen Abstimmung veröffentlicht. Logos und Namen werden
                niemals ohne Zustimmung verwendet.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-line bg-page-soft">
        <div className="site-container section-spacing">
          <div className="grid gap-8 lg:grid-cols-2">
            <article className="surface-card p-8 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
                <ShieldCheck size={24} />
              </div>

              <h2 className="mt-6 text-3xl font-bold text-content">
                Transparente Zusammenarbeit
              </h2>

              <p className="mt-5 leading-8 text-muted">
                Kooperationen sollen nachvollziehbar, projektbezogen und mit
                den Zielen des Vereins vereinbar sein. Eine Unterstützung
                bedeutet nicht automatisch Einfluss auf vereinsinterne
                Entscheidungen.
              </p>

              <ul className="mt-7 space-y-3 text-sm leading-7 text-muted">
                <li className="flex items-start gap-3">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-light" />
                  Veröffentlichung nur nach Zustimmung des Partners
                </li>

                <li className="flex items-start gap-3">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-light" />
                  Klare Absprachen zu Leistungen und Gegenleistungen
                </li>

                <li className="flex items-start gap-3">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-light" />
                  Keine unzulässige Einflussnahme auf den Verein
                </li>

                <li className="flex items-start gap-3">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-light" />
                  Verantwortungsbewusster Umgang mit Namen und Logos
                </li>
              </ul>
            </article>

            <article className="rounded-3xl border border-accent-border bg-accent-soft p-8 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-accent-light">
                <Handshake size={24} />
              </div>

              <h2 className="mt-6 text-3xl font-bold text-content">
                Eine Zusammenarbeit vorschlagen
              </h2>

              <p className="mt-5 leading-8 text-muted">
                Unternehmen, Eisenbahnorganisationen, Kommunen, Vereine und
                private Förderer können sich direkt mit einer ersten Idee oder
                einem konkreten Angebot an uns wenden.
              </p>

              <a
                href="mailto:partner@historische-schiene.de?subject=Kooperationsanfrage%20an%20die%20Historische%20Schiene"
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-light"
              >
                <Mail size={18} />
                Kooperation anfragen
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container">
          <div className="rounded-3xl border border-accent-border bg-accent-soft p-8 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent-light">
                  Teil des Projekts werden
                </p>

                <h2 className="mt-4 text-3xl font-bold text-content sm:text-4xl">
                  Nicht nur Unternehmen können helfen
                </h2>

                <p className="mt-5 max-w-3xl leading-8 text-muted">
                  Auch Mitglieder, Ehrenamtliche und private Unterstützer
                  können Wissen, Zeit und Erfahrung in den Aufbau des Vereins
                  einbringen.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <ButtonLink href="/mitmachen">
                  Möglichkeiten entdecken
                  <ArrowRight
                    size={18}
                    className="ml-2"
                  />
                </ButtonLink>

                <Link
                  href="/kontakt"
                  className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-5 py-3 text-sm font-semibold text-content transition hover:border-accent-border hover:text-accent-light"
                >
                  Allgemeiner Kontakt
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}