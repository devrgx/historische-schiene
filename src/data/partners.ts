export type PartnerCategory =
  | "railway-company"
  | "infrastructure"
  | "workshop"
  | "municipality"
  | "association"
  | "business"
  | "education"
  | "media"
  | "other";

export type PartnerStatus = "active" | "planned" | "former";

export type Partner = {
  id: string;
  name: string;
  shortName?: string;
  description: string;
  category: PartnerCategory;
  status: PartnerStatus;
  website?: string;
  logoUrl?: string;
  cooperationAreas: string[];
  featured: boolean;
  public: boolean;
};

export type CooperationOpportunity = {
  id: string;
  title: string;
  description: string;
  examples: string[];
  emailSubject: string;
};

export const partnerCategoryLabels: Record<PartnerCategory, string> = {
  "railway-company": "Eisenbahnunternehmen",
  infrastructure: "Infrastruktur",
  workshop: "Werkstatt und Technik",
  municipality: "Kommune und Region",
  association: "Verein und Initiative",
  business: "Unternehmen",
  education: "Bildung und Forschung",
  media: "Presse und Medien",
  other: "Weitere Partnerschaft",
};

export const partnerStatusLabels: Record<PartnerStatus, string> = {
  active: "Aktive Partnerschaft",
  planned: "In Vorbereitung",
  former: "Ehemalige Partnerschaft",
};

/*
 * Hier können später tatsächliche Partner eingetragen werden.
 *
 * Beispiel:
 *
 * {
 *   id: "beispiel-partner",
 *   name: "Beispielunternehmen GmbH",
 *   description:
 *     "Unterstützt die Historische Schiene bei technischen Fragestellungen.",
 *   category: "business",
 *   status: "active",
 *   website: "https://beispiel.de",
 *   logoUrl: "/images/partners/beispiel-partner.png",
 *   cooperationAreas: [
 *     "Technische Beratung",
 *     "Materialunterstützung",
 *   ],
 *   featured: true,
 *   public: true,
 * }
 */

export const partners: Partner[] = [
  {
    id: "beispiel-partner",
    name: "Beispielunternehmen GmbH",
    description:
      "Unterstützt die Historische Schiene bei technischen Fragestellungen.",
    category: "business",
    status: "active",
    website: "https://beispiel.de",
    logoUrl: "/images/partners/Platzhalter.jpg",
    cooperationAreas: ["Technische Beratung", "Materialunterstützung"],
    featured: true,
    public: true,
  },
];

export const publicPartners = partners.filter((partner) => partner.public);

export const featuredPartners = publicPartners.filter(
  (partner) => partner.featured,
);

export const cooperationOpportunities: CooperationOpportunity[] = [
  {
    id: "vehicles",
    title: "Fahrzeuge und Ersatzteile",
    description:
      "Unterstützung bei der Übernahme, Erhaltung und technischen Betreuung historischer Eisenbahnfahrzeuge.",
    examples: [
      "Bereitstellung oder Vermittlung historischer Fahrzeuge",
      "Ersatzteile und technische Komponenten",
      "Fachliche Beratung und Dokumentation",
      "Unterstützung bei Untersuchungen und Zulassungen",
    ],
    emailSubject: "Kooperationsanfrage – Fahrzeuge und Ersatzteile",
  },
  {
    id: "workshop",
    title: "Werkstatt und Abstellung",
    description:
      "Zugang zu geeigneten Arbeitsflächen, Werkstätten, Gleisanlagen und sicheren Abstellmöglichkeiten.",
    examples: [
      "Werkstattkapazitäten",
      "Abstellgleise und Hallenplätze",
      "Maschinen und Spezialwerkzeuge",
      "Unterstützung bei Rangierbewegungen",
    ],
    emailSubject: "Kooperationsanfrage – Werkstatt und Abstellung",
  },
  {
    id: "operations",
    title: "Eisenbahnbetrieb",
    description:
      "Zusammenarbeit bei betrieblichen, infrastrukturellen und organisatorischen Voraussetzungen späterer Zugfahrten.",
    examples: [
      "Zusammenarbeit mit Eisenbahnverkehrsunternehmen",
      "Trassen- und Fahrplanplanung",
      "Betriebliche Beratung",
      "Fahrzeug- und Personalgestellung",
    ],
    emailSubject: "Kooperationsanfrage – Eisenbahnbetrieb",
  },
  {
    id: "events",
    title: "Veranstaltungen und Sonderfahrten",
    description:
      "Gemeinsame Planung und Durchführung öffentlicher Veranstaltungen, Präsentationen und historischer Fahrten.",
    examples: [
      "Veranstaltungsflächen",
      "Fahrgastbetreuung",
      "Ticketing und Organisation",
      "Gemeinsame Öffentlichkeitsarbeit",
    ],
    emailSubject: "Kooperationsanfrage – Veranstaltungen",
  },
  {
    id: "region",
    title: "Region und Kommunen",
    description:
      "Kooperationen mit Städten, Gemeinden und regionalen Einrichtungen zur Bewahrung der Eisenbahngeschichte.",
    examples: [
      "Regionale Veranstaltungen",
      "Touristische Zusammenarbeit",
      "Ausstellungen und Aktionstage",
      "Vermittlung geeigneter Flächen",
    ],
    emailSubject: "Kooperationsanfrage – Region und Kommunen",
  },
  {
    id: "sponsoring",
    title: "Sach- und Finanzunterstützung",
    description:
      "Unternehmen und Förderer können Projekte durch Geldmittel, Material, Dienstleistungen oder Fachwissen unterstützen.",
    examples: [
      "Projektbezogene Spenden",
      "Material und Verbrauchsmittel",
      "Transport- und Logistikleistungen",
      "Fachleistungen und Beratung",
    ],
    emailSubject: "Kooperationsanfrage – Unterstützung und Förderung",
  },
];
