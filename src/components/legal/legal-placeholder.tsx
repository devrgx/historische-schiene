import {
  CircleAlert,
  type LucideIcon,
} from "lucide-react";

type LegalPlaceholderProps = {
  title?: string;
  children: React.ReactNode;
  icon?: LucideIcon;
};

export function LegalPlaceholder({
  title = "Angabe noch ergänzen",
  children,
  icon: Icon = CircleAlert,
}: LegalPlaceholderProps) {
  return (
    <div className="flex gap-4 rounded-2xl border border-accent-border bg-accent-soft p-5">
      <Icon
        size={22}
        className="mt-0.5 shrink-0 text-accent-light"
      />

      <div>
        <p className="font-semibold text-content">
          {title}
        </p>

        <div className="mt-2 text-sm leading-7 text-muted">
          {children}
        </div>
      </div>
    </div>
  );
}