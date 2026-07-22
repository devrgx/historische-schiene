import type { Metadata } from "next";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  ExternalLink,
  Info,
  MapPin,
  Ticket,
  TrainFront,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EventStatusBadge } from "@/components/events/event-status-badge";
import { EventTypeBadge } from "@/components/events/event-type-badge";
import {
  events,
  getEventBySlug,
} from "@/data/events";
import {
  formatEventDate,
  formatEventTime,
} from "@/lib/event-date";

type EventDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return events
    .filter((event) => event.public)
    .map((event) => ({
      slug: event.slug,
    }));
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    return {
      title: "Veranstaltung nicht gefunden",
    };
  }

  return {
    title: event.title,
    description: event.shortDescription,
  };
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <>
      <section className="accent-gradient border-b border-line">
        <div className="site-container py-16 sm:py-24">
          <Link
            href="/sonderfahrten"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-content"
          >
            <ArrowLeft size={17} />
            Zurück zu Sonderfahrten und Veranstaltungen
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <EventTypeBadge type={event.type} />
                <EventStatusBadge status={event.status} />
              </div>

              <h1 className="mt-7 max-w-5xl text-4xl font-bold tracking-tight text-content sm:text-6xl">
                {event.title}
              </h1>

              <p className="mt-4 text-xl font-medium text-accent-light">
                {event.subtitle}
              </p>

              <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">
                {event.shortDescription}
              </p>
            </div>

            <div className="hidden h-48 w-48 items-center justify-center rounded-3xl border border-accent-border bg-accent-soft text-accent-light lg:flex">
              <TrainFront
                size={88}
                strokeWidth={1.1}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container grid gap-12 lg:grid-cols-[1fr_22rem]">
          <article>
            <h2 className="text-3xl font-bold tracking-tight text-content">
              Über die Veranstaltung
            </h2>

            <div className="mt-6 space-y-5 text-lg leading-9 text-muted">
              {event.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>

          <aside className="surface-card h-fit p-6">
            <h2 className="text-lg font-bold text-content">
              Übersicht
            </h2>

            <dl className="mt-6 space-y-5 text-sm">
              <EventDetail
                icon={CalendarDays}
                label="Termin"
                value={formatEventDate(event.startAt)}
              />

              {event.endAt ? (
                <EventDetail
                  icon={Clock3}
                  label="Ende"
                  value={formatEventTime(event.endAt) ?? "Offen"}
                />
              ) : null}

              {event.location ? (
                <EventDetail
                  icon={MapPin}
                  label="Ort"
                  value={event.location}
                />
              ) : null}

              {event.route ? (
                <EventDetail
                  icon={TrainFront}
                  label="Strecke"
                  value={event.route}
                />
              ) : null}

              {event.vehicle ? (
                <EventDetail
                  icon={TrainFront}
                  label="Fahrzeug"
                  value={event.vehicle}
                />
              ) : null}

              <EventDetail
                icon={UserRound}
                label="Veranstalter"
                value={event.organizer}
              />
            </dl>

            {event.bookingUrl ? (
              <a
                href={event.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-light"
              >
                Fahrkarten buchen
                <ExternalLink size={17} />
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="mt-7 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-surface-elevated px-5 py-3 text-sm font-semibold text-subtle"
              >
                <Ticket size={17} />
                Keine Buchung verfügbar
              </button>
            )}
          </aside>
        </div>
      </section>

      {event.stops?.length ? (
        <section className="border-y border-line bg-page-soft">
          <div className="site-container section-spacing">
            <h2 className="text-3xl font-bold tracking-tight text-content">
              Fahrplan und Halte
            </h2>

            <div className="mt-10 overflow-hidden rounded-2xl border border-line">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[42rem] text-left">
                  <thead className="bg-surface-elevated text-sm text-muted">
                    <tr>
                      <th className="px-5 py-4 font-semibold">
                        Bahnhof
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Ankunft
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Abfahrt
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Hinweis
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-line bg-surface">
                    {event.stops.map((stop) => (
                      <tr key={stop.station}>
                        <td className="px-5 py-4 font-medium text-content">
                          {stop.station}
                        </td>
                        <td className="px-5 py-4 text-muted">
                          {stop.arrival ?? "–"}
                        </td>
                        <td className="px-5 py-4 text-muted">
                          {stop.departure ?? "–"}
                        </td>
                        <td className="px-5 py-4 text-muted">
                          {stop.note ?? "–"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {event.prices?.length ? (
        <section className="section-spacing">
          <div className="site-container">
            <h2 className="text-3xl font-bold tracking-tight text-content">
              Fahrpreise
            </h2>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {event.prices.map((price) => (
                <article
                  key={price.label}
                  className="surface-card p-6"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent-light">
                    {price.label}
                  </p>

                  <p className="mt-4 text-3xl font-bold text-content">
                    {price.price}
                  </p>

                  {price.description ? (
                    <p className="mt-3 text-sm leading-7 text-muted">
                      {price.description}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-y border-line bg-page-soft">
        <div className="site-container section-spacing">
          <h2 className="text-3xl font-bold tracking-tight text-content">
            Wichtige Hinweise
          </h2>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {event.notices.map((notice) => (
              <article
                key={notice}
                className="surface-card flex gap-4 p-5"
              >
                <Check
                  size={19}
                  className="mt-1 shrink-0 text-accent-light"
                />

                <p className="leading-7 text-muted">
                  {notice}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex gap-4 rounded-2xl border border-accent-border bg-accent-soft p-5">
            <CircleAlert
              size={22}
              className="mt-0.5 shrink-0 text-accent-light"
            />

            <p className="text-sm leading-7 text-muted">
              Angaben zu geplanten Veranstaltungen können sich
              ändern. Verbindlich sind ausschließlich ausdrücklich
              bestätigte Termine, veröffentlichte Fahrpläne und
              freigeschaltete Buchungsangebote.
            </p>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container">
          <div className="rounded-3xl border border-accent-border bg-accent-soft p-8 text-center sm:p-10">
            <Info
              size={38}
              className="mx-auto text-accent-light"
            />

            <h2 className="mt-6 text-3xl font-bold text-content">
              Fragen zur Veranstaltung?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-8 text-muted">
              Bei Fragen zu geplanten Veranstaltungen oder
              langfristigen Sonderfahrten kannst du uns über die
              Kontaktseite erreichen.
            </p>

            <Link
              href="/kontakt"
              className="mt-7 inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-light"
            >
              Kontakt aufnehmen
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

type EventDetailProps = {
  icon: typeof CalendarDays;
  label: string;
  value: string;
};

function EventDetail({
  icon: Icon,
  label,
  value,
}: EventDetailProps) {
  return (
    <div className="flex gap-3">
      <Icon
        size={18}
        className="mt-0.5 shrink-0 text-accent-light"
      />

      <div>
        <dt className="text-subtle">
          {label}
        </dt>

        <dd className="mt-1 font-medium leading-6 text-content">
          {value}
        </dd>
      </div>
    </div>
  );
}