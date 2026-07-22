import type { Metadata } from "next";
import {
  CircleAlert,
  FileArchive,
  FileCheck2,
  FolderOpen,
  ShieldCheck,
} from "lucide-react";

import { DocumentDownloadCard } from "@/components/documents/document-download-card";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  documentCategoryLabels,
  publicDocuments,
  type DocumentCategory,
} from "@/data/documents";

export const metadata: Metadata = {
  title: "Dokumente",
  description:
    "Öffentliche Satzungen, Ordnungen, Anträge, Presseunterlagen und weitere Dokumente der Historischen Schiene.",
};

const categoryOrder: DocumentCategory[] = [
  "association",
  "membership",
  "privacy",
  "travel",
  "press",
  "other",
];

export default function DokumentePage() {
  const availableDocuments = publicDocuments.filter(
    (document) => document.available,
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Informationen und Downloads"
        title="Dokumente"
        description="Hier stellen wir künftig Satzungen, Ordnungen, Mitgliedsunterlagen, Presseinformationen und weitere öffentliche Dokumente bereit."
      />

      <section className="border-b border-line bg-page-soft">
        <div className="site-container py-8">
          <div className="flex gap-4 rounded-2xl border border-accent-border bg-accent-soft p-5">
            <CircleAlert
              size={23}
              className="mt-0.5 shrink-0 text-accent-light"
            />

            <div>
              <h2 className="font-semibold text-content">
                Dokumente noch in Vorbereitung
              </h2>

              <p className="mt-2 text-sm leading-7 text-muted">
                Die Historische Schiene befindet sich derzeit in
                der Aufbau- und Gründungsphase. Satzung,
                Ordnungen und Anträge werden erst nach ihrer
                endgültigen Beschlussfassung veröffentlicht.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container">
          <div className="grid gap-6 sm:grid-cols-3">
            <article className="surface-card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
                <FileArchive size={22} />
              </div>

              <p className="mt-5 text-3xl font-bold text-content">
                {publicDocuments.length}
              </p>

              <p className="mt-2 text-sm text-muted">
                vorgesehene Dokumente
              </p>
            </article>

            <article className="surface-card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
                <FileCheck2 size={22} />
              </div>

              <p className="mt-5 text-3xl font-bold text-content">
                {availableDocuments}
              </p>

              <p className="mt-2 text-sm text-muted">
                bereits verfügbar
              </p>
            </article>

            <article className="surface-card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
                <ShieldCheck size={22} />
              </div>

              <p className="mt-5 text-3xl font-bold text-content">
                Öffentlich
              </p>

              <p className="mt-2 text-sm text-muted">
                frei zugängliche Unterlagen
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-page-soft">
        <div className="site-container section-spacing">
          <SectionHeading
            eyebrow="Dokumentenübersicht"
            title="Alle öffentlichen Unterlagen"
            description="Die Dokumente sind nach Themenbereichen sortiert. Nicht freigegebene Unterlagen werden bereits als Platzhalter angezeigt."
          />

          <div className="mt-14 space-y-16">
            {categoryOrder.map((category) => {
              const documents = publicDocuments.filter(
                (document) =>
                  document.category === category,
              );

              if (documents.length === 0) {
                return null;
              }

              return (
                <section key={category}>
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
                      <FolderOpen size={22} />
                    </span>

                    <div>
                      <h2 className="text-2xl font-bold text-content">
                        {documentCategoryLabels[category]}
                      </h2>

                      <p className="mt-1 text-sm text-subtle">
                        {documents.length}{" "}
                        {documents.length === 1
                          ? "Dokument"
                          : "Dokumente"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {documents.map((document) => (
                      <DocumentDownloadCard
                        key={document.id}
                        document={document}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container">
          <div className="rounded-3xl border border-accent-border bg-accent-soft p-8 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-accent-light">
                <ShieldCheck size={30} />
              </div>

              <div>
                <h2 className="text-3xl font-bold text-content">
                  Verbindlichkeit der Dokumente
                </h2>

                <p className="mt-4 max-w-4xl leading-8 text-muted">
                  Maßgeblich ist stets die jeweils beschlossene und
                  veröffentlichte Fassung. Entwürfe und
                  unveröffentlichte Platzhalter entfalten keine
                  rechtliche Wirkung.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}