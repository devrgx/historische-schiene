import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Check,
  Circle,
  CircleAlert,
  ListChecks,
  Target,
  TrainFront,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectPriority } from "@/components/projects/project-priority";
import { ProjectStatus } from "@/components/projects/project-status";
import {
  getProjectBySlug,
  projects,
} from "@/data/projects";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Projekt nicht gefunden",
    };
  }

  return {
    title: project.shortTitle,
    description: project.shortDescription,
  };
}

export default async function ProjectDetailPage({
  params,
}: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const HeroIcon = project.infrastructureProject
    ? Building2
    : TrainFront;

  return (
    <>
      <section className="accent-gradient border-b border-line">
        <div className="site-container py-16 sm:py-24">
          <Link
            href="/projekte"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-content"
          >
            <ArrowLeft size={17} />
            Zurück zu allen Projekten
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <ProjectPriority
                priority={project.priority}
                publicPriority={project.publicPriority}
              />

              <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight text-content sm:text-6xl">
                {project.title}
              </h1>

              <p className="mt-4 text-xl font-medium text-accent-light">
                {project.subtitle}
              </p>

              <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">
                {project.shortDescription}
              </p>

              <div className="mt-7">
                <ProjectStatus status={project.status} />
              </div>
            </div>

            <div className="hidden h-48 w-48 items-center justify-center rounded-3xl border border-accent-border bg-accent-soft text-accent-light lg:flex">
              <HeroIcon
                size={88}
                strokeWidth={1.1}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container grid gap-12 lg:grid-cols-[1fr_22rem]">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-content">
              Über das Projekt
            </h2>

            <div className="mt-6 space-y-5 text-lg leading-8 text-muted">
              {project.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <aside className="surface-card h-fit p-6">
            <h2 className="font-bold text-content">
              Projektübersicht
            </h2>

            <dl className="mt-5 space-y-5 text-sm">
              <div>
                <dt className="text-subtle">Priorisierung</dt>
                <dd className="mt-1 font-medium text-content">
                  {project.priority
                    ? `P${project.priority} · ${project.publicPriority}`
                    : project.publicPriority}
                </dd>
              </div>

              <div>
                <dt className="text-subtle">Status</dt>
                <dd className="mt-2">
                  <ProjectStatus status={project.status} />
                </dd>
              </div>

              <div>
                <dt className="text-subtle">Projektart</dt>
                <dd className="mt-1 font-medium text-content">
                  {project.infrastructureProject
                    ? "Infrastrukturprojekt"
                    : "Fahrzeugprojekt"}
                </dd>
              </div>
            </dl>

            {project.externalUrl ? (
              <a
                href={project.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-accent-border bg-accent-soft px-4 py-3 text-sm font-semibold text-accent-light transition hover:bg-accent hover:text-white"
              >
                Externes Fahrzeugangebot
                <ArrowUpRight size={17} />
              </a>
            ) : null}
          </aside>
        </div>
      </section>

      <section className="border-y border-line bg-page-soft">
        <div className="site-container section-spacing">
          <div className="grid gap-8 lg:grid-cols-2">
            <InfoList
              title="Projektziele"
              icon={Target}
              items={project.goals}
            />

            <InfoList
              title="Voraussetzungen"
              icon={ListChecks}
              items={project.requirements}
            />
          </div>
        </div>
      </section>

      {project.vehicles?.length ? (
        <section className="section-spacing">
          <div className="site-container">
            <h2 className="text-3xl font-bold tracking-tight text-content">
              Fahrzeuge des Projekts
            </h2>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {project.vehicles.map((vehicle) => (
                <article
                  key={vehicle.name}
                  className="surface-card p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
                    <TrainFront size={22} />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-content">
                    {vehicle.name}
                  </h3>

                  <p className="mt-1 text-sm font-medium text-accent-light">
                    {vehicle.role}
                  </p>

                  {vehicle.description ? (
                    <p className="mt-4 leading-7 text-muted">
                      {vehicle.description}
                    </p>
                  ) : null}

                  {vehicle.externalUrl ? (
                    <a
                      href={vehicle.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-content transition hover:text-accent-light"
                    >
                      Fahrzeugangebot öffnen
                      <ArrowUpRight size={16} />
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t border-line bg-page-soft">
        <div className="site-container section-spacing">
          <h2 className="text-3xl font-bold tracking-tight text-content">
            Geplanter Projektverlauf
          </h2>

          <div className="mt-10 max-w-4xl space-y-4">
            {project.milestones.map((milestone) => (
              <div
                key={milestone.title}
                className="surface-card flex gap-4 p-5"
              >
                <div
                  className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    milestone.completed
                      ? "bg-accent text-white"
                      : "border border-line-strong bg-white/5 text-subtle"
                  }`}
                >
                  {milestone.completed ? (
                    <Check size={17} />
                  ) : (
                    <Circle size={13} />
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-content">
                    {milestone.title}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-muted">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex max-w-4xl gap-4 rounded-2xl border border-line bg-surface p-5">
            <CircleAlert
              size={22}
              className="mt-0.5 shrink-0 text-accent-light"
            />

            <p className="text-sm leading-7 text-muted">
              Diese Darstellung beschreibt den derzeitigen Planungsstand.
              Reihenfolge, Umfang und Umsetzbarkeit können sich im Verlauf des
              Projekts verändern.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

type InfoListProps = {
  title: string;
  icon: typeof Target;
  items: string[];
};

function InfoList({
  title,
  icon: Icon,
  items,
}: InfoListProps) {
  return (
    <article className="surface-card p-7">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
          <Icon size={23} />
        </span>

        <h2 className="text-2xl font-bold text-content">
          {title}
        </h2>
      </div>

      <ul className="mt-7 space-y-4">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-muted"
          >
            <Check
              size={18}
              className="mt-1 shrink-0 text-accent-light"
            />

            <span className="leading-7">{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}