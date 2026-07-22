import Link from "next/link";

export const metadata = {
  title: "Mitgliederportal",
};

export default function PortalPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <section className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center shadow-2xl sm:p-12">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 text-2xl text-blue-400">
          🚧
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
          In Vorbereitung
        </p>

        <h1 className="mt-4 text-4xl font-bold">
          Mitgliederportal
        </h1>

        <p className="mt-5 leading-7 text-neutral-300">
          Unser Mitgliederportal befindet sich derzeit im Aufbau. Künftig
          finden Mitglieder hier interne Neuigkeiten, Termine, Aktivitäten,
          Dokumente und ihre persönlichen Mitgliedsdaten.
        </p>

        <button
          type="button"
          disabled
          className="mt-8 cursor-not-allowed rounded-lg bg-neutral-800 px-6 py-3 font-semibold text-neutral-500"
        >
          Anmeldung noch nicht verfügbar
        </button>

        <div className="mt-8">
          <Link
            href="/"
            className="text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            Zurück zur Startseite
          </Link>
        </div>
      </section>
    </main>
  );
}