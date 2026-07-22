import {
  ArrowRight,
  Check,
  Handshake,
} from "lucide-react";

import type { CooperationOpportunity } from "@/data/partners";

type CooperationCardProps = {
  cooperation: CooperationOpportunity;
};

export function CooperationCard({
  cooperation,
}: CooperationCardProps) {
  const mailtoUrl = `mailto:partner@historische-schiene.de?subject=${encodeURIComponent(
    cooperation.emailSubject,
  )}`;

  return (
    <article className="surface-card flex h-full flex-col p-6 transition duration-300 hover:-translate-y-1 hover:border-accent-border hover:bg-surface-hover sm:p-7">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
        <Handshake size={23} />
      </div>

      <h3 className="mt-6 text-2xl font-bold text-content">
        {cooperation.title}
      </h3>

      <p className="mt-4 leading-7 text-muted">
        {cooperation.description}
      </p>

      <ul className="mt-6 flex-1 space-y-3">
        {cooperation.examples.map((example) => (
          <li
            key={example}
            className="flex items-start gap-3 text-sm leading-6 text-muted"
          >
            <Check
              size={17}
              className="mt-1 shrink-0 text-accent-light"
            />

            <span>{example}</span>
          </li>
        ))}
      </ul>

      <a
        href={mailtoUrl}
        className="group mt-7 inline-flex items-center gap-2 border-t border-line pt-5 text-sm font-semibold text-content transition hover:text-accent-light"
      >
        Zusammenarbeit anfragen

        <ArrowRight
          size={17}
          className="transition group-hover:translate-x-1"
        />
      </a>
    </article>
  );
}