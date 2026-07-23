import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  CalendarDays,
  CircleAlert,
  CreditCard,
  FileText,
  House,
  KeyRound,
  Mail,
  MailWarning,
  MapPin,
  Phone,
  ShieldCheck,
  TrainFront,
  UserRound,
  Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

type AdminMemberDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const memberStatusConfig = {
  ACTIVE: {
    label: "Aktiv",
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  },
  INACTIVE: {
    label: "Inaktiv",
    className: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  },
  RESIGNED: {
    label: "Ausgetreten",
    className: "border-line bg-page-soft text-muted",
  },
  EXPELLED: {
    label: "Ausgeschlossen",
    className: "border-red-400/30 bg-red-400/10 text-red-200",
  },
  DECEASED: {
    label: "Verstorben",
    className: "border-line bg-page-soft text-subtle",
  },
} as const;

const membershipTypeLabels = {
  REGULAR: "Ordentliches Mitglied",
  REDUCED: "Ermäßigtes Mitglied",
  SUPPORTING: "Fördermitglied",
} as const;

const userStatusConfig = {
  PENDING: {
    label: "Nicht aktiviert",
    className: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  },
  ACTIVE: {
    label: "Aktiv",
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  },
  BLOCKED: {
    label: "Gesperrt",
    className: "border-red-400/30 bg-red-400/10 text-red-200",
  },
  DISABLED: {
    label: "Deaktiviert",
    className: "border-line bg-page-soft text-subtle",
  },
} as const;

export async function generateMetadata({
  params,
}: AdminMemberDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const memberId = Number(id);

  if (!Number.isInteger(memberId)) {
    return {
      title: "Mitglied nicht gefunden",
    };
  }

  const member = await prisma.member.findUnique({
    where: {
      id: memberId,
    },
    select: {
      firstName: true,
      lastName: true,
      membershipNumber: true,
    },
  });

  if (!member) {
    return {
      title: "Mitglied nicht gefunden",
    };
  }

  return {
    title: `${member.firstName} ${member.lastName} · ${member.membershipNumber}`,
  };
}

export const dynamic = "force-dynamic";

export default async function AdminMemberDetailPage({
  params,
}: AdminMemberDetailPageProps) {
  const { id } = await params;
  const memberId = Number(id);

  if (!Number.isInteger(memberId)) {
    notFound();
  }

  const member = await prisma.member.findUnique({
    where: {
      id: memberId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          roles: {
            include: {
              role: {
                select: {
                  name: true,
                  key: true,
                },
              },
            },
          },
        },
      },
      functions: {
        include: {
          function: {
            select: {
              name: true,
              description: true,
            },
          },
        },
        orderBy: [
          {
            isPrimary: "desc",
          },
          {
            displayOrder: "asc",
          },
        ],
      },
      application: {
        select: {
          id: true,
          createdAt: true,
          status: true,
        },
      },
    },
  });

  if (!member) {
    notFound();
  }

  const memberStatus = memberStatusConfig[member.status];

  return (
    <>
      <Link
        href="/admin/mitglieder"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-content"
      >
        <ArrowLeft size={17} />
        Zurück zur Mitgliederübersicht
      </Link>

      <section className="mt-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-xl font-bold text-accent-light">
              {getInitials(member.firstName, member.lastName)}
            </span>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-accent-light">
                Mitglied {member.membershipNumber}
              </p>

              <h1 className="mt-1 break-words text-3xl font-bold tracking-tight text-content sm:text-4xl">
                {member.firstName} {member.lastName}
              </h1>

              <p className="mt-2 text-sm text-muted">
                {membershipTypeLabels[member.membershipType]}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${memberStatus.className}`}
          >
            {memberStatus.label}
          </span>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <DetailSection
            title="Persönliche Daten"
            description="Stammdaten des Mitglieds"
            icon={UserRound}
          >
            <DetailGrid>
              <DetailItem label="Vorname" value={member.firstName} />

              <DetailItem label="Nachname" value={member.lastName} />

              <DetailItem
                label="Geburtsdatum"
                value={formatDate(member.birthDate)}
              />

              <DetailItem
                label="Alter"
                value={`${calculateAge(member.birthDate)} Jahre${
                  member.isMinor ? " · minderjährig" : ""
                }`}
              />

              <DetailItem
                label="Mitgliedsnummer"
                value={member.membershipNumber}
              />

              <DetailItem
                label="Mitgliedsart"
                value={membershipTypeLabels[member.membershipType]}
              />
            </DetailGrid>
          </DetailSection>

          <DetailSection
            title="Kontakt und Anschrift"
            description="Kontaktmöglichkeiten und postalische Anschrift"
            icon={MapPin}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <ContactCard
                label="E-Mail-Adresse"
                value={member.email || "Nicht hinterlegt"}
                href={member.email ? `mailto:${member.email}` : undefined}
                icon={Mail}
              />

              <ContactCard
                label="Telefonnummer"
                value={member.phone || "Nicht hinterlegt"}
                href={member.phone ? `tel:${member.phone}` : undefined}
                icon={Phone}
              />
            </div>

            <div className="mt-4 rounded-xl border border-line bg-page-soft p-4">
              <div className="flex items-start gap-3">
                <House size={19} className="mt-0.5 shrink-0 text-muted" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
                    Anschrift
                  </p>

                  <p className="mt-2 leading-7 text-content">
                    {member.street} {member.houseNumber}
                    <br />
                    {member.postalCode} {member.city}
                    <br />
                    {member.country}
                  </p>
                </div>
              </div>
            </div>
          </DetailSection>

          <DetailSection
            title="Mitgliedschaft"
            description="Status, Eintritt und Herkunft des Mitgliedsdatensatzes"
            icon={BadgeCheck}
          >
            <DetailGrid>
              <DetailItem label="Mitgliedsstatus" value={memberStatus.label} />

              <DetailItem
                label="Eintrittsdatum"
                value={
                  member.joinedAt
                    ? formatDate(member.joinedAt)
                    : "Nicht hinterlegt"
                }
                icon={CalendarDays}
              />

              <DetailItem
                label="Austrittsdatum"
                value={
                  member.leftAt
                    ? formatDate(member.leftAt)
                    : "Kein Austritt hinterlegt"
                }
              />

              <DetailItem
                label="Datensatz angelegt"
                value={formatDateTime(member.createdAt)}
              />

              <DetailItem
                label="Zuletzt geändert"
                value={formatDateTime(member.updatedAt)}
              />

              <DetailItem
                label="Mitgliedsantrag"
                value={
                  member.application
                    ? `Vorhanden · ${formatDate(member.application.createdAt)}`
                    : "Kein Antrag verknüpft"
                }
              />
            </DetailGrid>

            {member.functions.length > 0 ? (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
                  Vereinsfunktionen
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {member.functions.map((entry) => (
                    <span
                      key={`${entry.memberId}-${entry.functionId}`}
                      title={entry.function.description ?? undefined}
                      className={[
                        "rounded-full border px-3 py-1.5 text-sm font-semibold",
                        entry.isPrimary
                          ? "border-accent-border bg-accent-soft text-accent-light"
                          : "border-line bg-page-soft text-muted",
                      ].join(" ")}
                    >
                      {entry.function.name}
                      {entry.isPrimary ? " · Hauptfunktion" : ""}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-line bg-page-soft p-4">
                <p className="text-sm text-muted">
                  Diesem Mitglied sind derzeit keine Vereinsfunktionen
                  zugeordnet.
                </p>
              </div>
            )}
          </DetailSection>

          <DetailSection
            title="Beruf und Eisenbahn"
            description="Freiwillige Zusatzangaben"
            icon={TrainFront}
          >
            <DetailGrid>
              <DetailItem
                label="Beruf oder Tätigkeit"
                value={member.occupation || "Nicht hinterlegt"}
                icon={BriefcaseBusiness}
              />

              <DetailItem
                label="Eisenbahnqualifikation"
                value={member.railwayQualification || "Nicht hinterlegt"}
                icon={TrainFront}
              />

              <DetailItem
                label="Telegram"
                value={member.telegramUsername || "Nicht hinterlegt"}
              />

              <DetailItem
                label="Notfallkontakt"
                value={
                  member.emergencyContactName
                    ? `${member.emergencyContactName}${
                        member.emergencyContactPhone
                          ? ` · ${member.emergencyContactPhone}`
                          : ""
                      }`
                    : "Nicht hinterlegt"
                }
              />
            </DetailGrid>
          </DetailSection>

          {member.isMinor ? (
            <DetailSection
              title="Sorgeberechtigte Person"
              description="Hinterlegte Daten bei minderjährigen Mitgliedern"
              icon={Users}
            >
              <DetailGrid>
                <DetailItem
                  label="Name"
                  value={
                    `${member.guardianFirstName ?? ""} ${
                      member.guardianLastName ?? ""
                    }`.trim() || "Nicht hinterlegt"
                  }
                />

                <DetailItem
                  label="Beziehung"
                  value={member.guardianRelationship || "Nicht hinterlegt"}
                />

                <DetailItem
                  label="E-Mail-Adresse"
                  value={member.guardianEmail || "Nicht hinterlegt"}
                />

                <DetailItem
                  label="Telefonnummer"
                  value={member.guardianPhone || "Nicht hinterlegt"}
                />
              </DetailGrid>
            </DetailSection>
          ) : null}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-bold text-content">Portalzugang</h2>

            {member.user ? (
              <>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      userStatusConfig[member.user.status].className
                    }`}
                  >
                    {userStatusConfig[member.user.status].label}
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  <SidebarItem
                    label="Anzeigename"
                    value={member.user.displayName}
                    icon={UserRound}
                  />

                  <SidebarItem
                    label="Login-E-Mail"
                    value={member.user.email}
                    icon={Mail}
                  />

                  <SidebarItem
                    label="Konto angelegt"
                    value={formatDateTime(member.user.createdAt)}
                    icon={CalendarDays}
                  />

                  <SidebarItem
                    label="Rollen"
                    value={
                      member.user.roles.length > 0
                        ? member.user.roles
                            .map((entry) => entry.role.name)
                            .join(", ")
                        : "Keine Rollen zugeordnet"
                    }
                    icon={ShieldCheck}
                  />
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4">
                <CircleAlert size={21} className="text-amber-200" />

                <p className="mt-3 font-semibold text-content">
                  Kein Portalzugang
                </p>

                <p className="mt-2 text-sm leading-6 text-muted">
                  Für dieses Mitglied wurde noch kein Benutzerkonto angelegt
                  oder aktiviert.
                </p>
              </div>
            )}

            <button
              type="button"
              disabled
              className="mt-5 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-line bg-page-soft px-4 py-3 text-sm font-semibold text-muted opacity-60"
            >
              <KeyRound size={17} />
              Zugang verwalten
            </button>
          </div>

          <PreparedModule
            title="Rechnungen"
            description="Beiträge und weitere Forderungen verwalten"
            icon={FileText}
          />

          <PreparedModule
            title="Zahlungen"
            description="Zahlungseingänge und offene Beträge"
            icon={Banknote}
          />

          <PreparedModule
            title="SEPA-Mandat"
            description="Lastschriftmandat und Bankverbindung"
            icon={CreditCard}
          />

          <PreparedModule
            title="Mahnungen"
            description="Zahlungserinnerungen und Mahnstufen"
            icon={MailWarning}
          />

          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-bold text-content">Verwaltung</h2>

            <Link
              href={`/admin/mitglieder/${member.id}/bearbeiten`}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              Mitglied bearbeiten
            </Link>
          </div>
        </aside>
      </section>
    </>
  );
}

type DetailSectionProps = {
  title: string;
  description: string;
  icon: typeof UserRound;
  children: React.ReactNode;
};

function DetailSection({
  title,
  description,
  icon: Icon,
  children,
}: DetailSectionProps) {
  return (
    <section className="rounded-2xl border border-line bg-surface">
      <div className="flex items-start gap-3 border-b border-line px-5 py-5 sm:px-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-page-soft text-muted">
          <Icon size={19} />
        </span>

        <div>
          <h2 className="font-bold text-content">{title}</h2>

          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

type DetailGridProps = {
  children: React.ReactNode;
};

function DetailGrid({ children }: DetailGridProps) {
  return <dl className="grid gap-4 sm:grid-cols-2">{children}</dl>;
}

type DetailItemProps = {
  label: string;
  value: string;
  icon?: typeof UserRound;
};

function DetailItem({ label, value, icon: Icon }: DetailItemProps) {
  return (
    <div className="rounded-xl border border-line bg-page-soft p-4">
      <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-subtle">
        {Icon ? <Icon size={14} /> : null}
        {label}
      </dt>

      <dd className="mt-2 break-words font-medium leading-6 text-content">
        {value}
      </dd>
    </div>
  );
}

type ContactCardProps = {
  label: string;
  value: string;
  href?: string;
  icon: typeof Mail;
};

function ContactCard({ label, value, href, icon: Icon }: ContactCardProps) {
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-muted">
        <Icon size={18} />
      </span>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
          {label}
        </p>

        <p className="mt-1 break-words font-medium text-content">{value}</p>
      </div>
    </>
  );

  if (!href) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-line bg-page-soft p-4">
        {content}
      </div>
    );
  }

  return (
    <a
      href={href}
      className="flex items-start gap-3 rounded-xl border border-line bg-page-soft p-4 transition hover:border-accent-border"
    >
      {content}
    </a>
  );
}

type SidebarItemProps = {
  label: string;
  value: string;
  icon: typeof CalendarDays;
};

function SidebarItem({ label, value, icon: Icon }: SidebarItemProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-page-soft text-muted">
        <Icon size={17} />
      </span>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium leading-6 text-content">
          {value}
        </p>
      </div>
    </div>
  );
}

type PreparedModuleProps = {
  title: string;
  description: string;
  icon: typeof FileText;
};

function PreparedModule({
  title,
  description,
  icon: Icon,
}: PreparedModuleProps) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-page-soft text-muted">
          <Icon size={19} />
        </span>

        <div>
          <h2 className="font-bold text-content">{title}</h2>

          <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
        </div>
      </div>

      <span className="mt-4 inline-flex rounded-full border border-line bg-page-soft px-3 py-1 text-xs font-semibold text-subtle">
        In Vorbereitung
      </span>
    </div>
  );
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
