import type { Metadata } from "next";
import {
  ArrowRight,
  Building2,
  CircleAlert,
  TrainFront,
} from "lucide-react";
import Link from "next/link";

import { ProjectCard } from "@/components/projects/project-card";
import { ProjectPriority } from "@/components/projects/project-priority";
import { ProjectStatus } from "@/components/projects/project-status";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  featuredProject,
  infrastructureProjects,
  vehicleProjects,
} from "@/data/projects";

export const metadata: Metadata = {
  title: "Projekte",
  description:
    "Die Fahrzeugprojekte und langfristigen Ziele der Historischen Schiene.",
};

export default function ProjektePage() {
  const additionalVehicleProjects = vehicleProjects.filter(
    (project) => !project.featured,
  );

  return (
    <>
      <PageHeader
        eyebrow="Fahrzeuge und Zukunftspläne"
        title="Unsere Projekte"
        description="Von historischen Triebwagen über einen vollständigen Reisezug bis zu einer eigenen Abstell- und Restaurierungsanlage: Wir möchten Eisenbahngeschichte langfristig bewahren."
      />

      <section className="border-b border-line bg-page-soft">
        <div className="site-container py-8">
          <div className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
            <CircleAlert
              size={23}
              className="mt-0.5 shrink-0 text-accent-light"
            />

            <div>
              <h2 className="font-semibold text-content">
                Hinweis zum Projektstatus
              </h2>

              <p className="mt-2 text-sm leading-7 text-muted">
                Die dargestellten Fahrzeuge und Anlagen befinden sich nicht
                automatisch im Eigentum des Vereins. Es handelt sich um
                Projektziele, deren Umsetzung insbesondere von Verfügbarkeit,
                Finanzierung, technischem Zustand, Unterbringung und
                erforderlichen Genehmigungen abhängt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {featuredProject ? (
        <section className="section-spacing">
          <div className="site-container">
            <SectionHeading
              eyebrow="Unsere höchste Priorität"
              title="Das Kernprojekt der Historischen Schiene"
              description="Auf dieses Fahrzeugprojekt konzentrieren wir zunächst einen wesentlichen Teil unserer Planungen und Vorbereitungen."
            />

            <article className="mt-12 overflow-hidden rounded-3xl border border-accent-border bg-surface">
              <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                <div className="flex min-h-80 items-center justify-center bg-page-soft p-10">
                  <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-accent-border bg-accent-soft">
                    <div className="absolute inset-6 rounded-full border border-accent-border/50" />

                    <TrainFront
                      size={104}
                      strokeWidth={1.1}
                      className="relative text-accent-light"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-center p-8 sm:p-12">
                  <ProjectPriority
                    priority={featuredProject.priority}
                    publicPriority={featuredProject.publicPriority}
                  />

                  <h2 className="mt-6 text-3xl font-bold tracking-tight text-content sm:text-5xl">
                    {featuredProject.shortTitle}
                  </h2>

                  <p className="mt-3 text-lg font-medium text-accent-light">
                    {featuredProject.subtitle}
                  </p>

                  <p className="mt-6 max-w-xl leading-8 text-muted">
                    {featuredProject.shortDescription}
                  </p>

                  <div className="mt-6">
                    <ProjectStatus status={featuredProject.status} />
                  </div>

                  <Link
                    href={`/projekte/${featuredProject.slug}`}
                    className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-light"
                  >
                    Kernprojekt ansehen
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
            eyebrow="Weitere Fahrzeugprojekte"
            title="Unsere nächsten Ziele"
            description="Diese Projekte sollen schrittweise geprüft und entsprechend ihrer Priorität weiterentwickelt werden."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {additionalVehicleProjects.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container">
          <SectionHeading
            eyebrow="Infrastruktur"
            title="Unsere langfristige Vision"
            description="Für eine dauerhafte Fahrzeugsammlung benötigen wir perspektivisch einen geeigneten Ort zur Abstellung, Pflege und Restaurierung."
          />

          <div className="mt-12">
            {infrastructureProjects.map((project) => (
              <article
                key={project.slug}
                className="overflow-hidden rounded-3xl border border-accent-border bg-accent-soft"
              >
                <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-accent-border bg-surface text-accent-light">
                    <Building2 size={38} />
                  </div>

                  <div>
                    <ProjectPriority
                      priority={project.priority}
                      publicPriority={project.publicPriority}
                    />

                    <h2 className="mt-5 text-3xl font-bold tracking-tight text-content">
                      {project.shortTitle}
                    </h2>

                    <p className="mt-4 max-w-3xl leading-8 text-muted">
                      {project.shortDescription}
                    </p>
                  </div>

                  <Link
                    href={`/projekte/${project.slug}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-accent-border bg-surface px-5 py-3 text-sm font-semibold text-content transition hover:bg-accent hover:text-white"
                  >
                    Vision ansehen
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-page-soft">
        <div className="site-container section-spacing">
          <SectionHeading
            eyebrow="Unser Vorgehen"
            title="Von der Idee bis zum erhaltenen Fahrzeug"
            description="Jedes Projekt wird schrittweise geprüft. Eine öffentliche Projektidee ist noch keine verbindliche Übernahme."
            centered
          />

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              "Projektidee",
              "Machbarkeitsprüfung",
              "Finanzierung",
              "Übernahme",
              "Aufarbeitung",
            ].map((step, index) => (
              <div
                key={step}
                className="surface-card p-6 text-center"
              >
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent-light">
                  {index + 1}
                </span>

                <p className="mt-4 font-semibold text-content">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}