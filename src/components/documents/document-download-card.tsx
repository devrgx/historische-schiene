import {
  ArrowDownToLine,
  ArrowUpRight,
  File,
  FileText,
  LockKeyhole,
} from "lucide-react";

import type { PublicDocument } from "@/data/documents";

type DocumentDownloadCardProps = {
  document: PublicDocument;
};

export function DocumentDownloadCard({
  document,
}: DocumentDownloadCardProps) {
  const FileIcon =
    document.fileType === "PDF" ? FileText : File;

  return (
    <article
      className={`surface-card flex h-full flex-col p-6 transition duration-300 sm:p-7 ${
        document.available
          ? "hover:-translate-y-1 hover:border-accent-border hover:bg-surface-hover"
          : "opacity-80"
      }`}
    >
      <div className="flex items-start justify-between gap-5">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            document.available
              ? "bg-accent-soft text-accent-light"
              : "bg-white/5 text-subtle"
          }`}
        >
          {document.available ? (
            <FileIcon size={23} />
          ) : (
            <LockKeyhole size={22} />
          )}
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
            document.available
              ? "border-accent-border bg-accent-soft text-accent-light"
              : "border-line bg-white/5 text-subtle"
          }`}
        >
          {document.fileType}
        </span>
      </div>

      <h3 className="mt-6 text-xl font-bold text-content">
        {document.title}
      </h3>

      <p className="mt-3 flex-1 leading-7 text-muted">
        {document.description}
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm">
        <div>
          <dt className="text-subtle">Version</dt>
          <dd className="mt-1 font-medium text-content">
            {document.version ?? "Noch offen"}
          </dd>
        </div>

        <div>
          <dt className="text-subtle">Dateigröße</dt>
          <dd className="mt-1 font-medium text-content">
            {document.fileSize ?? "–"}
          </dd>
        </div>
      </dl>

      {document.available && document.fileUrl ? (
        <a
          href={document.fileUrl}
          target={document.external ? "_blank" : undefined}
          rel={
            document.external
              ? "noopener noreferrer"
              : undefined
          }
          download={document.external ? undefined : true}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-light"
        >
          {document.external ? (
            <>
              Dokument öffnen
              <ArrowUpRight size={17} />
            </>
          ) : (
            <>
              Herunterladen
              <ArrowDownToLine size={17} />
            </>
          )}
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="mt-6 inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-surface-elevated px-5 py-3 text-sm font-semibold text-subtle"
        >
          <LockKeyhole size={16} />
          Noch nicht verfügbar
        </button>
      )}
    </article>
  );
}