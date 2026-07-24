import type { ReactNode } from "react";

import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileText,
  MapPin,
  ReceiptText,
  UserRound,
  WalletCards,
} from "lucide-react";

import type {
  InvoiceItemType,
  InvoiceStatus,
  PaymentAttemptStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  ReminderLevel,
  ReminderStatus,
} from "@/generated/prisma/client";

import {
  issueInvoiceAction,
} from "@/app/admin/rechnungen/[id]/actions";

import {
  recordInvoicePaymentAction,
} from "@/app/admin/rechnungen/[id]/payment-actions";

import {
  formatEuroAmount,
} from "@/config/membership-fees";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type InvoiceDetailPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

type InvoiceWithHistory =
  Prisma.InvoiceGetPayload<{
    include: {
      items: true;

      payments: true;

      paymentAttempts: true;

      reminders: true;

      membershipCharge: true;

      member: {
        select: {
          id: true;
          membershipNumber: true;
        };
      };
    };
  }>;

const invoiceStatusLabels: Record<
  InvoiceStatus,
  string
> = {
  DRAFT: "Entwurf",
  ISSUED: "Ausgestellt",
  PARTIALLY_PAID:
    "Teilweise bezahlt",
  PAID: "Bezahlt",
  OVERDUE: "Überfällig",
  CANCELLED: "Storniert",
};

const invoiceStatusClasses: Record<
  InvoiceStatus,
  string
> = {
  DRAFT:
    "border-slate-500/30 bg-slate-500/10 text-slate-300",

  ISSUED:
    "border-blue-400/30 bg-blue-400/10 text-blue-200",

  PARTIALLY_PAID:
    "border-amber-400/30 bg-amber-400/10 text-amber-200",

  PAID:
    "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",

  OVERDUE:
    "border-red-400/30 bg-red-400/10 text-red-200",

  CANCELLED:
    "border-line bg-page-soft text-subtle",
};

const invoiceItemTypeLabels: Record<
  InvoiceItemType,
  string
> = {
  MEMBERSHIP_FEE:
    "Mitgliedsbeitrag",

  ADMISSION_FEE:
    "Aufnahmegebühr",

  OTHER:
    "Sonstige Position",

  CREDIT:
    "Gutschrift",
};

const paymentMethodLabels: Record<
  PaymentMethod,
  string
> = {
  BANK_TRANSFER:
    "Überweisung",

  SEPA_DIRECT_DEBIT:
    "SEPA-Lastschrift",

  CASH:
    "Barzahlung",

  CARD:
    "Kartenzahlung",

  OTHER:
    "Sonstige",
};

const paymentStatusLabels: Record<
  PaymentStatus,
  string
> = {
  PENDING:
    "Ausstehend",

  COMPLETED:
    "Abgeschlossen",

  FAILED:
    "Fehlgeschlagen",

  REFUNDED:
    "Erstattet",

  CANCELLED:
    "Abgebrochen",
};

const paymentAttemptStatusLabels: Record<
  PaymentAttemptStatus,
  string
> = {
  PENDING:
    "Vorbereitet",

  SUBMITTED:
    "Übermittelt",

  SUCCEEDED:
    "Erfolgreich",

  FAILED:
    "Fehlgeschlagen",

  RETURNED:
    "Rücklastschrift",

  CANCELLED:
    "Abgebrochen",
};

const reminderLevelLabels: Record<
  ReminderLevel,
  string
> = {
  PAYMENT_REMINDER:
    "Zahlungserinnerung",

  FIRST_REMINDER:
    "Erste Mahnung",

  FINAL_REMINDER:
    "Letzte Mahnung",
};

const reminderStatusLabels: Record<
  ReminderStatus,
  string
> = {
  DRAFT:
    "Entwurf",

  ISSUED:
    "Ausgestellt",

  SENT:
    "Versendet",

  SETTLED:
    "Erledigt",

  CANCELLED:
    "Storniert",
};

export const dynamic =
  "force-dynamic";

export default async function InvoiceDetailPage({
  params,
  searchParams,
}: InvoiceDetailPageProps) {
  const currentUser =
    await getCurrentUser();

  if (!currentUser) {
    redirect("/portal/login");
  }

  if (
    !currentUser.roleKeys.includes(
      "ADMIN",
    )
  ) {
    redirect("/portal/app");
  }

  const resolvedParams =
    await params;

  const messages =
    await searchParams;

  const invoiceId =
    Number.parseInt(
      resolvedParams.id,
      10,
    );

  if (
    !Number.isInteger(invoiceId) ||
    invoiceId < 1
  ) {
    notFound();
  }

  const invoice =
    await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
      },

      include: {
        items: {
          orderBy: {
            position: "asc",
          },
        },

        payments: {
          orderBy: {
            paidAt: "desc",
          },
        },

        paymentAttempts: {
          orderBy: {
            createdAt: "desc",
          },
        },

        reminders: {
          orderBy: {
            createdAt: "desc",
          },
        },

        membershipCharge: true,

        member: {
          select: {
            id: true,
            membershipNumber: true,
          },
        },
      },
    });

  if (!invoice) {
    notFound();
  }

  const canIssue =
    invoice.status === "DRAFT";

  const canRecordPayment =
    invoice.status !== "DRAFT" &&
    invoice.status !== "CANCELLED" &&
    invoice.openCents > 0;

  const isFullyPaid =
    invoice.status === "PAID" ||
    invoice.openCents === 0;

  const canDownloadPdf =
    invoice.status !== "DRAFT" &&
    invoice.status !== "CANCELLED";

  return (
    <main>
      <div className="mb-8">
        <Link
          href={`/admin/rechnungen?year=${invoice.billingYear}&month=${invoice.billingMonth}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent-light transition hover:text-content"
        >
          <ArrowLeft size={16} />
          Zur Rechnungsübersicht
        </Link>

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent-light">
              Rechnung
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-content sm:text-4xl">
              {invoice.invoiceNumber}
            </h1>

            <p className="mt-3 text-muted">
              Beitragsrechnung für{" "}
              {formatContributionPeriod(
                invoice.billingYear,
                invoice.billingMonth,
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={[
                "inline-flex w-fit rounded-full border px-3 py-1.5 text-sm font-semibold",

                invoiceStatusClasses[
                  invoice.status
                ],
              ].join(" ")}
            >
              {
                invoiceStatusLabels[
                  invoice.status
                ]
              }
            </span>

            {canDownloadPdf ? (
              <Link
                href={`/admin/rechnungen/${invoice.id}/download`}
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-content transition hover:border-accent-border hover:bg-surface-hover"
              >
                <FileText size={17} />
                PDF herunterladen
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {messages.success ? (
        <div className="mb-6 flex gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-100">
          <CheckCircle2
            size={20}
            className="mt-0.5 shrink-0"
          />

          <p className="text-sm leading-6">
            {messages.success}
          </p>
        </div>
      ) : null}

      {messages.error ? (
        <div className="mb-6 flex gap-3 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-red-100">
          <CircleAlert
            size={20}
            className="mt-0.5 shrink-0"
          />

          <p className="text-sm leading-6">
            {messages.error}
          </p>
        </div>
      ) : null}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Gesamtbetrag"
          value={formatEuroAmount(
            invoice.totalCents,
          )}
          icon={ReceiptText}
        />

        <SummaryCard
          label="Bezahlt"
          value={formatEuroAmount(
            invoice.paidCents,
          )}
          icon={CheckCircle2}
        />

        <SummaryCard
          label="Offen"
          value={formatEuroAmount(
            invoice.openCents,
          )}
          icon={Banknote}
        />

        <SummaryCard
          label="Fällig am"
          value={formatDate(
            invoice.dueDate,
          )}
          icon={Clock3}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="border-b border-line px-5 py-5 sm:px-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-content">
                <FileText size={20} />
                Rechnungspositionen
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-page-soft text-xs uppercase tracking-wide text-subtle">
                  <tr>
                    <th className="px-5 py-3 font-semibold">
                      Pos.
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Beschreibung
                    </th>

                    <th className="px-5 py-3 text-right font-semibold">
                      Menge
                    </th>

                    <th className="px-5 py-3 text-right font-semibold">
                      Einzelpreis
                    </th>

                    <th className="px-5 py-3 text-right font-semibold">
                      Gesamt
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-line">
                  {invoice.items.map(
                    (item) => (
                      <tr key={item.id}>
                        <td className="px-5 py-4 text-muted">
                          {item.position}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-content">
                            {
                              item.description
                            }
                          </p>

                          <p className="mt-1 text-xs text-subtle">
                            {
                              invoiceItemTypeLabels[
                                item.type
                              ]
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4 text-right text-muted">
                          {item.quantity}
                        </td>

                        <td className="px-5 py-4 text-right text-muted">
                          {formatEuroAmount(
                            item.unitAmountCents,
                          )}
                        </td>

                        <td className="px-5 py-4 text-right font-semibold text-content">
                          {formatEuroAmount(
                            item.totalAmountCents,
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>

                <tfoot className="border-t border-line bg-page-soft">
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-4 text-right font-semibold text-muted"
                    >
                      Rechnungsbetrag
                    </td>

                    <td className="px-5 py-4 text-right text-lg font-bold text-content">
                      {formatEuroAmount(
                        invoice.totalCents,
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <HistorySection
            invoice={invoice}
          />
        </div>

        <aside className="space-y-6">
          <InfoCard
            title="Empfänger"
            icon={UserRound}
          >
            <p className="font-semibold text-content">
              {invoice.recipientName}
            </p>

            <p className="mt-1 text-sm text-muted">
              Mitgliedsnummer:{" "}
              {
                invoice.recipientMembershipNumber
              }
            </p>

            <address className="mt-4 not-italic text-sm leading-6 text-muted">
              {invoice.recipientStreet}{" "}
              {
                invoice.recipientHouseNumber
              }
              <br />

              {
                invoice.recipientPostalCode
              }{" "}
              {invoice.recipientCity}
              <br />

              {
                invoice.recipientCountry
              }
            </address>

            <Link
              href={`/admin/mitglieder/${invoice.member.id}`}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-light transition hover:text-content"
            >
              Mitglied öffnen

              <ArrowLeft
                size={14}
                className="rotate-180"
              />
            </Link>
          </InfoCard>

          <InfoCard
            title="Rechnungsdaten"
            icon={CalendarDays}
          >
            <DefinitionRow
              label="Ausgestellt"
              value={formatDate(
                invoice.issueDate,
              )}
            />

            <DefinitionRow
              label="Fällig"
              value={formatDate(
                invoice.dueDate,
              )}
            />

            <DefinitionRow
              label="Währung"
              value={invoice.currency}
            />

            <DefinitionRow
              label="Finalisiert"
              value={
                invoice.finalizedAt
                  ? formatDateTime(
                      invoice.finalizedAt,
                    )
                  : "Noch nicht"
              }
            />

            <DefinitionRow
              label="PDF erzeugt"
              value={
                invoice.pdfGeneratedAt
                  ? formatDateTime(
                      invoice.pdfGeneratedAt,
                    )
                  : "Noch nicht"
              }
            />
          </InfoCard>

          <InfoCard
            title="Rechnungssteller"
            icon={MapPin}
          >
            <p className="font-semibold text-content">
              {invoice.issuerName}
            </p>

            <address className="mt-3 not-italic text-sm leading-6 text-muted">
              {invoice.issuerStreet}{" "}
              {
                invoice.issuerHouseNumber
              }
              <br />

              {
                invoice.issuerPostalCode
              }{" "}
              {invoice.issuerCity}
              <br />

              {
                invoice.issuerCountry
              }
            </address>

            {invoice.issuerIban ? (
              <div className="mt-4 border-t border-line pt-4 text-sm">
                <DefinitionRow
                  label="IBAN"
                  value={
                    invoice.issuerIban
                  }
                />

                {invoice.issuerBic ? (
                  <DefinitionRow
                    label="BIC"
                    value={
                      invoice.issuerBic
                    }
                  />
                ) : null}
              </div>
            ) : null}
          </InfoCard>

          {canRecordPayment ? (
            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="flex items-center gap-2 font-bold text-content">
                <WalletCards size={18} />
                Zahlung erfassen
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                Erfasst einen tatsächlichen
                Zahlungseingang und aktualisiert
                den offenen Rechnungsbetrag
                automatisch.
              </p>

              <form
                action={
                  recordInvoicePaymentAction
                }
                className="mt-5 space-y-4"
              >
                <input
                  type="hidden"
                  name="invoiceId"
                  value={invoice.id}
                />

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-content">
                    Betrag
                  </span>

                  <div className="relative">
                    <input
                      type="text"
                      name="amount"
                      inputMode="decimal"
                      required
                      defaultValue={formatAmountInput(
                        invoice.openCents,
                      )}
                      className="w-full rounded-xl border border-line bg-page px-3 py-2.5 pr-12 text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent/20"
                    />

                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-muted">
                      €
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-subtle">
                    Noch offen:{" "}
                    {formatEuroAmount(
                      invoice.openCents,
                    )}
                  </p>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-content">
                    Zahlungsart
                  </span>

                  <select
                    name="paymentMethod"
                    defaultValue="BANK_TRANSFER"
                    required
                    className="w-full rounded-xl border border-line bg-page px-3 py-2.5 text-content outline-none transition focus:border-accent-border focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="BANK_TRANSFER">
                      Überweisung
                    </option>

                    <option value="SEPA_DIRECT_DEBIT">
                      SEPA-Lastschrift
                    </option>

                    <option value="CASH">
                      Barzahlung
                    </option>

                    <option value="CARD">
                      Kartenzahlung
                    </option>

                    <option value="OTHER">
                      Sonstige Zahlungsart
                    </option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-content">
                    Zahlungsdatum
                  </span>

                  <input
                    type="date"
                    name="paidAt"
                    required
                    defaultValue={formatDateInput(
                      new Date(),
                    )}
                    className="w-full rounded-xl border border-line bg-page px-3 py-2.5 text-content outline-none transition focus:border-accent-border focus:ring-2 focus:ring-accent/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-content">
                    Referenz
                  </span>

                  <input
                    type="text"
                    name="reference"
                    maxLength={191}
                    placeholder="z. B. Bankreferenz oder Transaktions-ID"
                    className="w-full rounded-xl border border-line bg-page px-3 py-2.5 text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-content">
                    Notiz
                  </span>

                  <textarea
                    name="note"
                    rows={3}
                    placeholder="Optionale interne Notiz"
                    className="w-full resize-y rounded-xl border border-line bg-page px-3 py-2.5 text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent/20"
                  />
                </label>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark"
                >
                  <Banknote size={18} />
                  Zahlung verbuchen
                </button>
              </form>
            </div>
          ) : null}

          {isFullyPaid ? (
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5">
              <CheckCircle2
                size={24}
                className="text-emerald-300"
              />

              <h2 className="mt-4 font-bold text-content">
                Vollständig bezahlt
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                Für diese Rechnung ist kein
                Betrag mehr offen.
              </p>
            </div>
          ) : null}

          {canIssue ? (
            <div className="rounded-2xl border border-accent-border bg-accent-soft p-5">
              <h2 className="font-bold text-content">
                Rechnung ausstellen
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                Nach der Ausstellung darf
                die Rechnung inhaltlich nicht
                mehr verändert werden.
              </p>

              <form
                action={
                  issueInvoiceAction
                }
                className="mt-5"
              >
                <input
                  type="hidden"
                  name="invoiceId"
                  value={invoice.id}
                />

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark"
                >
                  <CheckCircle2
                    size={18}
                  />

                  Rechnung ausstellen
                </button>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-surface p-5">
              <CheckCircle2
                size={24}
                className="text-emerald-300"
              />

              <h2 className="mt-4 font-bold text-content">
                Rechnung ist gesperrt
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                Die Rechnung wurde bereits
                ausgestellt oder anderweitig
                abgeschlossen.
              </p>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

function HistorySection({
  invoice,
}: {
  invoice: InvoiceWithHistory;
}) {
  const hasHistory =
    invoice.payments.length > 0 ||
    invoice.paymentAttempts.length >
      0 ||
    invoice.reminders.length > 0;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="text-lg font-bold text-content">
        Zahlungs- und Mahnhistorie
      </h2>

      {!hasHistory ? (
        <p className="mt-4 text-sm text-muted">
          Für diese Rechnung wurden bisher
          keine Zahlungen, Zahlungsversuche
          oder Mahnungen erfasst.
        </p>
      ) : (
        <div className="mt-5 space-y-5">
          {invoice.payments.length > 0 ? (
            <HistoryGroup title="Zahlungen">
              {invoice.payments.map(
                (payment) => (
                  <HistoryEntry
                    key={`payment-${payment.id}`}
                    title={`${formatEuroAmount(
                      payment.amountCents,
                    )} · ${
                      paymentMethodLabels[
                        payment.method
                      ]
                    }`}
                    description={
                      paymentStatusLabels[
                        payment.status
                      ]
                    }
                    date={payment.paidAt}
                  />
                ),
              )}
            </HistoryGroup>
          ) : null}

          {invoice.paymentAttempts
            .length > 0 ? (
            <HistoryGroup title="Zahlungsversuche">
              {invoice.paymentAttempts.map(
                (attempt) => (
                  <HistoryEntry
                    key={`attempt-${attempt.id}`}
                    title={`${formatEuroAmount(
                      attempt.amountCents,
                    )} · ${
                      paymentMethodLabels[
                        attempt.method
                      ]
                    }`}
                    description={
                      paymentAttemptStatusLabels[
                        attempt.status
                      ]
                    }
                    date={
                      attempt.completedAt ??
                      attempt.failedAt ??
                      attempt.returnedAt ??
                      attempt.requestedAt
                    }
                  />
                ),
              )}
            </HistoryGroup>
          ) : null}

          {invoice.reminders.length > 0 ? (
            <HistoryGroup title="Mahnungen">
              {invoice.reminders.map(
                (reminder) => (
                  <HistoryEntry
                    key={`reminder-${reminder.id}`}
                    title={`${
                      reminderLevelLabels[
                        reminder.level
                      ]
                    } · ${
                      reminder.reminderNumber
                    }`}
                    description={
                      reminderStatusLabels[
                        reminder.status
                      ]
                    }
                    date={
                      reminder.issuedAt
                    }
                  />
                ),
              )}
            </HistoryGroup>
          ) : null}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof ReceiptText;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-page-soft text-muted">
        <Icon size={19} />
      </span>

      <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-content">
        {value}
      </p>
    </div>
  );
}

function InfoCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof UserRound;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h2 className="flex items-center gap-2 font-bold text-content">
        <Icon size={18} />
        {title}
      </h2>

      <div className="mt-4">
        {children}
      </div>
    </div>
  );
}

function DefinitionRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-2.5 last:border-b-0">
      <span className="text-sm text-muted">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-content">
        {value}
      </span>
    </div>
  );
}

function HistoryGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide text-muted">
        {title}
      </h3>

      <div className="mt-3 divide-y divide-line rounded-xl border border-line">
        {children}
      </div>
    </div>
  );
}

function HistoryEntry({
  title,
  description,
  date,
}: {
  title: string;
  description: string;
  date: Date;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div>
        <p className="font-semibold text-content">
          {title}
        </p>

        <p className="mt-1 text-sm text-muted">
          {description}
        </p>
      </div>

      <time className="text-sm text-subtle">
        {formatDateTime(date)}
      </time>
    </div>
  );
}

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

function formatDateTime(
  date: Date,
): string {
  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function formatContributionPeriod(
  year: number,
  month: number,
): string {
  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        1,
        12,
      ),
    );

  return new Intl.DateTimeFormat(
    "de-DE",
    {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    },
  ).format(date);
}

function formatAmountInput(
  amountCents: number,
): string {
  return (
    amountCents / 100
  )
    .toFixed(2)
    .replace(".", ",");
}

function formatDateInput(
  date: Date,
): string {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, "0");

  const day =
    String(
      date.getDate(),
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}