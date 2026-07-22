import {
  ArrowRight,
  CalendarDays,
  MapPin,
  TrainFront,
} from "lucide-react";
import Link from "next/link";

import type { ClubEvent } from "@/data/events";
import { formatEventDate } from "@/lib/event-date";

import { EventStatusBadge } from "./event-status-badge";
import { EventTypeBadge } from "./event-type-badge";

type EventCardProps = {
  event: ClubEvent;
};

export function EventCard({
  event,
}: EventCardProps) {
  return (
    <article className="group surface-card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-accent-border hover:bg-surface-hover">
      <div className="relative flex h-52 items-center justify-center overflow-hidden border-b border-line bg-page-soft">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--accent-soft),transparent_60%)]" />

            <TrainFront
              size={72}
              strokeWidth={1.1}
              className="relative text-accent-light"
            />
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <EventTypeBadge type={event.type} />
          <EventStatusBadge status={event.status} />
        </div>

        <h2 className="mt-6 text-2xl font-bold tracking-tight text-content">
          {event.title}
        </h2>

        <p className="mt-2 text-sm font-medium text-accent-light">
          {event.subtitle}
        </p>

        <p className="mt-4 flex-1 leading-7 text-muted">
          {event.shortDescription}
        </p>

        <div className="mt-6 space-y-3 border-t border-line pt-5 text-sm text-subtle">
          <p className="flex items-center gap-2">
            <CalendarDays
              size={16}
              className="shrink-0"
            />
            {formatEventDate(event.startAt)}
          </p>

          {event.location || event.route ? (
            <p className="flex items-start gap-2">
              <MapPin
                size={16}
                className="mt-0.5 shrink-0"
              />
              {event.route ?? event.location}
            </p>
          ) : null}
        </div>

        <Link
          href={`/sonderfahrten/${event.slug}`}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-content transition hover:text-accent-light"
        >
          Details ansehen
          <ArrowRight
            size={17}
            className="transition group-hover:translate-x-1"
          />
        </Link>
      </div>
    </article>
  );
}