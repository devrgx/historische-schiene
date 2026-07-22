export type DocumentCategory =
  | "association"
  | "membership"
  | "privacy"
  | "travel"
  | "press"
  | "other";

export type PublicDocument = {
  id: string;
  title: string;
  description: string;
  category: DocumentCategory;
  fileUrl?: string;
  fileType: "PDF" | "DOCX" | "OTHER";
  fileSize?: string;
  version?: string;
  publishedAt?: string;
  available: boolean;
  external?: boolean;
};

export const documentCategoryLabels: Record<
  DocumentCategory,
  string
> = {
  association: "Verein und Organisation",
  membership: "Mitgliedschaft",
  privacy: "Datenschutz",
  travel: "Sonderfahrten",
  press: "Presse",
  other: "Weitere Dokumente",
};

export const publicDocuments: PublicDocument[] = [
  {
    id: "satzung",
    title: "Satzung",
    description:
      "Die Satzung regelt den Vereinszweck, die Mitgliedschaft, die Organe des Vereins und die grundlegende Organisation.",
    category: "association",
    fileUrl: "/documents/Satzung.pdf",
    fileType: "PDF",
    version: "Entwurf",
    publishedAt: "2026-08-01",
    fileSize: "70 KB",
    available: true,
  },
  {
    id: "beitragsordnung",
    title: "Beitragsordnung",
    description:
      "Regelungen zu Jahresbeiträgen, Aufnahmegebühren, Fälligkeit und möglichen Ermäßigungen.",
    category: "membership",
    fileType: "PDF",
    version: "Entwurf",
    available: false,
  },
  {
    id: "jugendordnung",
    title: "Jugendordnung",
    description:
      "Regelungen zur Beteiligung junger Mitglieder und zu geeigneten Tätigkeiten unter Berücksichtigung des Jugendschutzes.",
    category: "association",
    fileType: "PDF",
    version: "Entwurf",
    available: false,
  },
  {
    id: "datenschutzordnung",
    title: "Datenschutzordnung",
    description:
      "Interne Regelungen zum Umgang mit Mitgliederdaten, Kommunikationsdiensten und personenbezogenen Informationen.",
    category: "privacy",
    fileType: "PDF",
    version: "Entwurf",
    available: false,
  },
  {
    id: "mitgliedsantrag",
    title: "Mitgliedsantrag",
    description:
      "Antrag auf Aufnahme als ordentliches, ermäßigtes oder förderndes Mitglied der Historischen Schiene.",
    category: "membership",
    fileType: "PDF",
    available: false,
  },
  {
    id: "informationsblatt-mitgliedschaft",
    title: "Informationsblatt zur Mitgliedschaft",
    description:
      "Übersicht über Mitgliedsformen, Beiträge, Rechte und Möglichkeiten zur aktiven Mitarbeit.",
    category: "membership",
    fileType: "PDF",
    available: false,
  },
  {
    id: "beforderungsbedingungen",
    title: "Beförderungsbedingungen",
    description:
      "Bedingungen für die Teilnahme an späteren Sonderfahrten und öffentlichen Zugveranstaltungen.",
    category: "travel",
    fileType: "PDF",
    available: false,
  },
  {
    id: "fahrgasthinweise",
    title: "Hinweise für Fahrgäste",
    description:
      "Informationen zu Zustieg, Gepäck, Barrierefreiheit, Verhalten und Sicherheit bei Sonderfahrten.",
    category: "travel",
    fileType: "PDF",
    available: false,
  },
  {
    id: "presseinformationen",
    title: "Presseinformationen",
    description:
      "Kurzvorstellung des Vereins, Projektschwerpunkte und allgemeine Informationen für Medienvertreter.",
    category: "press",
    fileType: "PDF",
    available: false,
  },
  {
    id: "vereinslogo",
    title: "Vereinslogo",
    description:
      "Freigegebene Logodateien für Presseberichte und abgestimmte Veröffentlichungen.",
    category: "press",
    fileType: "OTHER",
    available: false,
  },
];

export function getDocumentsByCategory(
  category: DocumentCategory,
): PublicDocument[] {
  return publicDocuments.filter(
    (document) => document.category === category,
  );
}