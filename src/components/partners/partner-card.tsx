import {
  ArrowUpRight,
  Building2,
  Globe2,
  Handshake,
} from "lucide-react";

import {
  partnerCategoryLabels,
  partnerStatusLabels,
  type Partner,
} from "@/data/partners";

type PartnerCardProps = {
  partner: Partner;
};

export function PartnerCard({
  partner,
}: PartnerCardProps) {
  return (
    <article className="group surface-card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-accent-border hover:bg-surface-hover">
      <div className="flex h-48 items-center justify-center border-b border-line bg-page-soft p-8">
        {partner.logoUrl ? (
          <img
            src={partner.logoUrl}
            alt={`Logo von ${partner.name}`}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-accent-border bg-accent-soft text-accent-light">
            <Building2
              size={42}
              strokeWidth={1.3}
            />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-accent-border bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-light">
            {partnerCategoryLabels[partner.category]}
          </span>

          <span className="rounded-full border border-line bg-page-soft px-3 py-1 text-xs font-medium text-muted">
            {partnerStatusLabels[partner.status]}
          </span>
        </div>

        <h2 className="mt-6 text-2xl font-bold text-content">
          {partner.name}
        </h2>

        {partner.shortName ? (
          <p className="mt-1 text-sm font-medium text-accent-light">
            {partner.shortName}
          </p>
        ) : null}

        <p className="mt-4 flex-1 leading-7 text-muted">
          {partner.description}
        </p>

        {partner.cooperationAreas.length > 0 ? (
          <div className="mt-6 border-t border-line pt-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-content">
              <Handshake size={17} />
              Zusammenarbeit
            </p>

            <ul className="mt-3 space-y-2 text-sm text-muted">
              {partner.cooperationAreas.map((area) => (
                <li
                  key={area}
                  className="flex items-start gap-2"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-light" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {partner.website ? (
          <a
            href={partner.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-between gap-3 border-t border-line pt-5 text-sm font-semibold text-content transition hover:text-accent-light"
          >
            <span className="flex items-center gap-2">
              <Globe2 size={17} />
              Website besuchen
            </span>

            <ArrowUpRight
              size={17}
              className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        ) : null}
      </div>
    </article>
  );
}