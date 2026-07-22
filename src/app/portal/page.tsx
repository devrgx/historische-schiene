import type { Metadata } from "next";
import {
  CalendarDays,
  Construction,
  Newspaper,
  Settings,
  UserRound,
  UsersRound,
} from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Mitgliederportal",
  description:
    "Das Mitgliederportal der Historischen Schiene befindet sich im Aufbau.",
};

const plannedFeatures = [
  {
    label: "Neuigkeiten",
    icon: Newspaper,
  },
  {
    label: "Kalender",
    icon: CalendarDays,
  },
  {
    label: "Aktivitäten",
    icon: UsersRound,
  },
  {
    label: "Mitglieder",
    icon: UserRound,
  },
  {
    label: "Einstellungen",
    icon: Settings,
  },
];

export default function PortalPage() {
  return (
    <section className="accent-gradient min-h-[calc(100vh-5rem)]">
      <div className="site-container flex min-h-[calc(100vh-5rem)] items-center justify-center py-20">
        <div className="w-full max-w-3xl rounded-3xl border border-line bg-surface/90 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent-light">
            <Construction size={30} />
          </div>

          <p className="mt-7 text-sm font-semibold uppercase tracking-[0.22em] text-accent-light">
            Bereich im Aufbau
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-content sm:text-5xl">
            Mitgliederportal
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted">
            Unser interner Mitgliederbereich wird derzeit entwickelt. Nach
            seiner Freischaltung können sich ausschließlich bestehende
            Vereinsmitglieder registrieren.
          </p>

          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plannedFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.label}
                  className="flex items-center gap-3 rounded-xl border border-line bg-white/5 px-4 py-3 text-left text-sm text-muted"
                >
                  <Icon size={18} className="text-accent-light" />
                  {feature.label}
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <ButtonLink href="/" variant="secondary">
              Zurück zur Startseite
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}