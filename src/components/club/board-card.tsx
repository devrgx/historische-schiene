import { Mail, UserRound } from "lucide-react";

type BoardCardProps = {
  functionName: string;
  name?: string;
  description?: string;
  email?: string;
};

export function BoardCard({
  functionName,
  name = "Name folgt",
  description,
  email,
}: BoardCardProps) {
  return (
    <article className="surface-card flex h-full flex-col p-6 sm:p-7">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent-light">
        <UserRound size={27} />
      </div>

      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-accent-light">
        {functionName}
      </p>

      <h3 className="mt-2 text-2xl font-bold text-content">
        {name}
      </h3>

      {description ? (
        <p className="mt-4 flex-1 leading-7 text-muted">
          {description}
        </p>
      ) : null}

      {email ? (
        <a
          href={`mailto:${email}`}
          className="mt-6 inline-flex items-center gap-2 border-t border-line pt-5 text-sm font-medium text-muted transition hover:text-accent-light"
        >
          <Mail size={17} />
          {email}
        </a>
      ) : (
        <p className="mt-6 border-t border-line pt-5 text-sm text-subtle">
          Kontaktdaten folgen.
        </p>
      )}
    </article>
  );
}