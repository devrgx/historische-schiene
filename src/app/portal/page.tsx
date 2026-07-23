import type { Metadata } from "next";
import {
  ClipboardList,
  LogIn,
  UserRoundPlus,
} from "lucide-react";

import { PortalCard } from "@/components/portal/portal-card";
import { PortalShell } from "@/components/portal/portal-shell";

export const metadata: Metadata = {
  title: "Mitgliederportal",
  description:
    "Anmeldung, Registrierung und Mitgliedsantrag der Historischen Schiene.",
};

export default function PortalPage() {
  return (
    <PortalShell
      title="Willkommen im Mitgliederportal"
      description="Hier können Mitglieder ihr Konto aktivieren, sich anmelden und später Mitgliedsdaten, Dokumente, Rechnungen und Vereinsinformationen verwalten."
    >
      <div className="grid gap-6 md:grid-cols-3">
        <PortalCard
          title="Anmelden"
          description="Für Mitglieder, die ihr Benutzerkonto bereits aktiviert und ein Passwort festgelegt haben."
          href="/portal/login"
          label="Zum Login"
          icon={LogIn}
        />

        <PortalCard
          title="Konto aktivieren"
          description="Nach der Genehmigung deines Mitgliedsantrags kannst du hier deinen persönlichen Portalzugang einrichten."
          href="/portal/registrieren"
          label="Konto registrieren"
          icon={UserRoundPlus}
        />

        <PortalCard
          title="Mitglied werden"
          description="Noch kein Mitglied? Stelle zunächst einen digitalen Mitgliedsantrag."
          href="/mitmachen/antrag"
          label="Zum Mitgliedsantrag"
          icon={ClipboardList}
        />
      </div>
    </PortalShell>
  );
}