import type { ReactNode } from "react";

type LegalSectionProps = {
  id?: string;
  title: string;
  children: ReactNode;
};

export function LegalSection({
  id,
  title,
  children,
}: LegalSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-28 border-b border-line pb-10 last:border-b-0 last:pb-0"
    >
      <h2 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
        {title}
      </h2>

      <div className="mt-5 space-y-4 leading-8 text-muted">
        {children}
      </div>
    </section>
  );
}