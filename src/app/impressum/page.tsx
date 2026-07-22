import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Impressum",
};

export default function ImpressumPage() {
  return (
    <>
      <PageHeader
        title="Impressum"
        description="Anbieterkennzeichnung und rechtliche Informationen."
      />

      <section className="section-spacing">
        <div className="site-container">
          <div className="surface-card max-w-3xl p-7 text-muted">
            <p>Die vollständigen Angaben werden vor Veröffentlichung ergänzt.</p>
          </div>
        </div>
      </section>
    </>
  );
}