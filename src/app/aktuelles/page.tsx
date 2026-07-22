import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Aktuelles",
};

export default function AktuellesPage() {
  return (
    <PageHeader
      eyebrow="Neuigkeiten"
      title="Aktuelles aus dem Verein"
      description="Berichte über unsere Projekte, Veranstaltungen und die Entwicklung der Historischen Schiene."
    />
  );
}