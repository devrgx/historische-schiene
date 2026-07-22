import { Flag, Landmark } from "lucide-react";

import type { ProjectPriority } from "@/data/projects";

type ProjectPriorityProps = {
  priority: ProjectPriority;
  publicPriority: string;
};

export function ProjectPriority({
  priority,
  publicPriority,
}: ProjectPriorityProps) {
  if (priority === null) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-accent-border bg-accent-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-accent-light">
        <Landmark size={14} />
        {publicPriority}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-accent-border bg-accent-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-accent-light">
      <Flag size={14} />
      P{priority} · {publicPriority}
    </span>
  );
}