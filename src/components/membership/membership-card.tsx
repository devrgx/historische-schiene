import {
  ArrowRight,
  BadgeCheck,
  CircleAlert,
  Euro,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

type MembershipCardProps = {
  title: string;
  price: string;
  priceDescription: string;
  description: string;
  features: string[];
  icon: LucideIcon;
  featured?: boolean;
  badge?: string;
};

export function MembershipCard({
  title,
  price,
  priceDescription,
  description,
  features,
  icon: Icon,
  featured = false,
  badge,
}: MembershipCardProps) {
  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-3xl border p-7 transition duration-300 hover:-translate-y-1 sm:p-8 ${
        featured
          ? "border-accent-border bg-accent-soft"
          : "border-line bg-surface hover:border-accent-border hover:bg-surface-hover"
      }`}
    >
      {badge ? (
        <span className="absolute right-5 top-5 rounded-full border border-accent-border bg-page px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent-light">
          {badge}
        </span>
      ) : null}

      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
          featured
            ? "bg-surface text-accent-light"
            : "bg-accent-soft text-accent-light"
        }`}
      >
        <Icon size={27} />
      </div>

      <h2 className="mt-7 text-2xl font-bold tracking-tight text-content">
        {title}
      </h2>

      <p className="mt-4 leading-7 text-muted">
        {description}
      </p>

      <div className="mt-7 flex items-end gap-2">
        <Euro
          size={23}
          className="mb-1 text-accent-light"
        />

        <span className="text-4xl font-bold text-content">
          {price}
        </span>

        <span className="mb-1 text-sm text-subtle">
          {priceDescription}
        </span>
      </div>

      <ul className="mt-7 flex-1 space-y-4">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex gap-3 text-sm leading-7 text-muted"
          >
            <BadgeCheck
              size={18}
              className="mt-1 shrink-0 text-accent-light"
            />

            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-8 border-t border-line pt-6">
        <Link
          href="#beitritt"
          className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition ${
            featured
              ? "bg-accent text-white hover:bg-accent-light"
              : "border border-accent-border bg-accent-soft text-accent-light hover:bg-accent hover:text-white"
          }`}
        >
          Mitgliedschaft auswählen
          <ArrowRight size={17} />
        </Link>
      </div>

      <div className="mt-5 flex gap-3 rounded-xl border border-line bg-black/10 p-4">
        <CircleAlert
          size={17}
          className="mt-0.5 shrink-0 text-subtle"
        />

        <p className="text-xs leading-6 text-subtle">
          Die genannten Beiträge entsprechen dem aktuellen Planungsstand und
          gelten erst nach wirksamer Beschlussfassung der Beitragsordnung.
        </p>
      </div>
    </article>
  );
}