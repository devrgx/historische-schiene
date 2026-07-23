import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CircleAlert,
  House,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  TrainFront,
  UserRound,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Meine Mitgliedschaft",
};

const membershipTypeConfig = {
  REGULAR: "Ordentliches Mitglied",
  SUPPORTING: "Fördermitglied",
  REDUCED: "Ermäßigtes Mitglied",
  HONORARY: "Ehrenmitglied",
} as const;

const memberStatusConfig = {
  ACTIVE: {
    label: "Aktiv",
    description:
      "Deine Mitgliedschaft ist derzeit aktiv.",
    className:
      "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  },

  INACTIVE: {
    label: "Inaktiv",
    description:
      "Deine Mitgliedschaft ist derzeit inaktiv.",
    className:
      "border-amber-400/30 bg-amber-400/10 text-amber-200",
  },

  RESIGNED: {
    label: "Ausgetreten",
    description:
      "Deine Mitgliedschaft wurde durch Austritt beendet.",
    className:
      "border-line bg-page-soft text-subtle",
  },

  EXPELLED: {
    label: "Ausgeschlossen",
    description:
      "Die Mitgliedschaft wurde beendet.",
    className:
      "border-red-400/30 bg-red-400/10 text-red-200",
  },

  DECEASED: {
    label: "Verstorben",
    description:
      "Die Mitgliedschaft wurde beendet.",
    className:
      "border-line bg-page-soft text-subtle",
  },
} as const;

export const dynamic = "force-dynamic";

export default async function MembershipPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/portal/login");
  }

  const member = await prisma.member.findUnique({
    where: {
      userId: currentUser.id,
    },
  });

  if (!member) {
    return (
      <main className="min-h-screen bg-page px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/portal/app"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-content"
          >
            <ArrowLeft size={17} />
            Zurück zum Mitgliederbereich
          </Link>

          <div className="surface-card mt-6 p-7 sm:p-9">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-200">
                <CircleAlert size={24} />
              </span>

              <div>
                <p className="text-sm font-semibold text-amber-200">
                  Keine Mitgliedsakte gefunden
                </p>

                <h1 className="mt-1 text-2xl font-bold text-content">
                  Dein Konto ist nicht verknüpft
                </h1>

                <p className="mt-3 leading-7 text-muted">
                  Zu deinem Benutzerkonto konnte keine Mitgliedsakte
                  gefunden werden. Bitte wende dich an den Verein,
                  damit die Verknüpfung geprüft werden kann.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const status = memberStatusConfig[member.status];

  const address = [
    `${member.street} ${member.houseNumber}`.trim(),
    `${member.postalCode} ${member.city}`.trim(),
    member.country,
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-page px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/portal/app"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-content"
        >
          <ArrowLeft size={17} />
          Zurück zum Mitgliederbereich
        </Link>

        <header className="mt-6 flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent-light">
              <UserRound size={27} />
            </span>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-accent-light">
                Mitglied {member.membershipNumber}
              </p>

              <h1 className="mt-1 break-words text-3xl font-bold tracking-tight text-content sm:text-4xl">
                Meine Mitgliedschaft
              </h1>

              <p className="mt-2 text-muted">
                {member.firstName} {member.lastName}
              </p>
            </div>
          </div>

          <span
            className={[
              "inline-flex rounded-full border px-4 py-2 text-sm font-semibold",
              status.className,
            ].join(" ")}
          >
            {status.label}
          </span>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            <SectionCard
              title="Mitgliedschaft"
              description="Informationen zu deiner Vereinsmitgliedschaft"
            >
              <dl className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  label="Mitgliedsnummer"
                  value={member.membershipNumber}
                  icon={BadgeCheck}
                />

                <InfoItem
                  label="Mitgliedschaftsart"
                  value={
                    membershipTypeConfig[
                      member.membershipType
                    ]
                  }
                  icon={ShieldCheck}
                />

                <InfoItem
                  label="Mitgliedsstatus"
                  value={status.label}
                  icon={ShieldCheck}
                />

                <InfoItem
                  label="Eintrittsdatum"
                  value={
                    member.joinedAt
                      ? formatDate(member.joinedAt)
                      : "Nicht hinterlegt"
                  }
                  icon={CalendarDays}
                />
              </dl>

              <div className="mt-5 rounded-xl border border-line bg-page-soft p-4">
                <p className="text-sm font-semibold text-content">
                  {status.description}
                </p>

                {member.leftAt ? (
                  <p className="mt-2 text-sm text-muted">
                    Beendigungsdatum: {formatDate(member.leftAt)}
                  </p>
                ) : null}
              </div>
            </SectionCard>

            <SectionCard
              title="Kontaktdaten"
              description="Deine beim Verein hinterlegten Kontaktmöglichkeiten"
            >
              <dl className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  label="E-Mail-Adresse"
                  value={member.email ?? "Nicht hinterlegt"}
                  icon={Mail}
                />

                <InfoItem
                  label="Telefonnummer"
                  value={member.phone ?? "Nicht hinterlegt"}
                  icon={Phone}
                />

                <InfoItem
                  label="Geburtsdatum"
                  value={formatDate(member.birthDate)}
                  icon={CalendarDays}
                />

                <InfoItem
                  label="Telegram"
                  value={
                    member.telegramUsername
                      ? formatTelegramUsername(
                          member.telegramUsername,
                        )
                      : "Nicht hinterlegt"
                  }
                  icon={UserRound}
                />
              </dl>
            </SectionCard>

            <SectionCard
              title="Anschrift"
              description="Deine aktuell hinterlegte Postanschrift"
            >
              <div className="flex items-start gap-4 rounded-xl border border-line bg-page-soft p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
                  <House size={19} />
                </span>

                <div>
                  <p className="font-semibold text-content">
                    {member.firstName} {member.lastName}
                  </p>

                  <address className="mt-2 not-italic leading-7 text-muted">
                    {address.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </address>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Weitere Angaben"
              description="Optionale Angaben für die Vereinsarbeit"
            >
              <dl className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  label="Beruf"
                  value={member.occupation ?? "Nicht hinterlegt"}
                  icon={BriefcaseBusiness}
                />

                <InfoItem
                  label="Eisenbahnqualifikation"
                  value={
                    member.railwayQualification ??
                    "Nicht hinterlegt"
                  }
                  icon={TrainFront}
                />

                <InfoItem
                  label="Notfallkontakt"
                  value={
                    member.emergencyContactName ??
                    "Nicht hinterlegt"
                  }
                  icon={UserRound}
                />

                <InfoItem
                  label="Telefon Notfallkontakt"
                  value={
                    member.emergencyContactPhone ??
                    "Nicht hinterlegt"
                  }
                  icon={Phone}
                />
              </dl>
            </SectionCard>

            {member.isMinor ? (
              <SectionCard
                title="Erziehungsberechtigte Person"
                description="Für minderjährige Mitglieder hinterlegte Angaben"
              >
                <dl className="grid gap-4 sm:grid-cols-2">
                  <InfoItem
                    label="Name"
                    value={
                      [
                        member.guardianFirstName,
                        member.guardianLastName,
                      ]
                        .filter(Boolean)
                        .join(" ") || "Nicht hinterlegt"
                    }
                    icon={UserRound}
                  />

                  <InfoItem
                    label="Verhältnis"
                    value={
                      member.guardianRelationship ??
                      "Nicht hinterlegt"
                    }
                    icon={ShieldCheck}
                  />

                  <InfoItem
                    label="E-Mail-Adresse"
                    value={
                      member.guardianEmail ??
                      "Nicht hinterlegt"
                    }
                    icon={Mail}
                  />

                  <InfoItem
                    label="Telefonnummer"
                    value={
                      member.guardianPhone ??
                      "Nicht hinterlegt"
                    }
                    icon={Phone}
                  />
                </dl>
              </SectionCard>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="surface-card p-5">
              <h2 className="font-bold text-content">
                Daten ändern
              </h2>

              <p className="mt-2 text-sm leading-7 text-muted">
                Änderungen an deinen persönlichen Daten können derzeit
                noch nicht direkt über das Portal vorgenommen werden.
              </p>

              <a
                href="mailto:intern@historische-schiene.de?subject=Änderung meiner Mitgliedsdaten"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
              >
                <Mail size={17} />
                Änderung mitteilen
              </a>
            </div>

            <div className="surface-card p-5">
              <h2 className="font-bold text-content">
                Deine Anschrift
              </h2>

              <div className="mt-4 flex items-start gap-3">
                <MapPin
                  size={19}
                  className="mt-1 shrink-0 text-accent-light"
                />

                <p className="text-sm leading-7 text-muted">
                  {address.join(", ")}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-accent-border bg-accent-soft p-5">
              <p className="font-semibold text-content">
                Hinweis zum Datenschutz
              </p>

              <p className="mt-2 text-sm leading-7 text-muted">
                Diese Daten sind nur für dich und berechtigte
                Vereinsverantwortliche sichtbar.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

type SectionCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

function SectionCard({
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <section className="surface-card overflow-hidden">
      <div className="border-b border-line px-5 py-5 sm:px-6">
        <h2 className="font-bold text-content">{title}</h2>

        <p className="mt-1 text-sm text-muted">
          {description}
        </p>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

type InfoItemProps = {
  label: string;
  value: string;
  icon: typeof Mail;
};

function InfoItem({
  label,
  value,
  icon: Icon,
}: InfoItemProps) {
  return (
    <div className="rounded-xl border border-line bg-page-soft p-4">
      <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-subtle">
        <Icon size={14} />
        {label}
      </dt>

      <dd className="mt-2 break-words font-medium leading-6 text-content">
        {value}
      </dd>
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(date);
}

function formatTelegramUsername(value: string): string {
  const normalizedValue = value.trim();

  return normalizedValue.startsWith("@")
    ? normalizedValue
    : `@${normalizedValue}`;
}