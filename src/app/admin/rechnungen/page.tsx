import Link from "next/link";
import { redirect } from "next/navigation";

import type {
  InvoiceStatus,
} from "@/generated/prisma/client";

import {
  generateMonthlyInvoicesAction,
} from "@/app/admin/rechnungen/actions";

import {
  formatEuroAmount,
} from "@/config/membership-fees";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type InvoicePageSearchParams = {
  year?: string;
  month?: string;

  success?: string;
  error?: string;

  examined?: string;
  created?: string;
  skipped?: string;
  failed?: string;
};

type InvoicePageProps = {
  searchParams:
    Promise<InvoicePageSearchParams>;
};

const monthNames = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
] as const;

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
    "border-slate-600 bg-slate-800 text-slate-200",

  ISSUED:
    "border-blue-700 bg-blue-950/60 text-blue-200",

  PARTIALLY_PAID:
    "border-amber-700 bg-amber-950/60 text-amber-200",

  PAID:
    "border-emerald-700 bg-emerald-950/60 text-emerald-200",

  OVERDUE:
    "border-red-700 bg-red-950/60 text-red-200",

  CANCELLED:
    "border-zinc-700 bg-zinc-900 text-zinc-400",
};

export default async function AdminInvoicesPage({
  searchParams,
}: InvoicePageProps) {
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

  const parameters =
    await searchParams;

  const now = new Date();

  const selectedYear =
    parseSelectedYear(
      parameters.year,
      now.getFullYear(),
    );

  const selectedMonth =
    parseSelectedMonth(
      parameters.month,
      now.getMonth() + 1,
    );

  const invoices =
    await prisma.invoice.findMany({
      where: {
        billingYear:
          selectedYear,

        billingMonth:
          selectedMonth,
      },

      select: {
        id: true,
        invoiceNumber: true,
        status: true,

        issueDate: true,
        dueDate: true,

        totalCents: true,
        paidCents: true,
        openCents: true,

        recipientName: true,
        recipientMembershipNumber:
          true,

        member: {
          select: {
            id: true,
          },
        },
      },

      orderBy: [
        {
          invoiceNumber: "asc",
        },
      ],
    });

  const totals =
    invoices.reduce(
      (result, invoice) => {
        result.totalCents +=
          invoice.totalCents;

        result.paidCents +=
          invoice.paidCents;

        result.openCents +=
          invoice.openCents;

        return result;
      },
      {
        totalCents: 0,
        paidCents: 0,
        openCents: 0,
      },
    );

  const availableYears =
    createYearOptions(
      selectedYear,
    );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin"
              className="mb-3 inline-flex text-sm font-medium text-blue-300 transition hover:text-blue-200"
            >
              ← Zurück zum Adminbereich
            </Link>

            <h1 className="text-3xl font-bold tracking-tight">
              Rechnungswesen
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Monatliche Beitragsrechnungen
              erzeugen, prüfen und später
              finalisieren.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
            Ausgewählter Zeitraum:{" "}
            <strong className="text-slate-100">
              {
                monthNames[
                  selectedMonth - 1
                ]
              }{" "}
              {selectedYear}
            </strong>
          </div>
        </div>

        {parameters.success ? (
          <SuccessMessage
            message={
              parameters.success
            }
            examined={
              parameters.examined
            }
            created={
              parameters.created
            }
            skipped={
              parameters.skipped
            }
            failed={
              parameters.failed
            }
          />
        ) : null}

        {parameters.error ? (
          <div className="mb-6 rounded-xl border border-red-800 bg-red-950/50 p-4 text-sm text-red-200">
            <strong className="block font-semibold">
              Rechnungslauf
              fehlgeschlagen
            </strong>

            <span className="mt-1 block">
              {parameters.error}
            </span>
          </div>
        ) : null}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/10">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">
              Monatlicher Rechnungslauf
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              Bereits vorhandene
              Beitragsforderungen werden nicht
              doppelt erzeugt. Neue Rechnungen
              bleiben zunächst Entwürfe.
            </p>
          </div>

          <form
            action={
              generateMonthlyInvoicesAction
            }
            className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Monat
              </span>

              <select
                name="billingMonth"
                defaultValue={
                  selectedMonth
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {monthNames.map(
                  (
                    monthName,
                    index,
                  ) => (
                    <option
                      key={
                        monthName
                      }
                      value={
                        index + 1
                      }
                    >
                      {monthName}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Jahr
              </span>

              <select
                name="billingYear"
                defaultValue={
                  selectedYear
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {availableYears.map(
                  (year) => (
                    <option
                      key={year}
                      value={year}
                    >
                      {year}
                    </option>
                  ),
                )}
              </select>
            </label>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Rechnungsentwürfe
              erzeugen
            </button>
          </form>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Rechnungen"
            value={
              invoices.length.toString()
            }
          />

          <SummaryCard
            label="Gesamtbetrag"
            value={formatEuroAmount(
              totals.totalCents,
            )}
          />

          <SummaryCard
            label="Bezahlt"
            value={formatEuroAmount(
              totals.paidCents,
            )}
          />

          <SummaryCard
            label="Offen"
            value={formatEuroAmount(
              totals.openCents,
            )}
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl shadow-black/10">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="text-lg font-semibold">
              Rechnungen für{" "}
              {
                monthNames[
                  selectedMonth - 1
                ]
              }{" "}
              {selectedYear}
            </h2>
          </div>

          {invoices.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="font-medium text-slate-300">
                Für diesen Monat sind
                noch keine Rechnungen
                vorhanden.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Starte oben den
                Rechnungslauf, um Entwürfe
                für alle beitragspflichtigen
                Mitglieder zu erzeugen.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">
                      Rechnung
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Mitglied
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Ausgestellt
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Fällig
                    </th>

                    <th className="px-5 py-3 text-right font-semibold">
                      Gesamt
                    </th>

                    <th className="px-5 py-3 text-right font-semibold">
                      Offen
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right font-semibold">
                      Aktion
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {invoices.map(
                    (invoice) => (
                      <tr
                        key={
                          invoice.id
                        }
                        className="transition hover:bg-slate-800/40"
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-100">
                            {
                              invoice.invoiceNumber
                            }
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-200">
                            {
                              invoice.recipientName
                            }
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {
                              invoice.recipientMembershipNumber
                            }
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-300">
                          {formatDate(
                            invoice.issueDate,
                          )}
                        </td>

                        <td className="px-5 py-4 text-slate-300">
                          {formatDate(
                            invoice.dueDate,
                          )}
                        </td>

                        <td className="px-5 py-4 text-right font-medium text-slate-200">
                          {formatEuroAmount(
                            invoice.totalCents,
                          )}
                        </td>

                        <td className="px-5 py-4 text-right font-medium text-slate-200">
                          {formatEuroAmount(
                            invoice.openCents,
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                              invoiceStatusClasses[
                                invoice
                                  .status
                              ]
                            }`}
                          >
                            {
                              invoiceStatusLabels[
                                invoice
                                  .status
                              ]
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/admin/rechnungen/${invoice.id}`}
                            className="inline-flex rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-blue-500 hover:bg-blue-950/30 hover:text-blue-200"
                          >
                            Öffnen
                          </Link>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SuccessMessage({
  message,
  examined,
  created,
  skipped,
  failed,
}: {
  message: string;
  examined?: string;
  created?: string;
  skipped?: string;
  failed?: string;
}) {
  return (
    <div className="mb-6 rounded-xl border border-emerald-800 bg-emerald-950/40 p-4 text-sm text-emerald-100">
      <strong className="block font-semibold">
        {message}
      </strong>

      <div className="mt-3 grid gap-2 text-emerald-200 sm:grid-cols-4">
        <span>
          Geprüft:{" "}
          <strong>
            {examined ?? "0"}
          </strong>
        </span>

        <span>
          Erstellt:{" "}
          <strong>
            {created ?? "0"}
          </strong>
        </span>

        <span>
          Übersprungen:{" "}
          <strong>
            {skipped ?? "0"}
          </strong>
        </span>

        <span>
          Fehler:{" "}
          <strong>
            {failed ?? "0"}
          </strong>
        </span>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="text-sm text-slate-400">
        {label}
      </div>

      <div className="mt-2 text-2xl font-bold tracking-tight text-slate-100">
        {value}
      </div>
    </div>
  );
}

function parseSelectedYear(
  value: string | undefined,
  fallback: number,
): number {
  const parsed =
    Number.parseInt(
      value ?? "",
      10,
    );

  if (
    !Number.isInteger(parsed) ||
    parsed < 2_000 ||
    parsed > 9_999
  ) {
    return fallback;
  }

  return parsed;
}

function parseSelectedMonth(
  value: string | undefined,
  fallback: number,
): number {
  const parsed =
    Number.parseInt(
      value ?? "",
      10,
    );

  if (
    !Number.isInteger(parsed) ||
    parsed < 1 ||
    parsed > 12
  ) {
    return fallback;
  }

  return parsed;
}

function createYearOptions(
  selectedYear: number,
): number[] {
  const currentYear =
    new Date().getFullYear();

  const years = new Set<number>([
    currentYear - 1,
    currentYear,
    currentYear + 1,
    selectedYear,
  ]);

  return [...years].sort(
    (first, second) =>
      second - first,
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