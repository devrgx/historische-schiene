import {
  ArrowRight,
  CalendarDays,
  HeartHandshake,
  History,
  Newspaper,
  TrainFront,
  Users,
  Wrench,
} from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { SectionHeading } from "@/components/ui/section-heading";

const features = [
  {
    title: "Historische Fahrzeuge",
    description:
      "Wir möchten Eisenbahnfahrzeuge erhalten, aufarbeiten und langfristig wieder erlebbar machen.",
    icon: TrainFront,
  },
  {
    title: "Regionale Geschichte",
    description:
      "Wir dokumentieren die Entwicklung des Schienenverkehrs und bewahren Erinnerungen für kommende Generationen.",
    icon: History,
  },
  {
    title: "Gemeinsame Projekte",
    description:
      "Unsere Mitglieder bringen sich mit technischem Wissen, Organisation und Begeisterung ein.",
    icon: Wrench,
  },
];

const quickLinks = [
  {
    title: "Unsere Projekte",
    description:
      "Fahrzeuge, Ideen und Vorhaben der Historischen Schiene.",
    href: "/projekte",
    icon: Wrench,
  },
  {
    title: "Sonderfahrten",
    description:
      "Künftige Fahrten, Veranstaltungen und öffentliche Termine.",
    href: "/sonderfahrten",
    icon: CalendarDays,
  },
  {
    title: "Aktuelles",
    description:
      "Neuigkeiten aus dem Verein und Berichte über unsere Arbeit.",
    href: "/aktuelles",
    icon: Newspaper,
  },
  {
    title: "Mitmachen",
    description:
      "Mitglied werden, unterstützen oder aktiv mitarbeiten.",
    href: "/mitmachen",
    icon: Users,
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden border-b border-line">
        <div className="absolute inset-0 -z-20 bg-page" />

        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,var(--accent-soft),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.05),transparent_35%)]" />

        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-page to-transparent" />

        <div className="site-container flex min-h-[calc(100vh-5rem)] items-center py-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-border bg-accent-soft px-4 py-2 text-sm font-medium text-accent-light">
              <TrainFront size={17} />
              Eisenbahngeschichte lebendig halten
            </div>

            <h1 className="mt-7 text-5xl font-bold tracking-[-0.04em] text-content sm:text-6xl lg:text-8xl">
              Geschichte fährt
              <span className="block text-accent-light">
                mit uns weiter.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
              Die Historische Schiene setzt sich für den Erhalt historischer
              Eisenbahnfahrzeuge, regionaler Bahngeschichte und lebendiger
              Eisenbahnkultur ein.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href="/verein">
                Verein kennenlernen
                <ArrowRight size={18} className="ml-2" />
              </ButtonLink>

              <ButtonLink href="/mitmachen" variant="secondary">
                <HeartHandshake size={18} className="mr-2" />
                Mitmachen
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container">
          <SectionHeading
            eyebrow="Unser Auftrag"
            title="Bewahren, dokumentieren und gemeinsam erleben"
            description="Historische Eisenbahn ist mehr als alte Technik. Sie verbindet Menschen, Orte und Erinnerungen. Wir möchten dieses Erbe langfristig erhalten."
            centered
          />

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="surface-card p-7 transition duration-300 hover:-translate-y-1 hover:border-accent-border hover:bg-surface-hover"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-content">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-7 text-muted">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-page-soft">
        <div className="site-container section-spacing">
          <SectionHeading
            eyebrow="Entdecken"
            title="Alles rund um die Historische Schiene"
            description="Lerne unseren Verein, unsere geplanten Projekte und die Möglichkeiten zur Unterstützung kennen."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="group surface-card flex gap-5 p-6 transition duration-300 hover:border-accent-border hover:bg-surface-hover"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
                    <Icon size={23} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-content">
                        {item.title}
                      </h3>

                      <ArrowRight
                        size={17}
                        className="text-subtle transition group-hover:translate-x-1 group-hover:text-accent-light"
                      />
                    </div>

                    <p className="mt-2 leading-7 text-muted">
                      {item.description}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container">
          <div className="overflow-hidden rounded-3xl border border-accent-border bg-accent-soft">
            <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-light">
                  Gemeinsam mehr erreichen
                </p>

                <h2 className="mt-4 text-3xl font-bold tracking-tight text-content sm:text-4xl">
                  Werde Teil unserer Geschichte
                </h2>

                <p className="mt-5 max-w-2xl leading-8 text-muted">
                  Ob Eisenbahnfan, Techniker, Fotograf, Organisator oder
                  Unterstützer: In unserem Verein gibt es viele Möglichkeiten,
                  sich einzubringen.
                </p>
              </div>

              <ButtonLink href="/mitmachen">
                Mitglied werden
                <ArrowRight size={18} className="ml-2" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}