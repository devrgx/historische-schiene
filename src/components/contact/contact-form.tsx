"use client";

import {
  CircleAlert,
  Send,
} from "lucide-react";
import { useState } from "react";

const subjects = [
  "Allgemeine Anfrage",
  "Mitgliedschaft",
  "Fahrzeugprojekt",
  "Sonderfahrt oder Veranstaltung",
  "Presse und Öffentlichkeitsarbeit",
  "Partnerschaft oder Kooperation",
  "Datenschutz",
  "Sonstiges",
];

export function ContactForm() {
  const [subject, setSubject] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
      className="surface-card p-7 sm:p-9"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-first-name"
            className="text-sm font-semibold text-content"
          >
            Vorname
          </label>

          <input
            id="contact-first-name"
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="Vorname"
            className="mt-2 w-full rounded-xl border border-line bg-page-soft px-4 py-3 text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
          />
        </div>

        <div>
          <label
            htmlFor="contact-last-name"
            className="text-sm font-semibold text-content"
          >
            Nachname
          </label>

          <input
            id="contact-last-name"
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Nachname"
            className="mt-2 w-full rounded-xl border border-line bg-page-soft px-4 py-3 text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
          />
        </div>
      </div>

      <div className="mt-6">
        <label
          htmlFor="contact-email"
          className="text-sm font-semibold text-content"
        >
          E-Mail-Adresse
        </label>

        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@beispiel.de"
          className="mt-2 w-full rounded-xl border border-line bg-page-soft px-4 py-3 text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
        />
      </div>

      <div className="mt-6">
        <label
          htmlFor="contact-subject"
          className="text-sm font-semibold text-content"
        >
          Anliegen
        </label>

        <select
          id="contact-subject"
          name="subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className="mt-2 w-full rounded-xl border border-line bg-page-soft px-4 py-3 text-content outline-none transition focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
        >
          <option value="">
            Bitte auswählen
          </option>

          {subjects.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <label
          htmlFor="contact-message"
          className="text-sm font-semibold text-content"
        >
          Nachricht
        </label>

        <textarea
          id="contact-message"
          name="message"
          rows={8}
          placeholder="Wie können wir helfen?"
          className="mt-2 w-full resize-y rounded-xl border border-line bg-page-soft px-4 py-3 leading-7 text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent-soft"
        />
      </div>

      <div className="mt-6 flex items-start gap-3">
        <input
          id="contact-privacy"
          name="privacy"
          type="checkbox"
          disabled
          className="mt-1 h-4 w-4 rounded border-line bg-page-soft"
        />

        <label
          htmlFor="contact-privacy"
          className="text-sm leading-6 text-muted"
        >
          Ich habe die Datenschutzerklärung gelesen und stimme der
          Verarbeitung meiner Angaben zur Bearbeitung meiner Anfrage zu.
        </label>
      </div>

      <div className="mt-7 flex gap-4 rounded-2xl border border-accent-border bg-accent-soft p-5">
        <CircleAlert
          size={21}
          className="mt-0.5 shrink-0 text-accent-light"
        />

        <div>
          <p className="font-semibold text-content">
            Kontaktformular noch nicht aktiv
          </p>

          <p className="mt-2 text-sm leading-7 text-muted">
            Das Formular ist bereits vorbereitet, versendet derzeit aber noch
            keine Nachrichten. Bitte nutze vorerst eine der angegebenen
            E-Mail-Adressen.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled
        className="mt-7 inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-surface-elevated px-6 py-3 text-sm font-semibold text-subtle"
      >
        <Send size={17} />
        Nachricht senden
      </button>
    </form>
  );
}