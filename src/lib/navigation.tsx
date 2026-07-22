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
    label: "Partner",
    href: "/partner",
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
    label: "Dokumente",
    href: "/dokumente",
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
    {
      label: "Partner und Kooperationen",
      href: "/partner",
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
    {
      label: "Dokumente",
      href: "/dokumente",
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
