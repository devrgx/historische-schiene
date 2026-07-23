import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  CircleCheck,
  ClipboardList,
  Clock3,
  Eye,
  FileCheck2,
  Mail,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Mitgliedsanträge",
  description:
    "Übersicht und Bearbeitung eingegangener Mitgliedsanträge.",
};

export const dynamic = "force-dynamic";

const statusConfig = {
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

const membershipTypeLabels = {
  REGULAR: "Ordentlich",
  REDUCED: "Ermäßigt",
  SUPPORTING: "Fördermitglied",
} as const;

export default async function AdminApplicationsPage() {
  const applications =
    await prisma.membershipApplication.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        reviewedBy: {
          select: {
            displayName: true,
          },
        },
        member: {
          select: {
            membershipNumber: true,
          },
        },
      },
    });

  const pendingCount = applications.filter(
    (application) => application.status === "PENDING",
  ).length;

  const reviewCount = applications.filter(
    (application) => application.status === "IN_REVIEW",
  ).length;

  const approvedCount = applications.filter(
    (application) => application.status === "APPROVED",
  ).length;

  return (
    <>
      <section>
        <div>
          <p className="text-sm font-semibold text-accent-light">
            Mitgliederverwaltung
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-content sm:text-4xl">
            Mitgliedsanträge
          </h1>

          <p className="mt-3 max-w-3xl leading-7 text-muted">
            Hier werden alle eingegangenen Mitgliedsanträge geprüft,
            bearbeitet und später direkt in die Mitgliederverwaltung
            übernommen.
          </p>
        </div>
      </section>

      <section
        aria-label="Antragsstatistik"
        className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatusCard
          label="Alle Anträge"
          value={applications.length}
          description="Insgesamt eingegangen"
          icon={FileCheck2}
        />

        <StatusCard
          label="Eingegangen"
          value={pendingCount}
          description="Noch nicht bearbeitet"
          icon={Clock3}
          highlight={pendingCount > 0}
        />

        <StatusCard
          label="In Prüfung"
          value={reviewCount}
          description="Bearbeitung begonnen"
          icon={Eye}
        />

        <StatusCard
          label="Genehmigt"
          value={approvedCount}
          description="Als Mitglied übernommen"
          icon={ShieldCheck}
        />
      </section>

      <section className="mt-8">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-content">
                Antragsübersicht
              </h2>

              <p className="mt-1 text-sm text-muted">
                Sortiert nach dem Eingangsdatum
              </p>
            </div>

            <span className="rounded-full border border-line bg-page-soft px-3 py-1.5 text-xs font-semibold text-muted">
              {applications.length}{" "}
              {applications.length === 1
                ? "Antrag"
                : "Anträge"}
            </span>
          </div>

          <div className="border-b border-line bg-page-soft/60 px-5 py-4 sm:px-6">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_12rem]">
              <div className="relative">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
                />

                <input
                  type="search"
                  placeholder="Anträge durchsuchen"
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-line bg-surface py-3 pl-11 pr-4 text-sm text-content opacity-60 outline-none placeholder:text-subtle"
                />
              </div>

              <select
                disabled
                defaultValue=""
                className="cursor-not-allowed rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted opacity-60 outline-none"
              >
                <option value="">
                  Alle Status
                </option>
              </select>

              <select
                disabled
                defaultValue=""
                className="cursor-not-allowed rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted opacity-60 outline-none"
              >
                <option value="">
                  Alle Mitgliedsarten
                </option>
              </select>
            </div>

            <p className="mt-2 text-xs text-subtle">
              Suche und Filter werden im nächsten Ausbauschritt aktiviert.
            </p>
          </div>

          {applications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[68rem] text-left">
                <thead className="border-b border-line bg-page-soft">
                  <tr className="text-xs uppercase tracking-wide text-muted">
                    <th className="px-5 py-4 font-semibold sm:px-6">
                      Antragsteller
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Mitgliedsform
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Alter
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Eingang
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Status
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Mitgliedsnummer
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Aktion
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-line">
                  {applications.map((application) => {
                    const status =
                      statusConfig[application.status];

                    const age = calculateAge(
                      application.birthDate,
                    );

                    return (
                      <tr
                        key={application.id}
                        className="transition hover:bg-surface-hover"
                      >
                        <td className="px-5 py-5 sm:px-6">
                          <div className="flex items-start gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
                              <UserRound size={20} />
                            </span>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-content">
                                {application.firstName}{" "}
                                {application.lastName}
                              </p>

                              <a
                                href={`mailto:${application.email}`}
                                className="mt-1 flex items-center gap-1.5 text-sm text-muted transition hover:text-accent-light"
                              >
                                <Mail
                                  size={14}
                                  className="shrink-0"
                                />

                                <span className="truncate">
                                  {application.email}
                                </span>
                              </a>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5 text-sm text-muted">
                          {
                            membershipTypeLabels[
                              application.membershipType
                            ]
                          }
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm font-medium text-content">
                            {age} Jahre
                          </p>

                          {application.isMinor ? (
                            <p className="mt-1 text-xs font-medium text-amber-200">
                              Minderjährig
                            </p>
                          ) : null}
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2 text-sm text-muted">
                            <CalendarDays
                              size={15}
                              className="shrink-0"
                            />

                            {formatDate(application.createdAt)}
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>

                          {application.reviewedBy ? (
                            <p className="mt-2 text-xs text-subtle">
                              durch{" "}
                              {application.reviewedBy.displayName}
                            </p>
                          ) : null}
                        </td>

                        <td className="px-5 py-5 text-sm text-muted">
                          {application.member?.membershipNumber ??
                            "Noch nicht vergeben"}
                        </td>

                        <td className="px-5 py-5">
                          <Link
                            href={`/admin/antraege/${application.id}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-line bg-page-soft px-4 py-2 text-sm font-semibold text-content transition hover:border-accent-border hover:text-accent-light"
                          >
                            <Eye size={16} />
                            Öffnen
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <CircleCheck
                size={42}
                className="mx-auto text-emerald-300"
              />

              <h2 className="mt-6 text-2xl font-bold text-content">
                Keine Mitgliedsanträge vorhanden
              </h2>

              <p className="mx-auto mt-4 max-w-xl leading-8 text-muted">
                Aktuell liegen keine Mitgliedsanträge zur Bearbeitung
                vor. Neue Anträge erscheinen nach dem Absenden
                automatisch in dieser Übersicht.
              </p>

              <div className="mx-auto mt-7 max-w-md rounded-xl border border-line bg-page-soft p-4 text-left">
                <p className="text-sm font-semibold text-content">
                  Aktueller Bearbeitungsstand
                </p>

                <p className="mt-2 text-sm leading-6 text-muted">
                  Es sind keine offenen Prüfungen oder Entscheidungen
                  erforderlich.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

type StatusCardProps = {
  label: string;
  value: number;
  description: string;
  icon: typeof ClipboardList;
  highlight?: boolean;
};

function StatusCard({
  label,
  value,
  description,
  icon: Icon,
  highlight = false,
}: StatusCardProps) {
  return (
    <article
      className={[
        "rounded-2xl border p-5",
        highlight
          ? "border-accent-border bg-accent-soft"
          : "border-line bg-surface",
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

        <span className="text-3xl font-bold text-content">
          {value}
        </span>
      </div>

      <p className="mt-5 font-semibold text-content">
        {label}
      </p>

      <p className="mt-1 text-sm text-muted">
        {description}
      </p>
    </article>
  );
}

function calculateAge(birthDate: Date): number {
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const birthdayOccurred =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());

  if (!birthdayOccurred) {
    age -= 1;
  }

  return age;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}