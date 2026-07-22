import type { Metadata } from "next";
import {
  Building2,
  CircleAlert,
  Clock3,
  Handshake,
  Mail,
  MapPin,
  Megaphone,
  MessagesSquare,
  ShieldCheck,
  TrainFront,
  UserRoundPlus,
} from "lucide-react";

import { ContactCard } from "@/components/contact/contact-card";
import { ContactForm } from "@/components/contact/contact-form";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontaktmöglichkeiten der Historischen Schiene für allgemeine Anfragen, Mitgliedschaft, Projekte, Presse, Datenschutz und Kooperationen.",
};

const contactAreas = [
  {
    title: "Allgemeine Anfragen",
    description:
      "Für allgemeine Fragen zum Verein, zu unseren Zielen oder zur Website.",
    email: "info@historische-schiene.de",
    icon: MessagesSquare,
  },
  {
    title: "Mitgliedschaft",
    description:
      "Fragen zu Mitgliedsformen, Beiträgen, Anträgen und aktiver Mitarbeit.",
    email: "mitglied-werden@historische-schiene.de",
    icon: UserRoundPlus,
  },
  {
    title: "Fahrzeuge und Projekte",
    description:
      "Hinweise, fachliche Fragen oder Unterstützung zu unseren Fahrzeug- und Infrastrukturprojekten.",
    email: "projekte@historische-schiene.de",
    icon: TrainFront,
  },
  {
    title: "Presse und Medien",
    description:
      "Für Presseanfragen, Interviews, Bildmaterial und öffentliche Berichterstattung.",
    email: "presse@historische-schiene.de",
    icon: Megaphone,
  },
  {
    title: "Partnerschaften",
    description:
      "Für Unternehmen, Vereine, Kommunen und Organisationen, die mit uns zusammenarbeiten möchten.",
    email: "partner@historische-schiene.de",
    icon: Handshake,
    note:
      "Ein eigener Partnerbereich mit weiteren Informationen wird später ergänzt.",
  },
  {
    title: "Datenschutz",
    description:
      "Für Auskunftsersuchen und Fragen zur Verarbeitung personenbezogener Daten.",
    email: "datenschutz@historische-schiene.de",
    icon: ShieldCheck,
  },
];

export default function KontaktPage() {
  return (
    <>
      <PageHeader
        eyebrow="Wir freuen uns auf deine Nachricht"
        title="Kontakt"
        description="Damit deine Anfrage schnell bei der richtigen Stelle ankommt, findest du hier verschiedene Kontaktmöglichkeiten nach Themenbereich."
      />

      <section className="border-b border-line bg-page-soft">
        <div className="site-container py-8">
          <div className="flex gap-4 rounded-2xl border border-accent-border bg-accent-soft p-5">
            <CircleAlert
              size={23}
              className="mt-0.5 shrink-0 text-accent-light"
            />

            <div>
              <h2 className="font-semibold text-content">
                Kontaktmöglichkeiten im Aufbau
              </h2>

              <p className="mt-2 text-sm leading-7 text-muted">
                Die angegebenen Adressen dienen derzeit als vorgesehene
                Kontaktstruktur. Vor Veröffentlichung der Website müssen die
                entsprechenden Postfächer oder Weiterleitungen eingerichtet
                werden.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container">
          <SectionHeading
            eyebrow="Ansprechstellen"
            title="Der richtige Kontakt für dein Anliegen"
            description="Wähle den Bereich, der am besten zu deiner Anfrage passt."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contactAreas.map((area) => (
              <ContactCard
                key={area.title}
                title={area.title}
                description={area.description}
                email={area.email}
                icon={area.icon}
                note={area.note}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-page-soft">
        <div className="site-container section-spacing">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <SectionHeading
                eyebrow="Direkt schreiben"
                title="Kontaktformular"
                description="Das Formular wird später mit einer sicheren serverseitigen Verarbeitung und einer passenden E-Mail-Zustellung verbunden."
              />

              <div className="mt-8 space-y-5">
                <div className="surface-card flex gap-4 p-5">
                  <Mail
                    size={22}
                    className="mt-0.5 shrink-0 text-accent-light"
                  />

                  <div>
                    <h3 className="font-semibold text-content">
                      Alternative per E-Mail
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-muted">
                      Bis zur Aktivierung des Formulars kannst du uns direkt
                      unter{" "}
                      <a
                        href="mailto:info@historische-schiene.de"
                        className="font-semibold text-content transition hover:text-accent-light"
                      >
                        info@historische-schiene.de
                      </a>{" "}
                      kontaktieren.
                    </p>
                  </div>
                </div>

                <div className="surface-card flex gap-4 p-5">
                  <Clock3
                    size={22}
                    className="mt-0.5 shrink-0 text-accent-light"
                  />

                  <div>
                    <h3 className="font-semibold text-content">
                      Bearbeitungszeit
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-muted">
                      Der Verein wird ehrenamtlich aufgebaut. Eine Antwort kann
                      daher gelegentlich einige Tage dauern.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="site-container">
          <div className="grid gap-8 lg:grid-cols-2">
            <article className="surface-card p-8 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
                <MapPin size={24} />
              </div>

              <h2 className="mt-6 text-3xl font-bold text-content">
                Vereinssitz
              </h2>

              <p className="mt-5 leading-8 text-muted">
                Als Sitz der Historischen Schiene ist Mühldorf am Inn
                vorgesehen.
              </p>

              <div className="mt-7 border-t border-line pt-6">
                <p className="text-sm text-subtle">
                  Historische Schiene
                </p>

                <p className="mt-2 font-semibold text-content">
                  Mühldorf am Inn
                </p>

                <p className="mt-2 text-sm text-muted">
                  Eine vollständige postalische Anschrift wird nach der
                  Vereinsgründung ergänzt.
                </p>
              </div>
            </article>

            <article className="rounded-3xl border border-accent-border bg-accent-soft p-8 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-accent-light">
                <Building2 size={24} />
              </div>

              <h2 className="mt-6 text-3xl font-bold text-content">
                Partner und Kooperationen
              </h2>

              <p className="mt-5 leading-8 text-muted">
                Wir suchen langfristig Kontakte zu Eisenbahnunternehmen,
                Infrastrukturbetreibern, Kommunen, Werkstätten, Vereinen und
                weiteren Unterstützern.
              </p>

              <a
                href="mailto:partner@historische-schiene.de"
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-light"
              >
                <Handshake size={18} />
                Kooperation anfragen
              </a>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}