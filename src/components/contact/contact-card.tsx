import {
  ArrowUpRight,
  Mail,
  type LucideIcon,
} from "lucide-react";

type ContactCardProps = {
  title: string;
  description: string;
  email: string;
  icon: LucideIcon;
  note?: string;
};

export function ContactCard({
  title,
  description,
  email,
  icon: Icon,
  note,
}: ContactCardProps) {
  return (
    <article className="surface-card flex h-full flex-col p-6 transition duration-300 hover:-translate-y-1 hover:border-accent-border hover:bg-surface-hover sm:p-7">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
        <Icon size={24} />
      </div>

      <h2 className="mt-6 text-xl font-bold text-content">
        {title}
      </h2>

      <p className="mt-3 flex-1 leading-7 text-muted">
        {description}
      </p>

      {note ? (
        <p className="mt-4 text-sm leading-6 text-subtle">
          {note}
        </p>
      ) : null}

      <a
        href={`mailto:${email}`}
        className="group mt-6 flex items-center justify-between gap-4 border-t border-line pt-5 text-sm font-semibold text-content transition hover:text-accent-light"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Mail size={17} className="shrink-0" />

          <span className="truncate">
            {email}
          </span>
        </span>

        <ArrowUpRight
          size={17}
          className="shrink-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </a>
    </article>
  );
}