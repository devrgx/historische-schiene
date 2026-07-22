import { TrainFront } from "lucide-react";
import Link from "next/link";

import { mainNavigation } from "@/lib/navigation";

import { MobileNavigation } from "./mobile-navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-page/85 backdrop-blur-xl">
      <div className="site-container flex h-20 items-center justify-between gap-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          aria-label="Historische Schiene – Startseite"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
            <TrainFront size={24} />
          </span>

          <span className="min-w-0">
            <span className="block truncate text-base font-bold tracking-tight text-content sm:text-lg">
              Historische Schiene
            </span>
            <span className="hidden text-xs text-subtle sm:block">
              Eisenbahngeschichte bewahren
            </span>
          </span>
        </Link>

        <nav
          aria-label="Hauptnavigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {mainNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-white/5 hover:text-content"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/portal"
            className="inline-flex items-center justify-center rounded-lg border border-accent-border bg-accent-soft px-4 py-2.5 text-sm font-semibold text-accent-light transition hover:bg-accent hover:text-white"
          >
            Mitgliederportal
          </Link>
        </div>

        <MobileNavigation />
      </div>
    </header>
  );
}