import type { EventStatus } from "@/data/events";

type EventStatusBadgeProps = {
  status: EventStatus;
};

const statusConfig: Record<
  EventStatus,
  {
    label: string;
    dotClassName: string;
  }
> = {
  idea: {
    label: "Idee",
    dotClassName: "bg-subtle",
  },
  planned: {
    label: "In Planung",
    dotClassName: "bg-accent-light",
  },
  announced: {
    label: "Angekündigt",
    dotClassName: "bg-accent",
  },
  bookable: {
    label: "Buchbar",
    dotClassName: "bg-emerald-400",
  },
  "sold-out": {
    label: "Ausverkauft",
    dotClassName: "bg-amber-400",
  },
  completed: {
    label: "Beendet",
    dotClassName: "bg-subtle",
  },
  cancelled: {
    label: "Abgesagt",
    dotClassName: "bg-red-400",
  },
};

export function EventStatusBadge({
  status,
}: EventStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted">
      <span
        className={`h-2 w-2 rounded-full ${config.dotClassName}`}
      />
      {config.label}
    </span>
  );
}