import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Datenschutz",
};

export default function DatenschutzPage() {
  return (
    <>
      <PageHeader
        title="Datenschutzerklärung"
        description="Informationen zur Verarbeitung personenbezogener Daten."
      />

      <section className="section-spacing">
        <div className="site-container">
          <div className="surface-card max-w-3xl p-7 text-muted">
            <p>
              Die vollständige Datenschutzerklärung wird vor Veröffentlichung
              ergänzt.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}