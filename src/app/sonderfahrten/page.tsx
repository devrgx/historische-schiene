import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CircleAlert,
  Construction,
  Info,
  MapPin,
  Ticket,
  TrainFront,
  Users,
} from "lucide-react";
import Link from "next/link";

import { EventCard } from "@/components/events/event-card";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import { EventTypeBadge } from "@/components/events/event-type-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  featuredEvent,
  publicEvents,
} from "@/data/events";
import { formatEventDate } from "@/lib/event-date";

export const metadata: Metadata = {
  title: "Sonderfahrten und Veranstaltungen",
  description:
    "Geplante Sonderfahrten, öffentliche Veranstaltungen und langfristige Fahrtprojekte der Historischen Schiene.",
};

export default function SonderfahrtenPage() {
  const featuredEventSlug = featuredEvent?.slug;

  const additionalEvents = featuredEventSlug
    ? publicEvents.filter(
        (event) => event.slug !== featuredEventSlug,
      )
    : publicEvents;

  return (
    <>
      <PageHeader
        eyebrow="Unterwegs mit Geschichte"
        title="Sonderfahrten und Veranstaltungen"
        description="Hier informieren wir künftig über öffentliche Sonderfahrten, Informationsveranstaltungen und weitere Termine der Historischen Schiene."
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
                Noch keine verbindlichen Fahrtangebote
              </h2>

              <p className="mt-2 text-sm leading-7 text-muted">
                Der Verein befindet sich noch im Aufbau. Derzeit werden keine
                Fahrkarten verkauft und keine verbindlichen Sonderfahrten
                angeboten. Die dargestellten Einträge zeigen unsere
                vorgesehenen Veranstaltungsbereiche und langfristigen Ziele.
              </p>
            </div>
          </div>
        </div>
      </section>

      {featuredEvent ? (
        <section className="section-spacing">
          <div className="site-container">
            <SectionHeading
              eyebrow="Unser Fahrtziel"
              title="Historische Fahrzeuge wieder auf die Strecke bringen"
              description="Eine eigene Sonderfahrt ist ein langfristiges Ziel, das umfangreiche technische, betriebliche und finanzielle Vorbereitungen erfordert."
            />

            <article className="mt-12 overflow-hidden rounded-3xl border border-accent-border bg-surface">
              <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                <div className="relative flex min-h-96 items-center justify-center overflow-hidden bg-page-soft p-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--accent-soft),transparent_60%)]" />

                  <TrainFront
                    size={126}
                    strokeWidth={1}
                    className="relative text-accent-light"
                  />
                </div>

                <div className="flex flex-col justify-center p-8 sm:p-12">
                  <div className="flex flex-wrap items-center gap-4">
                    <EventTypeBadge type={featuredEvent.type} />
                    <EventStatusBadge status={featuredEvent.status} />
                  </div>

                  <h2 className="mt-7 text-3xl font-bold tracking-tight text-content sm:text-5xl">
                    {featuredEvent.title}
                  </h2>

                  <p className="mt-3 text-lg font-medium text-accent-light">
                    {featuredEvent.subtitle}
                  </p>

                  <p className="mt-6 max-w-2xl leading-8 text-muted">
                    {featuredEvent.shortDescription}
                  </p>

                  <div className="mt-7 space-y-3 text-sm text-subtle">
                    <p className="flex items-center gap-2">
                      <CalendarDays size={17} />
                      {formatEventDate(featuredEvent.startAt)}
                    </p>

                    {featuredEvent.route ? (
                      <p className="flex items-center gap-2">
                        <MapPin size={17} />
                        {featuredEvent.route}
                      </p>
                    ) : null}
                  </div>

                  <Link
                    href={`/sonderfahrten/${featuredEvent.slug}`}
                    className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-light"
                  >
                    Projektidee ansehen
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      <section className="border-y border-line bg-page-soft">
        <div className="site-container section-spacing">
          <SectionHeading
            eyebrow="Termine und Planungen"
            title="Weitere Veranstaltungen"
            description="Neben Sonderfahrten möchten wir auch Informationsveranstaltungen, Präsentationen und Vereinsaktivitäten anbieten."
          />

          {additionalEvents.length > 0 ? (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {additionalEvents.map((event) => (
                <EventCard
                  key={event.slug}
                  event={event}
                />
              ))}
            </div>
          ) : (
            <div className="surface-card mt-12 p-10 text-center">
              <CalendarClock
                size={44}
                className="mx-auto text-accent-light"
              />

              <h2 className="mt-6 text-2xl font-bold text-content">
                Derzeit keine weiteren Termine
              </h2>

              <p className="mt-4 text-muted">
                Neue Veranstaltungen werden hier veröffentlicht.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container">
          <SectionHeading
            eyebrow="Von der Idee zur Fahrt"
            title="Was für eine Sonderfahrt notwendig ist"
            description="Historische Zugfahrten erfordern deutlich mehr als ein Fahrzeug und einen Fahrplan."
            centered
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Fahrzeug",
                description:
                  "Ein technisch geeignetes und zugelassenes historisches Fahrzeug.",
                icon: TrainFront,
              },
              {
                title: "Betriebspartner",
                description:
                  "Zusammenarbeit mit einem zugelassenen Eisenbahnverkehrsunternehmen.",
                icon: Users,
              },
              {
                title: "Fahrplan und Trasse",
                description:
                  "Beantragung und Abstimmung der gewünschten Strecke und Fahrzeiten.",
                icon: CalendarDays,
              },
              {
                title: "Fahrkartenverkauf",
                description:
                  "Buchungssystem, Beförderungsbedingungen und Fahrgastinformation.",
                icon: Ticket,
              },
            ].map((requirement) => {
              const Icon = requirement.icon;

              return (
                <article
                  key={requirement.title}
                  className="surface-card p-6 text-center"
                >
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
                    <Icon size={23} />
                  </span>

                  <h3 className="mt-5 text-lg font-bold text-content">
                    {requirement.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-muted">
                    {requirement.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-page-soft">
        <div className="site-container section-spacing">
          <div className="grid gap-8 lg:grid-cols-2">
            <article className="surface-card p-8 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
                <Info size={24} />
              </div>

              <h2 className="mt-6 text-3xl font-bold text-content">
                Über neue Termine informiert bleiben
              </h2>

              <p className="mt-5 leading-8 text-muted">
                Neue Veranstaltungen und spätere Sonderfahrten werden im
                Bereich Aktuelles und auf dieser Seite angekündigt.
              </p>

              <ButtonLink
                href="/aktuelles"
                variant="secondary"
                className="mt-7"
              >
                Aktuelle Meldungen
                <ArrowRight
                  size={18}
                  className="ml-2"
                />
              </ButtonLink>
            </article>

            <article className="rounded-3xl border border-accent-border bg-accent-soft p-8 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-accent-light">
                <Construction size={24} />
              </div>

              <h2 className="mt-6 text-3xl font-bold text-content">
                Bei Veranstaltungen mithelfen
              </h2>

              <p className="mt-5 leading-8 text-muted">
                Für Veranstaltungen werden später Helfer für Organisation,
                Fahrgastbetreuung, Verkauf, Information und Dokumentation
                benötigt.
              </p>

              <ButtonLink
                href="/mitmachen"
                className="mt-7"
              >
                Möglichkeiten entdecken
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