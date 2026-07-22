import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Sonderfahrten",
};

export default function SonderfahrtenPage() {
  return (
    <PageHeader
      eyebrow="Unterwegs mit Geschichte"
      title="Sonderfahrten und Veranstaltungen"
      description="Hier werden künftig unsere Sonderfahrten, Veranstaltungen, Fahrpläne und Buchungsmöglichkeiten veröffentlicht."
    />
  );
}