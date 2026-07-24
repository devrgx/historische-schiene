import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowRight,
  Banknote,
  CalendarClock,
  CircleAlert,
  CircleCheck,
  ClipboardList,
  Clock3,
  CreditCard,
  FileText,
  MailWarning,
  UserCheck,
  Users,
} from "lucide-react";

import type {
  MembershipType,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Administration",
  description:
    "Zentrale Verwaltungsübersicht der Historischen Schiene.",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    applicationCount,
    pendingApplicationCount,
    reviewApplicationCount,
    activeMemberCount,
    openInvoiceCount,
    overdueInvoiceCount,
    openReminderCount,
    recentApplications,
  ] = await Promise.all([
    prisma.membershipApplication.count(),

    prisma.membershipApplication.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.membershipApplication.count({
      where: {
        status: "IN_REVIEW",
      },
    }),

    prisma.member.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.invoice.count({
      where: {
        status: {
          in: [
            "ISSUED",
            "PARTIALLY_PAID",
            "OVERDUE",
          ],
        },

        openCents: {
          gt: 0,
        },
      },
    }),

    prisma.invoice.count({
      where: {
        status: "OVERDUE",

        openCents: {
          gt: 0,
        },
      },
    }),

    prisma.reminder.count({
      where: {
        status: {
          in: [
            "DRAFT",
            "ISSUED",
            "SENT",
          ],
        },
      },
    }),

    prisma.membershipApplication.findMany({
      take: 5,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        firstName: true,
        lastName: true,
        membershipType: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const openApplicationCount =
    pendingApplicationCount +
    reviewApplicationCount;

  return (
    <>
      <section>
        <p className="text-sm font-semibold text-accent-light">
          Dashboard
        </p>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-content sm:text-4xl">
              Verwaltungsübersicht
            </h1>

            <p className="mt-3 max-w-3xl leading-7 text-muted">
              Hier laufen die
              Mitgliederverwaltung,
              Rechnungsstellung,
              Zahlungserfassung,
              SEPA-Lastschriften und das
              Mahnwesen zusammen.
            </p>
          </div>

          <Link
            href="/admin/antraege"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            Anträge öffnen
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section
        aria-label="Kennzahlen"
        className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <DashboardStat
          label="Aktive Mitglieder"
          value={activeMemberCount}
          description="Derzeit im Verein aktiv"
          icon={Users}
          href="/admin/mitglieder"
        />

        <DashboardStat
          label="Offene Anträge"
          value={openApplicationCount}
          description="Eingegangen oder in Prüfung"
          icon={ClipboardList}
          href="/admin/antraege"
          highlight={
            openApplicationCount > 0
          }
        />

        <DashboardStat
          label="Offene Rechnungen"
          value={openInvoiceCount}
          description={
            overdueInvoiceCount > 0
              ? `${overdueInvoiceCount} davon überfällig`
              : "Derzeit offene Forderungen"
          }
          icon={FileText}
          href="/admin/rechnungen"
          highlight={
            overdueInvoiceCount > 0
          }
        />

        <DashboardStat
          label="Offene Mahnungen"
          value={openReminderCount}
          description="Entwürfe und versendete Mahnungen"
          icon={MailWarning}
          href={undefined}
          highlight={
            openReminderCount > 0
          }
        />
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CompactStat
          label="Anträge insgesamt"
          value={applicationCount}
          icon={ClipboardList}
        />

        <CompactStat
          label="Neu eingegangen"
          value={pendingApplicationCount}
          icon={Clock3}
        />

        <CompactStat
          label="In Prüfung"
          value={reviewApplicationCount}
          icon={CalendarClock}
        />

        <CompactStat
          label="Aktive Mitglieder"
          value={activeMemberCount}
          icon={UserCheck}
        />
      </section>

      <section className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-content">
                Neueste Mitgliedsanträge
              </h2>

              <p className="mt-1 text-sm text-muted">
                Die zuletzt eingegangenen
                Anträge
              </p>
            </div>

            <Link
              href="/admin/antraege"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-light transition hover:text-content"
            >
              Alle anzeigen
              <ArrowRight size={15} />
            </Link>
          </div>

          {recentApplications.length > 0 ? (
            <div className="divide-y divide-line">
              {recentApplications.map(
                (application) => (
                  <Link
                    key={application.id}
                    href={`/admin/antraege/${application.id}`}
                    className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition hover:bg-surface-hover sm:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft font-bold text-accent-light">
                        {application.firstName.charAt(
                          0,
                        )}

                        {application.lastName.charAt(
                          0,
                        )}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-content">
                          {
                            application.firstName
                          }{" "}
                          {
                            application.lastName
                          }
                        </p>

                        <p className="mt-1 text-sm text-muted">
                          {
                            membershipTypeLabels[
                              application
                                .membershipType
                            ]
                          }{" "}
                          ·{" "}
                          {formatDate(
                            application.createdAt,
                          )}
                        </p>
                      </div>
                    </div>

                    <ApplicationStatus
                      status={
                        application.status
                      }
                    />
                  </Link>
                ),
              )}
            </div>
          ) : (
            <div className="px-6 py-14 text-center">
              <CircleCheck
                size={36}
                className="mx-auto text-emerald-300"
              />

              <h3 className="mt-4 font-semibold text-content">
                Keine Anträge vorhanden
              </h3>

              <p className="mt-2 text-sm text-muted">
                Neue Mitgliedsanträge
                erscheinen automatisch hier.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="text-lg font-bold text-content">
            Finanzverwaltung
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted">
            Beitragsrechnungen,
            Zahlungseingänge,
            SEPA-Lastschriften und Mahnungen
            zentral verwalten.
          </p>

          <div className="mt-6 space-y-3">
            <FinanceModule
              label="Rechnungen"
              description="Monatliche Beitragsrechnungen erzeugen und verwalten"
              icon={FileText}
              href="/admin/rechnungen"
              badge={
                openInvoiceCount > 0
                  ? openInvoiceCount.toString()
                  : undefined
              }
            />

            <FinanceModule
              label="Buchungen"
              description="Zahlungseingänge und Ausgaben erfassen"
              icon={Banknote}
            />

            <FinanceModule
              label="SEPA-Lastschriften"
              description="Mandate, Einzüge und Rücklastschriften verwalten"
              icon={CreditCard}
            />

            <FinanceModule
              label="Mahnwesen"
              description="Zahlungserinnerungen und Mahnungen verwalten"
              icon={MailWarning}
              badge={
                openReminderCount > 0
                  ? openReminderCount.toString()
                  : undefined
              }
            />
          </div>

          <div className="mt-6 flex gap-3 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4">
            <CircleAlert
              size={19}
              className="mt-0.5 shrink-0 text-amber-200"
            />

            <p className="text-sm leading-6 text-amber-100/80">
              Die Gläubiger-ID wurde bereits
              beantragt. Sobald sie vorliegt,
              wird sie zentral in der
              Konfiguration hinterlegt.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

type DashboardStatProps = {
  label: string;
  value: number | string;
  description: string;
  icon: typeof Users;
  href?: string;
  highlight?: boolean;
};

function DashboardStat({
  label,
  value,
  description,
  icon: Icon,
  href,
  highlight = false,
}: DashboardStatProps) {
  const content = (
    <div
      className={[
        "h-full rounded-2xl border p-5 transition",

        highlight
          ? "border-accent-border bg-accent-soft"
          : "border-line bg-surface",

        href
          ? "hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-hover"
          : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={[
            "flex h-11 w-11 items-center justify-center rounded-xl",

            highlight
              ? "bg-accent text-white"
              : "bg-page-soft text-muted",
          ].join(" ")}
        >
          <Icon size={21} />
        </span>

        {href ? (
          <ArrowRight
            size={18}
            className="text-subtle"
          />
        ) : null}
      </div>

      <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-content">
        {value}
      </p>

      <p className="mt-2 text-sm text-subtle">
        {description}
      </p>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href}>
      {content}
    </Link>
  );
}

type CompactStatProps = {
  label: string;
  value: number;
  icon: typeof Users;
};

function CompactStat({
  label,
  value,
  icon: Icon,
}: CompactStatProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface px-5 py-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-page-soft text-muted">
        <Icon size={19} />
      </span>

      <div>
        <p className="text-2xl font-bold text-content">
          {value}
        </p>

        <p className="text-sm text-muted">
          {label}
        </p>
      </div>
    </div>
  );
}

type FinanceModuleProps = {
  label: string;
  description: string;
  icon: typeof FileText;
  href?: string;
  badge?: string;
};

function FinanceModule({
  label,
  description,
  icon: Icon,
  href,
  badge,
}: FinanceModuleProps) {
  const content = (
    <div
      className={[
        "flex items-center gap-3 rounded-xl border p-3.5 transition",

        href
          ? "border-line bg-page-soft hover:border-line-strong hover:bg-surface-hover"
          : "border-line bg-page-soft opacity-70",
      ].join(" ")}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-muted">
        <Icon size={18} />
      </span>

      <div className="min-w-0">
        <p className="font-semibold text-content">
          {label}
        </p>

        <p className="mt-0.5 text-xs leading-5 text-subtle">
          {description}
        </p>
      </div>

      {badge ? (
        <span className="ml-auto shrink-0 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-white">
          {badge}
        </span>
      ) : href ? (
        <ArrowRight
          size={17}
          className="ml-auto shrink-0 text-subtle"
        />
      ) : (
        <span className="ml-auto shrink-0 rounded-full border border-line px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-subtle">
          Bald
        </span>
      )}
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href}>
      {content}
    </Link>
  );
}

type ApplicationStatusProps = {
  status:
    | "PENDING"
    | "IN_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "WITHDRAWN";
};

function ApplicationStatus({
  status,
}: ApplicationStatusProps) {
  const statusData =
    applicationStatusConfig[status];

  return (
    <span
      className={[
        "shrink-0 rounded-full border px-3 py-1 text-xs font-semibold",
        statusData.className,
      ].join(" ")}
    >
      {statusData.label}
    </span>
  );
}

const membershipTypeLabels = {
  ADULT: "Volljährige Person",
  REDUCED: "Ermäßigte Mitgliedschaft",
  LEGAL_ENTITY: "Juristische Person",
  HONORARY: "Ehrenmitgliedschaft",
} satisfies Record<
  MembershipType,
  string
>;

const applicationStatusConfig = {
  PENDING: {
    label: "Eingegangen",
    className:
      "border-amber-400/30 bg-amber-400/10 text-amber-200",
  },

  IN_REVIEW: {
    label: "In Prüfung",
    className:
      "border-blue-400/30 bg-blue-400/10 text-blue-200",
  },

  APPROVED: {
    label: "Genehmigt",
    className:
      "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  },

  REJECTED: {
    label: "Abgelehnt",
    className:
      "border-red-400/30 bg-red-400/10 text-red-200",
  },

  WITHDRAWN: {
    label: "Zurückgezogen",
    className:
      "border-line bg-page-soft text-subtle",
  },
} as const;

function formatDate(
  date: Date,
): string {
  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  ).format(date);
}