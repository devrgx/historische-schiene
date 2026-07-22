import {
  CalendarDays,
  Construction,
  Info,
  TrainFront,
  Users,
  Wrench,
} from "lucide-react";

import type { EventType } from "@/data/events";

type EventTypeBadgeProps = {
  type: EventType;
};

const typeConfig = {
  "special-trip": {
    label: "Sonderfahrt",
    icon: TrainFront,
  },
  "club-event": {
    label: "Vereinsveranstaltung",
    icon: Users,
  },
  information: {
    label: "Informationsveranstaltung",
    icon: Info,
  },
  "work-session": {
    label: "Arbeitseinsatz",
    icon: Wrench,
  },
  "future-concept": {
    label: "Langfristige Idee",
    icon: Construction,
  },
} satisfies Record<
  EventType,
  {
    label: string;
    icon: typeof CalendarDays;
  }
>;

export function EventTypeBadge({
  type,
}: EventTypeBadgeProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-accent-border bg-accent-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-accent-light">
      <Icon size={14} />
      {config.label}
    </span>
  );
}