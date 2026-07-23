import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  FileText,
  LogOut,
  Newspaper,
  ReceiptText,
  UserRound,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Mitgliederbereich",
};

export default async function MemberPortalPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/portal/login");
  }

  async function logoutAction() {
    "use server";

    const { deleteSession } = await import("@/lib/auth");

    await deleteSession();
    redirect("/portal/login");
  }

  return (
    <main className="min-h-screen bg-page px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-semibold text-accent-light">
              Mitgliederportal
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-content sm:text-4xl">
              Willkommen, {currentUser.displayName}
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-muted">
              Hier findest du künftig deine Mitgliedsdaten, Vereinsdokumente,
              Beiträge, Veranstaltungen und interne Neuigkeiten.
            </p>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-content transition hover:bg-surface-elevated"
            >
              <LogOut size={17} />
              Abmelden
            </button>
          </form>
        </header>

        <section className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <PortalCard
            title="Meine Mitgliedschaft"
            description="Persönliche Daten, Mitgliedsnummer und Mitgliedsstatus einsehen."
            href="/portal/app/mitgliedschaft"
            icon={UserRound}
            enabled
          />

          <PortalCard
            title="Dokumente"
            description="Interne Vereinsdokumente und Formulare herunterladen."
            href="/portal/app/dokumente"
            icon={FileText}
            enabled={false}
          />

          <PortalCard
            title="Beiträge und Rechnungen"
            description="Mitgliedsbeiträge, Rechnungen und Zahlungsstatus einsehen."
            href="/portal/app/beitraege"
            icon={ReceiptText}
            enabled={false}
          />

          <PortalCard
            title="Veranstaltungen"
            description="Interne Termine und Vereinsveranstaltungen ansehen."
            href="/portal/app/veranstaltungen"
            icon={CalendarDays}
            enabled={false}
          />

          <PortalCard
            title="Interne Neuigkeiten"
            description="Aktuelle Meldungen aus dem Verein lesen."
            href="/portal/app/news"
            icon={Newspaper}
            enabled={false}
          />
        </section>

        <section className="mt-8 rounded-2xl border border-accent-border bg-accent-soft p-6">
          <h2 className="font-bold text-content">
            Mitgliederbereich erfolgreich eingerichtet
          </h2>

          <p className="mt-2 text-sm leading-7 text-muted">
            Dein Login und die Sitzung funktionieren. Die einzelnen Bereiche
            werden anschließend schrittweise ergänzt.
          </p>

          {currentUser.roleKeys.includes("ADMIN") ? (
            <Link
              href="/admin"
              className="mt-4 inline-flex rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              Zum Adminbereich
            </Link>
          ) : null}
        </section>
      </div>
    </main>
  );
}

type PortalCardProps = {
  title: string;
  description: string;
  href: string;
  icon: typeof UserRound;
  enabled: boolean;
};

function PortalCard({
  title,
  description,
  href,
  icon: Icon,
  enabled,
}: PortalCardProps) {
  const content = (
    <>
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
        <Icon size={21} />
      </span>

      <h2 className="mt-5 text-lg font-bold text-content">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>

      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-subtle">
        {enabled ? "Bereich öffnen" : "Wird vorbereitet"}
      </p>
    </>
  );

  if (!enabled) {
    return (
      <div className="surface-card cursor-not-allowed p-5 opacity-75">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="surface-card block p-5 transition hover:-translate-y-0.5 hover:border-accent-border"
    >
      {content}
    </Link>
  );
}
