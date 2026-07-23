import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  FileCheck2,
  HeartHandshake,
  House,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  PlayCircle,
  ShieldCheck,
  TrainFront,
  UserRound,
  Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

import {
  approveApplicationAction,
  rejectApplicationAction,
  startApplicationReviewAction,
} from "./actions";

type AdminApplicationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

const statusConfig = {
  PENDING: {
    label: "Eingegangen",
    description: "Der Antrag wurde noch nicht bearbeitet.",
    className:
      "border-amber-400/30 bg-amber-400/10 text-amber-200",
  },
  IN_REVIEW: {
    label: "In Prüfung",
    description: "Die Prüfung des Antrags wurde begonnen.",
    className:
      "border-blue-400/30 bg-blue-400/10 text-blue-200",
  },
  APPROVED: {
    label: "Genehmigt",
    description:
      "Der Antrag wurde genehmigt und als Mitglied übernommen.",
    className:
      "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  },
  REJECTED: {
    label: "Abgelehnt",
    description: "Der Antrag wurde abgelehnt.",
    className:
      "border-red-400/30 bg-red-400/10 text-red-200",
  },
  WITHDRAWN: {
    label: "Zurückgezogen",
    description: "Der Antrag wurde zurückgezogen.",
    className:
      "border-line bg-page-soft text-subtle",
  },
} as const;

const membershipTypeLabels = {
  REGULAR: "Ordentliches Mitglied",
  REDUCED: "Ermäßigtes Mitglied",
  SUPPORTING: "Fördermitglied",
} as const;

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: AdminApplicationDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  const application =
    await prisma.membershipApplication.findUnique({
      where: {
        id,
      },
      select: {
        firstName: true,
        lastName: true,
      },
    });

  if (!application) {
    return {
      title: "Antrag nicht gefunden",
    };
  }

  return {
    title: `Antrag von ${application.firstName} ${application.lastName}`,
  };
}

export default async function AdminApplicationDetailPage({
  params,
  searchParams,
}: AdminApplicationDetailPageProps) {
  const { id } = await params;
  const { success, error } = await searchParams;

  const application =
    await prisma.membershipApplication.findUnique({
      where: {
        id,
      },
      include: {
        reviewedBy: {
          select: {
            displayName: true,
            email: true,
          },
        },

        member: {
          select: {
            id: true,
            membershipNumber: true,
            status: true,
          },
        },

        historyEntries: {
          include: {
            actorUser: {
              select: {
                displayName: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

  if (!application) {
    notFound();
  }

  const status = statusConfig[application.status];
  const age = calculateAge(application.birthDate);

  return (
    <>
      <Link
        href="/admin/antraege"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-content"
      >
        <ArrowLeft size={17} />
        Zurück zu den Anträgen
      </Link>

      <ApplicationMessages
        success={success}
        error={error}
      />

      <section className="mt-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent-light">
              <UserRound size={27} />
            </span>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-accent-light">
                Mitgliedsantrag
              </p>

              <h1 className="mt-1 break-words text-3xl font-bold tracking-tight text-content sm:text-4xl">
                {application.firstName} {application.lastName}
              </h1>

              <p className="mt-2 text-sm text-muted">
                Eingegangen am{" "}
                {formatDateTime(application.createdAt)}
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
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <DetailSection
            title="Persönliche Daten"
            description="Grundlegende Angaben der antragstellenden Person"
            icon={UserRound}
          >
            <DetailGrid>
              <DetailItem
                label="Vorname"
                value={application.firstName}
              />

              <DetailItem
                label="Nachname"
                value={application.lastName}
              />

              <DetailItem
                label="Geburtsdatum"
                value={formatDate(application.birthDate)}
              />

              <DetailItem
                label="Alter"
                value={`${age} Jahre${
                  application.isMinor
                    ? " · minderjährig"
                    : ""
                }`}
              />

              <DetailItem
                label="Mitgliedsform"
                value={
                  membershipTypeLabels[
                    application.membershipType
                  ]
                }
              />

              <DetailItem
                label="Land"
                value={application.country}
              />
            </DetailGrid>
          </DetailSection>

          <DetailSection
            title="Kontakt und Anschrift"
            description="Kontaktdaten und Wohnanschrift"
            icon={MapPin}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <ContactCard
                label="E-Mail-Adresse"
                value={application.email}
                href={`mailto:${application.email}`}
                icon={Mail}
              />

              <ContactCard
                label="Telefonnummer"
                value={application.phone || "Nicht angegeben"}
                href={
                  application.phone
                    ? `tel:${application.phone}`
                    : undefined
                }
                icon={Phone}
              />
            </div>

            <div className="mt-4 rounded-xl border border-line bg-page-soft p-4">
              <div className="flex items-start gap-3">
                <House
                  size={19}
                  className="mt-0.5 shrink-0 text-muted"
                />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
                    Anschrift
                  </p>

                  <p className="mt-2 leading-7 text-content">
                    {application.street}{" "}
                    {application.houseNumber}
                    <br />
                    {application.postalCode}{" "}
                    {application.city}
                    <br />
                    {application.country}
                  </p>
                </div>
              </div>
            </div>
          </DetailSection>

          <DetailSection
            title="Beruf und Eisenbahn"
            description="Freiwillige Angaben zum beruflichen Hintergrund"
            icon={TrainFront}
          >
            <DetailGrid>
              <DetailItem
                label="Beruf oder Tätigkeit"
                value={
                  application.occupation ||
                  "Nicht angegeben"
                }
                icon={BriefcaseBusiness}
              />

              <DetailItem
                label="Eisenbahnqualifikation"
                value={
                  application.railwayQualification ||
                  "Nicht angegeben"
                }
                icon={TrainFront}
              />

              <DetailItem
                label="Telegram"
                value={
                  application.telegramUsername ||
                  "Nicht angegeben"
                }
              />

              <DetailItem
                label="Notfallkontakt"
                value={
                  application.emergencyContactName
                    ? `${application.emergencyContactName}${
                        application.emergencyContactPhone
                          ? ` · ${application.emergencyContactPhone}`
                          : ""
                      }`
                    : "Nicht angegeben"
                }
                icon={HeartHandshake}
              />
            </DetailGrid>
          </DetailSection>

          {application.isMinor ? (
            <DetailSection
              title="Sorgeberechtigte Person"
              description="Angaben bei minderjährigen Antragstellern"
              icon={Users}
            >
              <DetailGrid>
                <DetailItem
                  label="Name"
                  value={
                    `${application.guardianFirstName ?? ""} ${
                      application.guardianLastName ?? ""
                    }`.trim() || "Nicht angegeben"
                  }
                />

                <DetailItem
                  label="Beziehung"
                  value={
                    application.guardianRelationship ||
                    "Nicht angegeben"
                  }
                />

                <DetailItem
                  label="E-Mail-Adresse"
                  value={
                    application.guardianEmail ||
                    "Nicht angegeben"
                  }
                />

                <DetailItem
                  label="Telefonnummer"
                  value={
                    application.guardianPhone ||
                    "Nicht angegeben"
                  }
                />
              </DetailGrid>

              {(application.guardianStreet ||
                application.guardianPostalCode ||
                application.guardianCity) && (
                <div className="mt-4 rounded-xl border border-line bg-page-soft p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
                    Anschrift der sorgeberechtigten Person
                  </p>

                  <p className="mt-2 leading-7 text-content">
                    {application.guardianStreet}{" "}
                    {application.guardianHouseNumber}
                    <br />
                    {application.guardianPostalCode}{" "}
                    {application.guardianCity}
                  </p>
                </div>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ConsentItem
                  label="Zustimmung erteilt"
                  accepted={
                    application.guardianConsentAccepted
                  }
                />

                <ConsentItem
                  label="Sorgeberechtigung bestätigt"
                  accepted={
                    application.guardianAuthorityConfirmed
                  }
                />
              </div>

              {application.guardianNameConfirmation ? (
                <div className="mt-4 rounded-xl border border-line bg-page-soft p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
                    Namensbestätigung
                  </p>

                  <p className="mt-2 text-content">
                    {
                      application.guardianNameConfirmation
                    }
                  </p>
                </div>
              ) : null}
            </DetailSection>
          ) : null}

          {application.message ? (
            <DetailSection
              title="Nachricht"
              description="Zusätzliche Nachricht zum Antrag"
              icon={MessageSquareText}
            >
              <p className="whitespace-pre-wrap leading-7 text-muted">
                {application.message}
              </p>
            </DetailSection>
          ) : null}

          <DetailSection
            title="Einwilligungen"
            description="Bestätigungen aus dem Antragsformular"
            icon={ShieldCheck}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <ConsentItem
                label="Datenschutz akzeptiert"
                accepted={application.privacyAccepted}
              />

              <ConsentItem
                label="Satzung akzeptiert"
                accepted={application.statutesAccepted}
              />

              <ConsentItem
                label="Beitragsordnung akzeptiert"
                accepted={
                  application.contributionRulesAccepted
                }
              />
            </div>

            <DetailGrid className="mt-4">
              <DetailItem
                label="Datenschutzversion"
                value={
                  application.privacyVersion ||
                  "Nicht dokumentiert"
                }
              />

              <DetailItem
                label="Satzungsversion"
                value={
                  application.statutesVersion ||
                  "Nicht dokumentiert"
                }
              />

              <DetailItem
                label="Beitragsordnungsversion"
                value={
                  application.contributionRulesVersion ||
                  "Nicht dokumentiert"
                }
              />
            </DetailGrid>
          </DetailSection>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-bold text-content">
              Bearbeitungsstatus
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted">
              {status.description}
            </p>

            <div className="mt-5 space-y-4">
              <SidebarItem
                label="Eingegangen"
                value={formatDateTime(application.createdAt)}
                icon={CalendarDays}
              />

              <SidebarItem
                label="Zuletzt geändert"
                value={formatDateTime(application.updatedAt)}
                icon={Clock3}
              />

              <SidebarItem
                label="Bearbeitet von"
                value={
                  application.reviewedBy?.displayName ||
                  "Noch niemand"
                }
                icon={UserRound}
              />

              <SidebarItem
                label="Bearbeitet am"
                value={
                  application.reviewedAt
                    ? formatDateTime(application.reviewedAt)
                    : "Noch nicht bearbeitet"
                }
                icon={FileCheck2}
              />
            </div>
          </div>

          <ApplicationHistory
            historyEntries={application.historyEntries}
          />

          {application.member ? (
            <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-5">
              <ShieldCheck
                size={24}
                className="text-emerald-200"
              />

              <h2 className="mt-4 font-bold text-content">
                Mitglied angelegt
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                Dieser Antrag ist bereits mit einem Mitglied
                verknüpft.
              </p>

              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-subtle">
                    Mitgliedsnummer
                  </dt>

                  <dd className="mt-1 font-semibold text-content">
                    {application.member.membershipNumber}
                  </dd>
                </div>

                <div>
                  <dt className="text-subtle">
                    Mitgliederstatus
                  </dt>

                  <dd className="mt-1 font-semibold text-content">
                    {application.member.status}
                  </dd>
                </div>
              </dl>

              <Link
                href={`/admin/mitglieder/${application.member.id}`}
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-emerald-400/30 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/10"
              >
                Mitglied öffnen
              </Link>
            </div>
          ) : application.status === "PENDING" ? (
            <StartReviewCard
              applicationId={application.id}
            />
          ) : application.status === "IN_REVIEW" ? (
            <ReviewDecisionCard
              applicationId={application.id}
              reviewedBy={application.reviewedBy}
            />
          ) : (
            <div className="rounded-2xl border border-line bg-surface p-5">
              <FileCheck2
                size={24}
                className="text-muted"
              />

              <h2 className="mt-4 font-bold text-content">
                Antrag abgeschlossen
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                Dieser Antrag hat den Status „{status.label}“ und
                kann nicht erneut bearbeitet werden.
              </p>
            </div>
          )}

          {application.decisionNote ||
          application.rejectionReason ? (
            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="font-bold text-content">
                Bearbeitungsvermerk
              </h2>

              {application.decisionNote ? (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
                    Interne Notiz
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">
                    {application.decisionNote}
                  </p>
                </div>
              ) : null}

              {application.rejectionReason ? (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
                    Ablehnungsgrund
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">
                    {application.rejectionReason}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </aside>
      </section>
    </>
  );
}

type ApplicationMessagesProps = {
  success?: string;
  error?: string;
};

function ApplicationMessages({
  success,
  error,
}: ApplicationMessagesProps) {
  const messages: Array<{
    visible: boolean;
    type: "success" | "error";
    title: string;
    description: string;
  }> = [
    {
      visible: success === "review-started",
      type: "success",
      title: "Bearbeitung wurde begonnen",
      description:
        "Der Antrag befindet sich jetzt im Status „In Prüfung“.",
    },
    {
      visible: success === "application-rejected",
      type: "success",
      title: "Antrag wurde abgelehnt",
      description:
        "Die Entscheidung und der Ablehnungsgrund wurden gespeichert.",
    },
    {
      visible: error === "review-unavailable",
      type: "error",
      title: "Bearbeitung konnte nicht begonnen werden",
      description:
        "Der Antrag wurde möglicherweise bereits bearbeitet oder sein Status hat sich geändert.",
    },
    {
      visible: error === "approval-confirmation",
      type: "error",
      title: "Bestätigung erforderlich",
      description:
        "Bitte bestätige, dass die Angaben des Antrags geprüft wurden.",
    },
    {
      visible: error === "approval-unavailable",
      type: "error",
      title: "Antrag konnte nicht genehmigt werden",
      description:
        "Der Antrag wurde möglicherweise bereits abgeschlossen.",
    },
    {
      visible: error === "rejection-reason",
      type: "error",
      title: "Ablehnungsgrund erforderlich",
      description:
        "Bitte trage einen Ablehnungsgrund mit mindestens fünf Zeichen ein.",
    },
    {
      visible: error === "rejection-confirmation",
      type: "error",
      title: "Bestätigung erforderlich",
      description:
        "Bitte bestätige ausdrücklich, dass der Antrag abgelehnt werden soll.",
    },
    {
      visible: error === "rejection-unavailable",
      type: "error",
      title: "Antrag konnte nicht abgelehnt werden",
      description:
        "Der Antrag wurde möglicherweise bereits abgeschlossen.",
    },
  ];

  return messages
    .filter((message) => message.visible)
    .map((message) => (
      <div
        key={`${message.type}-${message.title}`}
        role={
          message.type === "error"
            ? "alert"
            : "status"
        }
        className={[
          "mt-6 flex gap-3 rounded-2xl border p-4 text-sm",
          message.type === "error"
            ? "border-red-400/30 bg-red-400/10 text-red-100"
            : "border-blue-400/30 bg-blue-400/10 text-blue-100",
        ].join(" ")}
      >
        {message.type === "error" ? (
          <CircleAlert
            size={19}
            className="mt-0.5 shrink-0"
          />
        ) : (
          <Check
            size={19}
            className="mt-0.5 shrink-0"
          />
        )}

        <div>
          <p className="font-semibold">
            {message.title}
          </p>

          <p className="mt-1 leading-6 opacity-80">
            {message.description}
          </p>
        </div>
      </div>
    ));
}

type StartReviewCardProps = {
  applicationId: string;
};

function StartReviewCard({
  applicationId,
}: StartReviewCardProps) {
  return (
    <div className="rounded-2xl border border-accent-border bg-accent-soft p-5">
      <PlayCircle
        size={24}
        className="text-accent-light"
      />

      <h2 className="mt-4 font-bold text-content">
        Antrag bearbeiten
      </h2>

      <p className="mt-2 text-sm leading-6 text-muted">
        Beginne die formelle Prüfung des Antrags. Dein
        Benutzerkonto und der aktuelle Zeitpunkt werden gespeichert.
      </p>

      <form
        action={startApplicationReviewAction}
        className="mt-5"
      >
        <input
          type="hidden"
          name="applicationId"
          value={applicationId}
        />

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
        >
          <PlayCircle size={17} />
          Bearbeitung beginnen
        </button>
      </form>
    </div>
  );
}

type ReviewDecisionCardProps = {
  applicationId: string;
  reviewedBy: {
    displayName: string;
    email: string;
  } | null;
};

function ReviewDecisionCard({
  applicationId,
  reviewedBy,
}: ReviewDecisionCardProps) {
  return (
    <div className="rounded-2xl border border-blue-400/25 bg-blue-400/10 p-5">
      <Clock3
        size={24}
        className="text-blue-200"
      />

      <h2 className="mt-4 font-bold text-content">
        Antrag wird geprüft
      </h2>

      <p className="mt-2 text-sm leading-6 text-muted">
        Die Bearbeitung dieses Antrags wurde bereits begonnen.
      </p>

      {reviewedBy ? (
        <div className="mt-4 rounded-xl border border-blue-400/20 bg-blue-400/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-100/60">
            Zuständige Person
          </p>

          <p className="mt-2 font-semibold text-content">
            {reviewedBy.displayName}
          </p>

          <p className="mt-1 text-sm text-muted">
            {reviewedBy.email}
          </p>
        </div>
      ) : null}

      <form
        action={approveApplicationAction}
        className="mt-5"
      >
        <input
          type="hidden"
          name="applicationId"
          value={applicationId}
        />

        <label
          htmlFor="decision-note"
          className="text-sm font-semibold text-content"
        >
          Interner Bearbeitungsvermerk
        </label>

        <textarea
          id="decision-note"
          name="decisionNote"
          rows={4}
          placeholder="Optionaler interner Vermerk zur Aufnahme"
          className="mt-2 w-full resize-y rounded-xl border border-blue-400/20 bg-page-soft px-4 py-3 text-sm text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
        />

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-page-soft p-4">
          <input
            type="checkbox"
            name="approvalConfirmed"
            value="yes"
            required
            className="mt-1 h-4 w-4 shrink-0 accent-emerald-500"
          />

          <span>
            <span className="block text-sm font-semibold text-content">
              Angaben wurden geprüft
            </span>

            <span className="mt-1 block text-xs leading-5 text-muted">
              Ich bestätige, dass das Mitglied aufgenommen werden
              kann.
            </span>
          </span>
        </label>

        <button
          type="submit"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
        >
          <ShieldCheck size={17} />
          Antrag genehmigen
        </button>
      </form>

      <details className="group mt-3">
        <summary className="flex w-full cursor-pointer list-none items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100 transition hover:border-red-400/50 hover:bg-red-400/20 [&::-webkit-details-marker]:hidden">
          Antrag ablehnen
        </summary>

        <div className="mt-4 rounded-xl border border-red-400/25 bg-red-400/5 p-4">
          <form action={rejectApplicationAction}>
            <input
              type="hidden"
              name="applicationId"
              value={applicationId}
            />

            <label
              htmlFor="rejection-reason"
              className="text-sm font-semibold text-content"
            >
              Ablehnungsgrund
              <span className="ml-1 text-red-300">
                *
              </span>
            </label>

            <textarea
              id="rejection-reason"
              name="rejectionReason"
              rows={4}
              required
              minLength={5}
              placeholder="Begründung für die Ablehnung"
              className="mt-2 w-full resize-y rounded-xl border border-red-400/20 bg-page-soft px-4 py-3 text-sm text-content outline-none transition placeholder:text-subtle focus:border-red-400/50 focus:ring-2 focus:ring-red-400/10"
            />

            <p className="mt-2 text-xs leading-5 text-muted">
              Der Grund wird gespeichert und kann später für die
              Ablehnungs-E-Mail verwendet werden.
            </p>

            <label
              htmlFor="rejection-decision-note"
              className="mt-4 block text-sm font-semibold text-content"
            >
              Interner Bearbeitungsvermerk
            </label>

            <textarea
              id="rejection-decision-note"
              name="rejectionDecisionNote"
              rows={3}
              placeholder="Optionaler interner Vermerk"
              className="mt-2 w-full resize-y rounded-xl border border-line bg-page-soft px-4 py-3 text-sm text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
            />

            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/5 p-4">
              <input
                type="checkbox"
                name="rejectionConfirmed"
                value="yes"
                required
                className="mt-1 h-4 w-4 shrink-0 accent-red-500"
              />

              <span>
                <span className="block text-sm font-semibold text-content">
                  Ablehnung bestätigen
                </span>

                <span className="mt-1 block text-xs leading-5 text-muted">
                  Ich bestätige, dass der Antrag endgültig
                  abgelehnt werden soll.
                </span>
              </span>
            </label>

            <button
              type="submit"
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              Antrag endgültig ablehnen
            </button>
          </form>
        </div>
      </details>
    </div>
  );
}

type ApplicationHistoryProps = {
  historyEntries: Array<{
    id: number;
    action:
      | "REVIEW_STARTED"
      | "APPROVED"
      | "REJECTED"
      | "WITHDRAWN"
      | "NOTE_ADDED";
    previousStatus:
      | "PENDING"
      | "IN_REVIEW"
      | "APPROVED"
      | "REJECTED"
      | "WITHDRAWN"
      | null;
    newStatus:
      | "PENDING"
      | "IN_REVIEW"
      | "APPROVED"
      | "REJECTED"
      | "WITHDRAWN"
      | null;
    message: string | null;
    createdAt: Date;
    actorUser: {
      displayName: string;
      email: string;
    } | null;
  }>;
};

function ApplicationHistory({
  historyEntries,
}: ApplicationHistoryProps) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h2 className="font-bold text-content">
        Bearbeitungsprotokoll
      </h2>

      <p className="mt-2 text-sm leading-6 text-muted">
        Übersicht aller gespeicherten Änderungen und Entscheidungen.
      </p>

      {historyEntries.length > 0 ? (
        <ol className="mt-6 space-y-5">
          {historyEntries.map((entry, index) => {
            const historyData =
              getHistoryEntryData(entry.action);

            const HistoryIcon = historyData.icon;

            return (
              <li
                key={entry.id}
                className="relative pl-10"
              >
                {index < historyEntries.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-[0.9rem] top-8 h-[calc(100%+0.25rem)] w-px bg-line"
                  />
                ) : null}

                <span
                  className={[
                    "absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border",
                    historyData.className,
                  ].join(" ")}
                >
                  <HistoryIcon size={14} />
                </span>

                <div>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-content">
                        {historyData.label}
                      </p>

                      <p className="mt-1 text-xs text-subtle">
                        {formatDateTime(entry.createdAt)}
                      </p>
                    </div>

                    <span className="rounded-full border border-line bg-page-soft px-2.5 py-1 text-xs font-semibold text-muted">
                      {entry.actorUser?.displayName ??
                        "System"}
                    </span>
                  </div>

                  {entry.previousStatus ||
                  entry.newStatus ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      {entry.previousStatus ? (
                        <span className="rounded-full border border-line bg-page-soft px-2.5 py-1 text-muted">
                          {getStatusLabel(
                            entry.previousStatus,
                          )}
                        </span>
                      ) : null}

                      {entry.previousStatus &&
                      entry.newStatus ? (
                        <span className="text-subtle">
                          →
                        </span>
                      ) : null}

                      {entry.newStatus ? (
                        <span className="rounded-full border border-accent-border bg-accent-soft px-2.5 py-1 font-semibold text-accent-light">
                          {getStatusLabel(
                            entry.newStatus,
                          )}
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  {entry.message ? (
                    <div className="mt-3 rounded-xl border border-line bg-page-soft p-3">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-muted">
                        {entry.message}
                      </p>
                    </div>
                  ) : null}

                  {entry.actorUser?.email ? (
                    <p className="mt-2 text-xs text-subtle">
                      {entry.actorUser.email}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="mt-5 rounded-xl border border-line bg-page-soft p-4">
          <p className="text-sm font-semibold text-content">
            Noch keine Protokolleinträge
          </p>

          <p className="mt-2 text-sm leading-6 text-muted">
            Neue Statusänderungen werden automatisch hier
            dokumentiert.
          </p>
        </div>
      )}
    </div>
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
          <h2 className="font-bold text-content">
            {title}
          </h2>

          <p className="mt-1 text-sm text-muted">
            {description}
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

type DetailGridProps = {
  children: React.ReactNode;
  className?: string;
};

function DetailGrid({
  children,
  className = "",
}: DetailGridProps) {
  return (
    <dl
      className={`grid gap-4 sm:grid-cols-2 ${className}`}
    >
      {children}
    </dl>
  );
}

type DetailItemProps = {
  label: string;
  value: string;
  icon?: typeof UserRound;
};

function DetailItem({
  label,
  value,
  icon: Icon,
}: DetailItemProps) {
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

function ContactCard({
  label,
  value,
  href,
  icon: Icon,
}: ContactCardProps) {
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-muted">
        <Icon size={18} />
      </span>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
          {label}
        </p>

        <p className="mt-1 break-words font-medium text-content">
          {value}
        </p>
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

type ConsentItemProps = {
  label: string;
  accepted: boolean;
};

function ConsentItem({
  label,
  accepted,
}: ConsentItemProps) {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-xl border p-4",
        accepted
          ? "border-emerald-400/25 bg-emerald-400/10"
          : "border-red-400/25 bg-red-400/10",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          accepted
            ? "bg-emerald-400/15 text-emerald-200"
            : "bg-red-400/15 text-red-200",
        ].join(" ")}
      >
        {accepted ? (
          <Check size={17} />
        ) : (
          <CircleAlert size={17} />
        )}
      </span>

      <div>
        <p className="font-semibold text-content">
          {label}
        </p>

        <p className="mt-0.5 text-xs text-muted">
          {accepted
            ? "Bestätigt"
            : "Nicht bestätigt"}
        </p>
      </div>
    </div>
  );
}

type SidebarItemProps = {
  label: string;
  value: string;
  icon: typeof CalendarDays;
};

function SidebarItem({
  label,
  value,
  icon: Icon,
}: SidebarItemProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-page-soft text-muted">
        <Icon size={17} />
      </span>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium leading-6 text-content">
          {value}
        </p>
      </div>
    </div>
  );
}

function getStatusLabel(
  status:
    | "PENDING"
    | "IN_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "WITHDRAWN",
): string {
  return statusConfig[status].label;
}

function getHistoryEntryData(
  action:
    | "REVIEW_STARTED"
    | "APPROVED"
    | "REJECTED"
    | "WITHDRAWN"
    | "NOTE_ADDED",
) {
  switch (action) {
    case "REVIEW_STARTED":
      return {
        label: "Bearbeitung begonnen",
        icon: PlayCircle,
        className:
          "border-blue-400/30 bg-blue-400/10 text-blue-200",
      };

    case "APPROVED":
      return {
        label: "Antrag genehmigt",
        icon: ShieldCheck,
        className:
          "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
      };

    case "REJECTED":
      return {
        label: "Antrag abgelehnt",
        icon: CircleAlert,
        className:
          "border-red-400/30 bg-red-400/10 text-red-200",
      };

    case "WITHDRAWN":
      return {
        label: "Antrag zurückgezogen",
        icon: FileCheck2,
        className:
          "border-line bg-page-soft text-muted",
      };

    case "NOTE_ADDED":
      return {
        label: "Notiz hinzugefügt",
        icon: MessageSquareText,
        className:
          "border-accent-border bg-accent-soft text-accent-light",
      };
  }
}

function calculateAge(birthDate: Date): number {
  const today = new Date();

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const birthdayOccurred =
    today.getMonth() >
      birthDate.getMonth() ||
    (today.getMonth() ===
      birthDate.getMonth() &&
      today.getDate() >=
        birthDate.getDate());

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