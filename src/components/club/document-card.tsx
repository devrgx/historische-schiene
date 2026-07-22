import {
  ArrowUpRight,
  FileText,
  LockKeyhole,
} from "lucide-react";
import Link from "next/link";

type DocumentCardProps = {
  title: string;
  description: string;
  href?: string;
  available?: boolean;
};

export function DocumentCard({
  title,
  description,
  href,
  available = false,
}: DocumentCardProps) {
  const content = (
    <>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
        {available ? (
          <FileText size={22} />
        ) : (
          <LockKeyhole size={21} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-content">
            {title}
          </h3>

          {available ? (
            <ArrowUpRight
              size={18}
              className="shrink-0 text-subtle transition group-hover:text-accent-light"
            />
          ) : null}
        </div>

        <p className="mt-2 text-sm leading-7 text-muted">
          {description}
        </p>

        {!available ? (
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
            Noch nicht veröffentlicht
          </p>
        ) : null}
      </div>
    </>
  );

  if (available && href) {
    return (
      <Link
        href={href}
        className="group surface-card flex gap-4 p-5 transition duration-300 hover:border-accent-border hover:bg-surface-hover"
      >
        {content}
      </Link>
    );
  }

  return (
    <article className="surface-card flex gap-4 p-5 opacity-80">
      {content}
    </article>
  );
}