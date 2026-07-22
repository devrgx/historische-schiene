import type { LucideIcon } from "lucide-react";

type ParticipationCardProps = {
  title: string;
  description: string;
  examples: string[];
  icon: LucideIcon;
};

export function ParticipationCard({
  title,
  description,
  examples,
  icon: Icon,
}: ParticipationCardProps) {
  return (
    <article className="surface-card p-7 transition duration-300 hover:-translate-y-1 hover:border-accent-border hover:bg-surface-hover">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
        <Icon size={24} />
      </div>

      <h3 className="mt-6 text-xl font-bold text-content">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-muted">
        {description}
      </p>

      <ul className="mt-6 space-y-3 border-t border-line pt-5">
        {examples.map((example) => (
          <li
            key={example}
            className="flex gap-3 text-sm leading-6 text-subtle"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {example}
          </li>
        ))}
      </ul>
    </article>
  );
}