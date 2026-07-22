import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Verein",
};

export default function VereinPage() {
  return (
    <>
      <PageHeader
        eyebrow="Über uns"
        title="Historische Eisenbahn gemeinsam bewahren"
        description="Die Historische Schiene möchte Fahrzeuge, Geschichten und Erinnerungen aus dem regionalen Eisenbahnverkehr erhalten und öffentlich zugänglich machen."
      />

      <section className="section-spacing">
        <div className="site-container">
          <SectionHeading
            title="Unser Verein"
            description="Diese Seite wird später Informationen über unsere Ziele, unsere Geschichte, den Vorstand, die Satzung und unsere Partner enthalten."
          />
        </div>
      </section>
    </>
  );
}