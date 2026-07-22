import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Kontakt",
};

export default function KontaktPage() {
  return (
    <PageHeader
      eyebrow="Wir freuen uns auf deine Nachricht"
      title="Kontakt"
      description="Hier findest du künftig unsere Kontaktmöglichkeiten und die passenden Ansprechpersonen für dein Anliegen."
    />
  );
}