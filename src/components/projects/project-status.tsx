import type { ProjectStatus as ProjectStatusType } from "@/data/projects";

type ProjectStatusProps = {
  status: ProjectStatusType;
};

const statusLabels: Record<ProjectStatusType, string> = {
  concept: "Konzeptphase",
  evaluating: "Machbarkeit wird geprüft",
  fundraising: "Finanzierung",
  negotiating: "In Gesprächen",
  planned: "Geplant",
  future: "Langfristiges Ziel",
};

export function ProjectStatus({
  status,
}: ProjectStatusProps) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted">
      <span className="h-2 w-2 rounded-full bg-accent" />
      {statusLabels[status]}
    </span>
  );
}