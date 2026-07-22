export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
          Eisenbahngeschichte bewahren
        </p>

        <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl">
          Historische Schiene
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
          Wir bewahren Eisenbahngeschichte, historische Fahrzeuge und die
          Erinnerung an den regionalen Schienenverkehr.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="#verein"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
          >
            Verein kennenlernen
          </a>

          <a
            href="/portal"
            className="rounded-lg border border-neutral-700 px-6 py-3 font-semibold text-neutral-300 transition hover:border-neutral-500 hover:text-white"
          >
            Mitgliederportal
          </a>
        </div>
      </section>
    </main>
  );
}