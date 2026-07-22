export type NavigationItem = {
  label: string;
  href: string;
};

export const mainNavigation: NavigationItem[] = [
  {
    label: "Verein",
    href: "/verein",
  },
  {
    label: "Projekte",
    href: "/projekte",
  },
  {
    label: "Sonderfahrten",
    href: "/sonderfahrten",
  },
  {
    label: "Aktuelles",
    href: "/aktuelles",
  },
  {
    label: "Mitmachen",
    href: "/mitmachen",
  },
  {
    label: "Kontakt",
    href: "/kontakt",
  },
];

export const footerNavigation = {
  verein: [
    {
      label: "Über uns",
      href: "/verein",
    },
    {
      label: "Projekte",
      href: "/projekte",
    },
    {
      label: "Aktuelles",
      href: "/aktuelles",
    },
  ],
  mitmachen: [
    {
      label: "Mitglied werden",
      href: "/mitmachen",
    },
    {
      label: "Unterstützen",
      href: "/mitmachen#unterstuetzen",
    },
    {
      label: "Kontakt",
      href: "/kontakt",
    },
  ],
  rechtliches: [
    {
      label: "Impressum",
      href: "/impressum",
    },
    {
      label: "Datenschutz",
      href: "/datenschutz",
    },
  ],
};