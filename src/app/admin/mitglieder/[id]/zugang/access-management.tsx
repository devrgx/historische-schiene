"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CircleAlert,
  Clipboard,
  KeyRound,
  MailCheck,
  MailWarning,
  RefreshCw,
  ShieldOff,
} from "lucide-react";

export type AccessActionState = {
  status: "IDLE" | "SUCCESS" | "ERROR";
  message?: string;

  activationCode?: string;
  expiresAt?: string;

  mailStatus?: "SENT" | "FAILED";
  mailMessage?: string;
};

type AccessManagementProps = {
  prepareAction: (
    previousState: AccessActionState,
    formData: FormData,
  ) => Promise<AccessActionState>;

  revokeAction: (
    previousState: AccessActionState,
    formData: FormData,
  ) => Promise<AccessActionState>;

  hasUserAccount: boolean;
  hasActiveActivationCode: boolean;
};

const initialState: AccessActionState = {
  status: "IDLE",
};

export function AccessManagement({
  prepareAction,
  revokeAction,
  hasUserAccount,
  hasActiveActivationCode,
}: AccessManagementProps) {
  const router = useRouter();

  const [
    prepareState,
    prepareFormAction,
    preparePending,
  ] = useActionState(
    prepareAction,
    initialState,
  );

  const [
    revokeState,
    revokeFormAction,
    revokePending,
  ] = useActionState(
    revokeAction,
    initialState,
  );

  const [codeCopied, setCodeCopied] =
    useState(false);

  useEffect(() => {
    if (
      prepareState.status === "SUCCESS" ||
      revokeState.status === "SUCCESS"
    ) {
      router.refresh();
    }
  }, [
    prepareState.status,
    revokeState.status,
    router,
  ]);

  async function copyActivationCode(): Promise<void> {
    if (!prepareState.activationCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        prepareState.activationCode,
      );

      setCodeCopied(true);

      window.setTimeout(() => {
        setCodeCopied(false);
      }, 2_000);
    } catch {
      setCodeCopied(false);
    }
  }

  return (
    <div className="space-y-5">
      {prepareState.status === "ERROR" ? (
        <MessageBox
          type="error"
          message={
            prepareState.message ??
            "Der Portalzugang konnte nicht vorbereitet werden."
          }
        />
      ) : null}

      {revokeState.status === "ERROR" ? (
        <MessageBox
          type="error"
          message={
            revokeState.message ??
            "Der Aktivierungscode konnte nicht widerrufen werden."
          }
        />
      ) : null}

      {revokeState.status === "SUCCESS" ? (
        <MessageBox
          type="success"
          message={
            revokeState.message ??
            "Die Aktivierungscodes wurden widerrufen."
          }
        />
      ) : null}

      {prepareState.status === "SUCCESS" &&
      prepareState.activationCode ? (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-200">
              <KeyRound size={20} />
            </span>

            <div>
              <h2 className="font-bold text-content">
                Aktivierungscode erstellt
              </h2>

              <p className="mt-1 text-sm leading-6 text-muted">
                Dieser Code wird nur jetzt vollständig angezeigt.
                Speichere ihn bei Bedarf, bevor du die Seite
                verlässt.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-emerald-400/25 bg-page-soft p-5">
            <p className="text-center font-mono text-3xl font-bold tracking-[0.22em] text-content">
              {prepareState.activationCode}
            </p>

            {prepareState.expiresAt ? (
              <p className="mt-3 text-center text-xs text-muted">
                Gültig bis{" "}
                {formatDateTime(
                  prepareState.expiresAt,
                )}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={copyActivationCode}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/30 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/10"
          >
            {codeCopied ? (
              <Check size={17} />
            ) : (
              <Clipboard size={17} />
            )}

            {codeCopied
              ? "Code kopiert"
              : "Code kopieren"}
          </button>

          {prepareState.mailStatus === "SENT" ? (
            <div className="mt-4 flex gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-4">
              <MailCheck
                size={20}
                className="mt-0.5 shrink-0 text-emerald-200"
              />

              <div>
                <p className="text-sm font-semibold text-content">
                  Begrüßungsmail versendet
                </p>

                <p className="mt-1 text-xs leading-5 text-muted">
                  {prepareState.mailMessage ??
                    "Die Aktivierungsmail wurde erfolgreich an das Mitglied versendet."}
                </p>
              </div>
            </div>
          ) : null}

          {prepareState.mailStatus === "FAILED" ? (
            <div
              role="alert"
              className="mt-4 flex gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4"
            >
              <MailWarning
                size={20}
                className="mt-0.5 shrink-0 text-amber-200"
              />

              <div>
                <p className="text-sm font-semibold text-content">
                  E-Mail-Versand fehlgeschlagen
                </p>

                <p className="mt-1 text-xs leading-5 text-muted">
                  {prepareState.mailMessage ??
                    "Der Portalzugang wurde angelegt, die Begrüßungsmail konnte aber nicht versendet werden."}
                </p>

                <p className="mt-2 text-xs leading-5 text-muted">
                  Der angezeigte Aktivierungscode ist trotzdem
                  gültig.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="font-bold text-content">
          Portalzugang vorbereiten
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted">
          Dabei werden das Benutzerkonto und die Mitgliedsrolle
          vorbereitet. Anschließend werden ein neuer
          Aktivierungscode und die Begrüßungsmail erzeugt.
        </p>

        {hasActiveActivationCode ? (
          <div className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4">
            <p className="text-sm font-semibold text-content">
              Bereits aktiver Code vorhanden
            </p>

            <p className="mt-1 text-xs leading-5 text-muted">
              Beim Erzeugen eines neuen Codes werden alle bisherigen
              ungenutzten Aktivierungscodes automatisch widerrufen.
            </p>
          </div>
        ) : null}

        <form
          action={prepareFormAction}
          className="mt-5"
        >
          <button
            type="submit"
            disabled={preparePending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-wait disabled:opacity-60"
          >
            {preparePending ? (
              <RefreshCw
                size={17}
                className="animate-spin"
              />
            ) : (
              <KeyRound size={17} />
            )}

            {preparePending
              ? "Zugang wird vorbereitet …"
              : hasUserAccount
                ? "Neuen Code erzeugen und senden"
                : "Portalzugang vorbereiten"}
          </button>
        </form>

        {hasActiveActivationCode ? (
          <form
            action={revokeFormAction}
            className="mt-3"
          >
            <button
              type="submit"
              disabled={revokePending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100 transition hover:border-red-400/50 hover:bg-red-400/20 disabled:cursor-wait disabled:opacity-60"
            >
              {revokePending ? (
                <RefreshCw
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <ShieldOff size={17} />
              )}

              {revokePending
                ? "Codes werden widerrufen …"
                : "Aktive Codes widerrufen"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

type MessageBoxProps = {
  type: "success" | "error";
  message: string;
};

function MessageBox({
  type,
  message,
}: MessageBoxProps) {
  const isError = type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={[
        "flex gap-3 rounded-2xl border p-4 text-sm",
        isError
          ? "border-red-400/30 bg-red-400/10 text-red-100"
          : "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
      ].join(" ")}
    >
      {isError ? (
        <CircleAlert
          size={19}
          className="mt-0.5 shrink-0"
        />
      ) : (
        <Check
          size={19}
          className="mt-0.5 shrink-0"
        />
      )}

      <p className="leading-6">
        {message}
      </p>
    </div>
  );
}

function formatDateTime(
  value: string,
): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(new Date(value));
}