import "server-only";

export type PortalActivationMailInput = {
  firstName: string;
  lastName: string;
  membershipNumber: string;
  activationCode: string;
  expiresAt: Date;
};

export type PortalActivationMail = {
  subject: string;
  text: string;
  html: string;
};

export function createPortalActivationMail(
  input: PortalActivationMailInput,
): PortalActivationMail {
  const activationUrl = createActivationUrl(input.activationCode);
  const membershipContact = getMembershipContact();

  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const formattedExpiration = formatDateTime(input.expiresAt);

  const subject =
    "Willkommen bei Historische Schiene – Portalzugang aktivieren";

  const text = [
    `Hallo ${input.firstName},`,
    "",
    "herzlich willkommen bei Historische Schiene!",
    "",
    "Dein Mitgliedsantrag wurde genehmigt und dein Zugang zu unserem Mitgliederportal wurde vorbereitet.",
    "",
    `Mitgliedsnummer: ${input.membershipNumber}`,
    `Aktivierungscode: ${input.activationCode}`,
    "",
    `Der Aktivierungscode ist gültig bis ${formattedExpiration}.`,
    "",
    "Öffne zur Aktivierung folgende Seite:",
    activationUrl,
    "",
    "Für die Aktivierung benötigst du:",
    "- deine Mitgliedsnummer",
    "- deine Postleitzahl",
    "- dein Geburtsdatum",
    "- den Aktivierungscode",
    "",
    `Falls dein Aktivierungscode bereits abgelaufen ist oder nicht funktioniert, melde dich bitte unter ${membershipContact}. Wir erstellen dir anschließend einen neuen Code.`,
    "",
    "Viele Grüße",
    "",
    "Historische Schiene",
    "Der Vorstand",
  ].join("\n");

  const html = `
<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(subject)}</title>
  </head>

  <body style="margin:0;padding:0;background:#0b1020;color:#e8edf7;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      Dein Aktivierungscode für das Mitgliederportal lautet ${escapeHtml(
        input.activationCode,
      )}.
    </div>

    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      style="width:100%;background:#0b1020;padding:32px 16px;"
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            style="width:100%;max-width:640px;background:#141b2d;border:1px solid #27324a;border-radius:18px;overflow:hidden;"
          >
            <tr>
              <td style="padding:30px 32px;background:#19233b;border-bottom:1px solid #27324a;">
                <div style="font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#8fb4ff;">
                  Historische Schiene
                </div>

                <h1 style="margin:10px 0 0;font-size:28px;line-height:1.25;color:#ffffff;">
                  Willkommen im Mitgliederportal
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:32px;">
                <p style="margin:0;font-size:17px;line-height:1.7;color:#e8edf7;">
                  Hallo ${escapeHtml(input.firstName)},
                </p>

                <p style="margin:18px 0 0;font-size:16px;line-height:1.7;color:#b9c4d8;">
                  herzlich willkommen bei Historische Schiene!
                  Dein Mitgliedsantrag wurde genehmigt und dein
                  Zugang zu unserem Mitgliederportal wurde vorbereitet.
                </p>

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  style="width:100%;margin-top:26px;background:#0f1627;border:1px solid #2e3d5c;border-radius:14px;"
                >
                  <tr>
                    <td style="padding:22px;">
                      <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#8291aa;">
                        Mitgliedsnummer
                      </div>

                      <div style="margin-top:8px;font-size:20px;font-weight:700;color:#ffffff;">
                        ${escapeHtml(input.membershipNumber)}
                      </div>
                    </td>
                  </tr>
                </table>

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  style="width:100%;margin-top:16px;background:#112b25;border:1px solid #2d6b5d;border-radius:14px;"
                >
                  <tr>
                    <td align="center" style="padding:26px 20px;">
                      <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#8ee1c8;">
                        Aktivierungscode
                      </div>

                      <div style="margin-top:12px;font-family:'Courier New',Courier,monospace;font-size:34px;font-weight:700;letter-spacing:0.18em;color:#ffffff;">
                        ${escapeHtml(input.activationCode)}
                      </div>

                      <div style="margin-top:12px;font-size:13px;line-height:1.6;color:#a7cabf;">
                        Gültig bis ${escapeHtml(formattedExpiration)}
                      </div>
                    </td>
                  </tr>
                </table>

                <div style="margin-top:28px;text-align:center;">
                  <a
                    href="${escapeHtml(activationUrl)}"
                    style="display:inline-block;background:#496ee8;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 24px;border-radius:10px;"
                  >
                    Mitgliedskonto aktivieren
                  </a>
                </div>

                <div style="margin-top:30px;padding:20px;background:#0f1627;border:1px solid #27324a;border-radius:14px;">
                  <div style="font-size:14px;font-weight:700;color:#ffffff;">
                    Für die Aktivierung benötigst du:
                  </div>

                  <ul style="margin:12px 0 0;padding-left:22px;color:#b9c4d8;font-size:14px;line-height:1.8;">
                    <li>deine Mitgliedsnummer</li>
                    <li>deine Postleitzahl</li>
                    <li>dein Geburtsdatum</li>
                    <li>den Aktivierungscode</li>
                  </ul>
                </div>

                <div style="margin-top:20px;padding:18px;background:#2a2110;border:1px solid #6e5721;border-radius:14px;">
                  <div style="font-size:14px;font-weight:700;color:#ffe7a3;">
                    Code abgelaufen oder funktioniert nicht?
                  </div>

                  <p style="margin:8px 0 0;font-size:14px;line-height:1.7;color:#d8c99f;">
                    Melde dich bitte unter
                    <a
                      href="mailto:${escapeHtml(membershipContact)}"
                      style="color:#ffe7a3;text-decoration:underline;"
                    >
                      ${escapeHtml(membershipContact)}
                    </a>.
                    Wir erstellen dir anschließend einen neuen Aktivierungscode.
                  </p>
                </div>

                <p style="margin:28px 0 0;font-size:15px;line-height:1.7;color:#b9c4d8;">
                  Falls der Button nicht funktioniert, kannst du diese
                  Adresse in deinen Browser kopieren:
                </p>

                <p style="margin:8px 0 0;font-size:13px;line-height:1.6;word-break:break-all;color:#8fb4ff;">
                  ${escapeHtml(activationUrl)}
                </p>

                <p style="margin:30px 0 0;font-size:15px;line-height:1.7;color:#b9c4d8;">
                  Viele Grüße<br>
                  <strong style="color:#ffffff;">
                    Historische Schiene
                  </strong><br>
                  Der Vorstand
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 32px;background:#101728;border-top:1px solid #27324a;">
                <p style="margin:0;text-align:center;font-size:12px;line-height:1.6;color:#76849d;">
                  Diese Nachricht wurde automatisch für ${escapeHtml(
                    fullName,
                  )} erstellt.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  return {
    subject,
    text,
    html,
  };
}

function createActivationUrl(
  activationCode: string,
): string {
  const appUrl = process.env.APP_URL?.trim();

  if (!appUrl) {
    throw new Error(
      "Die Umgebungsvariable APP_URL ist nicht gesetzt.",
    );
  }

  const url = new URL(
    "/portal/registrieren",
    ensureTrailingSlash(appUrl),
  );

  url.searchParams.set(
    "code",
    activationCode,
  );

  return url.toString();
}

function getMembershipContact(): string {
  return (
    process.env.MAIL_MEMBERSHIP_CONTACT?.trim() ||
    process.env.MAIL_REPLY_TO?.trim() ||
    "mitglied-werden@historische-schiene.de"
  );
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(date);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
