import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  CircleCheck,
  CircleOff,
  Filter,
  Mail,
  MapPin,
  Search,
  UserCheck,
  UserRound,
  Users,
  UserX,
  X,
} from "lucide-react";

import {
  MemberStatus,
  MembershipType,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Mitglieder",
  description:
    "Mitgliederübersicht und Mitgliederverwaltung der Historischen Schiene.",
};

export const dynamic = "force-dynamic";

type AdminMembersPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    type?: string;
  }>;
};

const validMemberStatuses = Object.values(MemberStatus);
const validMembershipTypes = Object.values(MembershipType);

const memberStatusConfig = {
  ACTIVE: {
    label: "Aktiv",
    className:
      "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  },
  INACTIVE: {
    label: "Inaktiv",
    className:
      "border-amber-400/30 bg-amber-400/10 text-amber-200",
  },
  RESIGNED: {
    label: "Ausgetreten",
    className:
      "border-line bg-page-soft text-muted",
  },
  EXPELLED: {
    label: "Ausgeschlossen",
    className:
      "border-red-400/30 bg-red-400/10 text-red-200",
  },
  DECEASED: {
    label: "Verstorben",
    className:
      "border-line bg-page-soft text-subtle",
  },
} as const;

const membershipTypeLabels = {
  REGULAR: "Ordentliches Mitglied",
  REDUCED: "Ermäßigtes Mitglied",
  SUPPORTING: "Fördermitglied",
} as const;

const userStatusLabels = {
  PENDING: "Konto nicht aktiviert",
  ACTIVE: "Konto aktiv",
  BLOCKED: "Konto gesperrt",
  DISABLED: "Konto deaktiviert",
} as const;

export default async function AdminMembersPage({
  searchParams,
}: AdminMembersPageProps) {
  const parameters = await searchParams;

  const query = parameters.q?.trim() ?? "";

  const selectedStatus = validMemberStatuses.includes(
    parameters.status as MemberStatus,
  )
    ? (parameters.status as MemberStatus)
    : undefined;

  const selectedType = validMembershipTypes.includes(
    parameters.type as MembershipType,
  )
    ? (parameters.type as MembershipType)
    : undefined;

  const [
    members,
    totalMemberCount,
    activeMemberCount,
    inactiveMemberCount,
    resignedMemberCount,
  ] = await Promise.all([
    prisma.member.findMany({
      where: {
        ...(selectedStatus
          ? {
              status: selectedStatus,
            }
          : {}),
        ...(selectedType
          ? {
              membershipType: selectedType,
            }
          : {}),
        ...(query
          ? {
              OR: [
                {
                  membershipNumber: {
                    contains: query,
                  },
                },
                {
                  firstName: {
                    contains: query,
                  },
                },
                {
                  lastName: {
                    contains: query,
                  },
                },
                {
                  email: {
                    contains: query,
                  },
                },
                {
                  city: {
                    contains: query,
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        user: {
          select: {
            status: true,
          },
        },
        functions: {
          include: {
            function: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
      orderBy: [
        {
          lastName: "asc",
        },
        {
          firstName: "asc",
        },
      ],
    }),

    prisma.member.count(),

    prisma.member.count({
      where: {
        status: MemberStatus.ACTIVE,
      },
    }),

    prisma.member.count({
      where: {
        status: MemberStatus.INACTIVE,
      },
    }),

    prisma.member.count({
      where: {
        status: MemberStatus.RESIGNED,
      },
    }),
  ]);

  const filtersActive =
    Boolean(query) ||
    Boolean(selectedStatus) ||
    Boolean(selectedType);

  return (
    <>
      <section>
        <p className="text-sm font-semibold text-accent-light">
          Mitgliederverwaltung
        </p>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-content sm:text-4xl">
              Mitglieder
            </h1>

            <p className="mt-3 max-w-3xl leading-7 text-muted">
              Verwalte Mitgliedsdaten, Mitgliedschaften,
              Portalzugänge und später auch Rechnungen, Zahlungen,
              SEPA-Mandate und Dokumente.
            </p>
          </div>

          <span className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-muted">
            {totalMemberCount}{" "}
            {totalMemberCount === 1 ? "Mitglied" : "Mitglieder"}
          </span>
        </div>
      </section>

      <section
        aria-label="Mitgliederstatistik"
        className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatusCard
          label="Mitglieder insgesamt"
          value={totalMemberCount}
          description="Alle Mitgliedsdatensätze"
          icon={Users}
        />

        <StatusCard
          label="Aktive Mitglieder"
          value={activeMemberCount}
          description="Aktuell im Verein aktiv"
          icon={UserCheck}
          highlight
        />

        <StatusCard
          label="Inaktive Mitglieder"
          value={inactiveMemberCount}
          description="Derzeit nicht aktiv"
          icon={CircleOff}
        />

        <StatusCard
          label="Ausgetreten"
          value={resignedMemberCount}
          description="Beendete Mitgliedschaften"
          icon={UserX}
        />
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="border-b border-line px-5 py-5 sm:px-6">
          <h2 className="text-lg font-bold text-content">
            Mitgliederübersicht
          </h2>

          <p className="mt-1 text-sm text-muted">
            Suche und Filter werden direkt auf die gespeicherten
            Mitgliederdaten angewendet.
          </p>
        </div>

        <form
          method="get"
          className="border-b border-line bg-page-soft/60 p-5 sm:p-6"
        >
          <div className="grid gap-3 xl:grid-cols-[minmax(16rem,1fr)_13rem_15rem_auto]">
            <div>
              <label htmlFor="member-search" className="sr-only">
                Mitglieder durchsuchen
              </label>

              <div className="relative">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
                />

                <input
                  id="member-search"
                  name="q"
                  type="search"
                  defaultValue={query}
                  placeholder="Name, Mitgliedsnummer, E-Mail oder Ort"
                  className="w-full rounded-xl border border-line bg-surface py-3 pl-11 pr-4 text-sm text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
                />
              </div>
            </div>

            <div>
              <label htmlFor="member-status" className="sr-only">
                Mitgliederstatus
              </label>

              <select
                id="member-status"
                name="status"
                defaultValue={selectedStatus ?? ""}
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-content outline-none transition focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
              >
                <option value="">Alle Status</option>
                <option value={MemberStatus.ACTIVE}>
                  Aktiv
                </option>
                <option value={MemberStatus.INACTIVE}>
                  Inaktiv
                </option>
                <option value={MemberStatus.RESIGNED}>
                  Ausgetreten
                </option>
                <option value={MemberStatus.EXPELLED}>
                  Ausgeschlossen
                </option>
                <option value={MemberStatus.DECEASED}>
                  Verstorben
                </option>
              </select>
            </div>

            <div>
              <label htmlFor="membership-type" className="sr-only">
                Mitgliedsart
              </label>

              <select
                id="membership-type"
                name="type"
                defaultValue={selectedType ?? ""}
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-content outline-none transition focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
              >
                <option value="">Alle Mitgliedsarten</option>
                <option value={MembershipType.REGULAR}>
                  Ordentliches Mitglied
                </option>
                <option value={MembershipType.REDUCED}>
                  Ermäßigtes Mitglied
                </option>
                <option value={MembershipType.SUPPORTING}>
                  Fördermitglied
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              <Filter size={17} />
              Anwenden
            </button>
          </div>

          {filtersActive ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                Es werden {members.length} passende{" "}
                {members.length === 1
                  ? "Mitglied"
                  : "Mitglieder"}{" "}
                angezeigt.
              </p>

              <Link
                href="/admin/mitglieder"
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-content"
              >
                <X size={16} />
                Filter zurücksetzen
              </Link>
            </div>
          ) : null}
        </form>

        {members.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[82rem] text-left">
              <thead className="border-b border-line bg-page-soft">
                <tr className="text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-4 font-semibold sm:px-6">
                    Mitglied
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Mitgliedsnummer
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Mitgliedsart
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Wohnort
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Eintritt
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Portalzugang
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Status
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Aktion
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-line">
                {members.map((member) => {
                  const status =
                    memberStatusConfig[member.status];

                  const primaryFunction =
                    member.functions.find(
                      (entry) => entry.isPrimary,
                    )?.function.name ??
                    member.functions[0]?.function.name;

                  return (
                    <tr
                      key={member.id}
                      className="transition hover:bg-surface-hover"
                    >
                      <td className="px-5 py-5 sm:px-6">
                        <div className="flex items-start gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft font-bold text-accent-light">
                            {getInitials(
                              member.firstName,
                              member.lastName,
                            )}
                          </span>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-content">
                              {member.firstName} {member.lastName}
                            </p>

                            {member.email ? (
                              <a
                                href={`mailto:${member.email}`}
                                className="mt-1 flex items-center gap-1.5 text-sm text-muted transition hover:text-accent-light"
                              >
                                <Mail
                                  size={14}
                                  className="shrink-0"
                                />

                                <span className="truncate">
                                  {member.email}
                                </span>
                              </a>
                            ) : (
                              <p className="mt-1 text-sm text-subtle">
                                Keine E-Mail-Adresse
                              </p>
                            )}

                            {primaryFunction ? (
                              <p className="mt-1 text-xs font-medium text-accent-light">
                                {primaryFunction}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-mono text-sm font-semibold text-content">
                          {member.membershipNumber}
                        </p>
                      </td>

                      <td className="px-5 py-5 text-sm text-muted">
                        {
                          membershipTypeLabels[
                            member.membershipType
                          ]
                        }
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <MapPin
                            size={15}
                            className="shrink-0"
                          />

                          <span>
                            {member.postalCode} {member.city}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <CalendarDays
                            size={15}
                            className="shrink-0"
                          />

                          {member.joinedAt
                            ? formatDate(member.joinedAt)
                            : "Nicht hinterlegt"}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        {member.user ? (
                          <span className="inline-flex rounded-full border border-line bg-page-soft px-3 py-1 text-xs font-semibold text-muted">
                            {
                              userStatusLabels[
                                member.user.status
                              ]
                            }
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
                            Kein Konto
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <Link
                          href={`/admin/mitglieder/${member.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-line bg-page-soft px-4 py-2 text-sm font-semibold text-content transition hover:border-accent-border hover:text-accent-light"
                        >
                          <UserRound size={16} />
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
            {filtersActive ? (
              <>
                <Search
                  size={42}
                  className="mx-auto text-subtle"
                />

                <h2 className="mt-6 text-2xl font-bold text-content">
                  Keine passenden Mitglieder gefunden
                </h2>

                <p className="mx-auto mt-4 max-w-xl leading-8 text-muted">
                  Zu den ausgewählten Such- und Filterkriterien
                  wurden keine Mitglieder gefunden.
                </p>

                <Link
                  href="/admin/mitglieder"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl border border-line bg-page-soft px-5 py-3 text-sm font-semibold text-content transition hover:border-accent-border hover:text-accent-light"
                >
                  <X size={17} />
                  Filter zurücksetzen
                </Link>
              </>
            ) : (
              <>
                <CircleCheck
                  size={42}
                  className="mx-auto text-emerald-300"
                />

                <h2 className="mt-6 text-2xl font-bold text-content">
                  Noch keine Mitglieder vorhanden
                </h2>

                <p className="mx-auto mt-4 max-w-xl leading-8 text-muted">
                  Sobald ein Mitgliedsantrag genehmigt und
                  übernommen wurde, erscheint das neue Mitglied
                  automatisch in dieser Übersicht.
                </p>
              </>
            )}
          </div>
        )}
      </section>
    </>
  );
}

type StatusCardProps = {
  label: string;
  value: number;
  description: string;
  icon: typeof Users;
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

function getInitials(
  firstName: string,
  lastName: string,
): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}