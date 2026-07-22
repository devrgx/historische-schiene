import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Mitmachen",
};

export default function MitmachenPage() {
  return (
    <PageHeader
      eyebrow="Gemeinsam aktiv"
      title="Mitmachen und unterstützen"
      description="Werde Mitglied, unterstütze unsere Projekte oder bringe dich mit deinen Fähigkeiten aktiv in den Verein ein."
    />
  );
}