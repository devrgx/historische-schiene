import {
  ArrowRight,
  Building2,
  TrainFront,
} from "lucide-react";
import Link from "next/link";

import type { Project } from "@/data/projects";

import { ProjectPriority } from "./project-priority";
import { ProjectStatus } from "./project-status";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({
  project,
}: ProjectCardProps) {
  const Icon = project.infrastructureProject
    ? Building2
    : TrainFront;

  return (
    <article className="group surface-card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-accent-border hover:bg-surface-hover">
      <div className="relative flex h-52 items-center justify-center overflow-hidden border-b border-line bg-page-soft">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--accent-soft),transparent_60%)]" />

        <Icon
          size={76}
          strokeWidth={1.2}
          className="relative text-accent-light transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <ProjectPriority
          priority={project.priority}
          publicPriority={project.publicPriority}
        />

        <h2 className="mt-5 text-2xl font-bold tracking-tight text-content">
          {project.shortTitle}
        </h2>

        <p className="mt-2 text-sm font-medium text-accent-light">
          {project.subtitle}
        </p>

        <p className="mt-4 flex-1 leading-7 text-muted">
          {project.shortDescription}
        </p>

        <div className="mt-6 border-t border-line pt-5">
          <ProjectStatus status={project.status} />

          <Link
            href={`/projekte/${project.slug}`}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-content transition hover:text-accent-light"
          >
            Projekt ansehen
            <ArrowRight
              size={17}
              className="transition group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}