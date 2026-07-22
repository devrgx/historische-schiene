import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Projekte",
};

export default function ProjektePage() {
  return (
    <PageHeader
      eyebrow="Fahrzeuge und Vorhaben"
      title="Unsere Projekte"
      description="Hier stellen wir aktuelle, geplante und bereits abgeschlossene Projekte der Historischen Schiene vor."
    />
  );
}