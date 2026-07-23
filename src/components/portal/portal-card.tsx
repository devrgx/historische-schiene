import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type PortalCardProps = {
  title: string;
  description: string;
  href: string;
  label: string;
  icon: LucideIcon;
};

export function PortalCard({
  title,
  description,
  href,
  label,
  icon: Icon,
}: PortalCardProps) {
  return (
    <article className="surface-card flex h-full flex-col p-7 transition duration-300 hover:-translate-y-1 hover:border-accent-border hover:bg-surface-hover">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
        <Icon size={24} />
      </div>

      <h2 className="mt-6 text-2xl font-bold text-content">
        {title}
      </h2>

      <p className="mt-4 flex-1 leading-7 text-muted">
        {description}
      </p>

      <Link
        href={href}
        className="mt-7 inline-flex items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-light"
      >
        {label}
      </Link>
    </article>
  );
}