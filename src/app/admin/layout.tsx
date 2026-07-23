import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Banknote,
  BookOpenCheck,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  Gauge,
  LogOut,
  MailWarning,
  Newspaper,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth";

type AdminLayoutProps = {
  children: ReactNode;
};

type NavigationItem = {
  label: string;
  href?: string;
  description: string;
  icon: typeof Gauge;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    description: "Übersicht",
    icon: Gauge,
  },
  {
    label: "Mitgliedsanträge",
    href: "/admin/antraege",
    description: "Anträge prüfen",
    icon: ClipboardList,
  },
  {
    label: "Mitglieder",
    href: "/admin/mitglieder",
    description: "Mitglieder verwalten",
    icon: Users,
  },
  {
    label: "Rechnungen",
    description: "Rechnungen erstellen",
    icon: FileText,
  },
  {
    label: "Buchungen",
    description: "Zahlungen verbuchen",
    icon: BookOpenCheck,
  },
  {
    label: "SEPA",
    description: "Lastschriften verwalten",
    icon: CreditCard,
  },
  {
    label: "Mahnungen",
    description: "Offene Forderungen",
    icon: MailWarning,
  },
  {
    label: "Neuigkeiten",
    description: "Beiträge verwalten",
    icon: Newspaper,
  },
  {
    label: "Veranstaltungen",
    description: "Termine und Fahrten",
    icon: CalendarDays,
  },
  {
    label: "Einstellungen",
    description: "Vereinsverwaltung",
    icon: Settings,
  },
];

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/portal/login");
  }

  const isAdministrator = user.roleKeys.includes("ADMIN");

  if (!isAdministrator) {
    redirect("/portal/app");
  }

  return (
    <div className="border-y border-line bg-page-soft">
      <div className="site-container py-6 lg:py-8">
        <div className="overflow-hidden rounded-3xl border border-line bg-page shadow-2xl shadow-black/20">
          <div className="grid min-h-[48rem] lg:grid-cols-[18rem_minmax(0,1fr)]">
            <aside className="border-b border-line bg-surface lg:border-b-0 lg:border-r">
              <div className="border-b border-line p-5">
                <Link
                  href="/admin"
                  className="flex items-center gap-3 rounded-2xl"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-white">
                    <ShieldCheck size={23} />
                  </span>

                  <span>
                    <span className="block font-bold text-content">
                      Administration
                    </span>

                    <span className="mt-0.5 block text-xs text-muted">
                      Historische Schiene
                    </span>
                  </span>
                </Link>
              </div>

              <nav
                aria-label="Admin-Navigation"
                className="grid gap-1.5 p-4 sm:grid-cols-2 lg:grid-cols-1"
              >
                {navigationItems.map((item) => {
                  const Icon = item.icon;

                  if (!item.href) {
                    return (
                      <div
                        key={item.label}
                        title="Dieser Bereich wird noch eingerichtet."
                        className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 opacity-45"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-page-soft text-subtle">
                          <Icon size={18} />
                        </span>

                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-content">
                            {item.label}
                          </span>

                          <span className="block truncate text-xs text-subtle">
                            Bald verfügbar
                          </span>
                        </span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="group flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-surface-hover"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-page-soft text-muted transition group-hover:bg-accent-soft group-hover:text-accent-light">
                        <Icon size={18} />
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-content">
                          {item.label}
                        </span>

                        <span className="block truncate text-xs text-subtle">
                          {item.description}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-line p-4">
                <div className="rounded-2xl bg-page-soft p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft font-bold text-accent-light">
                      {getInitials(user.displayName)}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-content">
                        {user.displayName}
                      </p>

                      <p className="truncate text-xs text-muted">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/portal/app"
                    className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-line px-3 py-2.5 text-sm font-semibold text-muted transition hover:border-line-strong hover:bg-surface-hover hover:text-content"
                  >
                    <LogOut size={16} />
                    Zum Mitgliederportal
                  </Link>
                </div>
              </div>
            </aside>

            <div className="min-w-0">
              <header className="border-b border-line bg-surface/70 px-5 py-5 sm:px-7 lg:px-9">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-accent-light">
                      Vereinsverwaltung
                    </p>

                    <p className="mt-1 text-sm text-muted">
                      Mitglieder, Finanzen und Vereinsbetrieb verwalten
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-line bg-page-soft px-3 py-2 text-sm text-muted">
                    <Banknote size={17} />
                    Finanzverwaltung wird vorbereitet
                  </div>
                </div>
              </header>

              <main className="p-5 sm:p-7 lg:p-9">{children}</main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "AD";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}
