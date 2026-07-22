import type { LucideIcon } from "lucide-react";

type ValueCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function ValueCard({
  title,
  description,
  icon: Icon,
}: ValueCardProps) {
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
    </article>
  );
}