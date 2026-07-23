import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CircleAlert, LockKeyhole, Mail } from "lucide-react";

import { PortalShell } from "@/components/portal/portal-shell";
import { authenticateUser, createSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Anmelden",
};

type PortalLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function PortalLoginPage({
  searchParams,
}: PortalLoginPageProps) {
  const { error } = await searchParams;

  async function loginAction(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const user = await authenticateUser(email, password);

    if (!user) {
      redirect("/portal/login?error=invalid-credentials");
    }

    await createSession(user.id);

    const isAdmin = user.roleKeys.includes("ADMIN");

    redirect(isAdmin ? "/admin/" : "/portal/app");
  }

  return (
    <PortalShell
      title="Im Mitgliederportal anmelden"
      description="Melde dich mit der E-Mail-Adresse und dem Passwort deines Vereinskontos an."
    >
      <form
        action={loginAction}
        className="surface-card mx-auto max-w-xl p-7 sm:p-9"
      >
        {error === "invalid-credentials" ? (
          <div
            role="alert"
            className="mb-6 flex gap-3 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200"
          >
            <CircleAlert size={19} className="mt-0.5 shrink-0" />

            <p>
              Die E-Mail-Adresse oder das Passwort ist falsch. Das Konto muss
              außerdem aktiviert sein.
            </p>
          </div>
        ) : null}

        <div>
          <label
            htmlFor="login-email"
            className="text-sm font-semibold text-content"
          >
            E-Mail-Adresse
          </label>

          <div className="relative mt-2">
            <Mail
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
            />

            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@beispiel.de"
              required
              className="w-full rounded-xl border border-line bg-page-soft py-3 pl-12 pr-4 text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
            />
          </div>
        </div>

        <div className="mt-6">
          <label
            htmlFor="login-password"
            className="text-sm font-semibold text-content"
          >
            Passwort
          </label>

          <div className="relative mt-2">
            <LockKeyhole
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
            />

            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Dein Passwort"
              required
              minLength={8}
              className="w-full rounded-xl border border-line bg-page-soft py-3 pl-12 pr-4 text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-7 inline-flex w-full items-center justify-center rounded-lg bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent-soft"
        >
          Anmelden
        </button>

        <p className="mt-6 text-center text-sm text-muted">
          Noch nicht registriert?{" "}
          <Link
            href="/portal/registrieren"
            className="font-semibold text-content transition hover:text-accent-light"
          >
            Konto aktivieren
          </Link>
        </p>
      </form>
    </PortalShell>
  );
}