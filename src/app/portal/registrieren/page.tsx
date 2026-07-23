import type { Metadata } from "next";

import { PortalShell } from "@/components/portal/portal-shell";
import { formatPortalActivationCode } from "@/lib/portal-activation";

import { RegistrationForm } from "./registration-form";

export const metadata: Metadata = {
  title: "Konto aktivieren",
};

type PortalRegisterPageProps = {
  searchParams: Promise<{
    code?: string | string[];
  }>;
};

export default async function PortalRegisterPage({
  searchParams,
}: PortalRegisterPageProps) {
  const resolvedSearchParams =
    await searchParams;

  const codeParameter =
    getSingleSearchParameter(
      resolvedSearchParams.code,
    );

  const initialActivationCode =
    formatPortalActivationCode(
      codeParameter,
    );

  return (
    <PortalShell
      title="Mitgliedskonto aktivieren"
      description="Nach Genehmigung deines Mitgliedsantrags kannst du deinen Zugang anhand deiner Mitgliedsdaten aktivieren."
    >
      <RegistrationForm
        initialActivationCode={
          initialActivationCode
        }
      />
    </PortalShell>
  );
}

function getSingleSearchParameter(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}