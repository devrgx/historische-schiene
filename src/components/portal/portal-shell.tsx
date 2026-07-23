import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, TrainFront } from "lucide-react";

type PortalShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function PortalShell({
  eyebrow = "Mitgliederportal",
  title,
  description,
  children,
}: PortalShellProps) {
  return (
    <main className="min-h-screen bg-page">
      <div className="site-container py-8 sm:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-content"
        >
          <ArrowLeft size={17} />
          Zur öffentlichen Website
        </Link>

        <div className="mx-auto mt-10 max-w-5xl">
          <header className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-accent-border bg-accent-soft text-accent-light">
              <TrainFront size={31} />
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-accent-light">
              {eyebrow}
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-content sm:text-5xl">
              {title}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted">
              {description}
            </p>
          </header>

          <div className="mt-12">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}