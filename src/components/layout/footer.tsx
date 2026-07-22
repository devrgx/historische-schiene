import { Mail, MapPin, TrainFront } from "lucide-react";
import Link from "next/link";

import { footerNavigation } from "@/lib/navigation";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-page-soft">
      <div className="site-container py-14">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-3"
              aria-label="Historische Schiene – Startseite"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-light">
                <TrainFront size={24} />
              </span>

              <span className="text-lg font-bold text-content">
                Historische Schiene
              </span>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-muted">
              Wir setzen uns für den Erhalt historischer Eisenbahnfahrzeuge,
              regionaler Bahngeschichte und lebendiger Eisenbahnkultur ein.
            </p>

            <div className="mt-6 space-y-3 text-sm text-muted">
              <p className="flex items-center gap-3">
                <MapPin size={17} className="text-accent-light" />
                Mühldorf am Inn
              </p>

              <p className="flex items-center gap-3">
                <Mail size={17} className="text-accent-light" />
                <a
                  href="mailto:info@historische-schiene.de"
                  className="transition hover:text-content"
                >
                  info@historische-schiene.de
                </a>
              </p>
            </div>
          </div>

          <FooterColumn
            title="Verein"
            links={footerNavigation.verein}
          />

          <FooterColumn
            title="Mitmachen"
            links={footerNavigation.mitmachen}
          />

          <FooterColumn
            title="Rechtliches"
            links={footerNavigation.rechtliches}
          />
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-7 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear} Historische Schiene. Alle Rechte vorbehalten.
          </p>

          <p>Website befindet sich im Aufbau.</p>
        </div>
      </div>
    </footer>
  );
}

type FooterColumnProps = {
  title: string;
  links: Array<{
    label: string;
    href: string;
  }>;
};

function FooterColumn({
  title,
  links,
}: FooterColumnProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-content">
        {title}
      </h2>

      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted transition hover:text-content"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}