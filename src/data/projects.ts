export type ProjectPriority = 1 | 2 | 3 | null;

export type ProjectStatus =
  | "concept"
  | "evaluating"
  | "fundraising"
  | "negotiating"
  | "planned"
  | "future";

export type ProjectCategory =
  | "railcar"
  | "train-set"
  | "locomotive"
  | "infrastructure";

export type ProjectVehicle = {
  name: string;
  role: string;
  description?: string;
  externalUrl?: string;
};

export type ProjectMilestone = {
  title: string;
  description: string;
  completed: boolean;
};

export type Project = {
  slug: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  shortDescription: string;
  description: string[];

  priority: ProjectPriority;
  publicPriority: string;

  category: ProjectCategory;
  status: ProjectStatus;

  featured: boolean;
  infrastructureProject: boolean;

  heroImage?: string;
  externalUrl?: string;

  goals: string[];
  requirements: string[];

  vehicles?: ProjectVehicle[];
  milestones: ProjectMilestone[];
};

export const projects: Project[] = [
  {
    slug: "br-629-anna-und-maria",
    title: 'Baureihe 629 „Anna & Maria“',
    shortTitle: 'BR 629 „Anna & Maria“',
    subtitle: "Unser vorrangiges Fahrzeugprojekt",
    shortDescription:
      "Unser wichtigstes Projektziel ist die mögliche Übernahme und langfristige Erhaltung der beiden Triebwagen „Anna“ und „Maria“.",
    description: [
      "Die beiden Triebwagen der Baureihe 629 bilden das vorrangige Fahrzeugprojekt der Historischen Schiene.",
      "Ziel ist es, die Voraussetzungen für eine mögliche Übernahme, sichere Unterbringung und langfristige Erhaltung der Fahrzeuge zu schaffen.",
      "Vor einer möglichen Umsetzung müssen insbesondere Finanzierung, Fahrzeugzustand, Transport, Unterbringung und die spätere Nutzung geprüft werden.",
    ],

    priority: 1,
    publicPriority: "Kernprojekt",

    category: "railcar",
    status: "evaluating",

    featured: true,
    infrastructureProject: false,

    externalUrl:
      "https://www.db-gebrauchtzug.de/r/gbzp/gbzp/schaufenster-detail?p210_id=4980&g_app_unternehmen_id=3&session=8803312645104&cs=1Z0dFMrDoS6DxoWbjjQdYmli0Zr7zSgCwWg5Ehk9O2gYfjGzC7ik2ZjxRRNqsn19AmXXhJx1l8sUrv8DlVy2zOQ",

    goals: [
      "Langfristige Erhaltung beider Triebwagen",
      "Aufarbeitung und Sicherung des historischen Zustands",
      "Präsentation bei Veranstaltungen",
      "Perspektivischer Einsatz bei Sonderfahrten",
      "Dokumentation der Fahrzeuggeschichte",
    ],

    requirements: [
      "Gesicherte Finanzierung",
      "Technische Begutachtung",
      "Geeigneter Abstellplatz",
      "Klärung von Transport und Überführung",
      "Langfristiges Betriebskonzept",
    ],

    vehicles: [
      {
        name: "Anna",
        role: "Triebwagen der Baureihe 629",
        description:
          "Einer der beiden Triebwagen des geplanten Fahrzeugprojekts.",
      },
      {
        name: "Maria",
        role: "Triebwagen der Baureihe 629",
        description:
          "Der zweite Triebwagen des geplanten Fahrzeugprojekts.",
      },
    ],

    milestones: [
      {
        title: "Fahrzeuge identifiziert",
        description:
          "Die Fahrzeuge wurden als mögliches Erhaltungsprojekt ausgewählt.",
        completed: true,
      },
      {
        title: "Machbarkeit prüfen",
        description:
          "Finanzierung, Zustand, Transport und Unterbringung werden geprüft.",
        completed: false,
      },
      {
        title: "Finanzierung sichern",
        description:
          "Erforderliche Mittel und mögliche Unterstützer müssen gefunden werden.",
        completed: false,
      },
      {
        title: "Übernahme vorbereiten",
        description:
          "Nach erfolgreicher Prüfung kann eine mögliche Übernahme vorbereitet werden.",
        completed: false,
      },
      {
        title: "Aufarbeitung",
        description:
          "Die Fahrzeuge werden gesichert, dokumentiert und schrittweise aufgearbeitet.",
        completed: false,
      },
    ],
  },

  {
    slug: "br-218-mit-ic-wagen",
    title: "Baureihe 218 mit drei historischen IC-Wagen",
    shortTitle: "BR 218 mit IC-Wagen",
    subtitle: "Ein vollständiger historischer Reisezug",
    shortDescription:
      "Langfristig soll ein lokbespannter Zug aus einer Baureihe 218 und drei historischen IC-Wagen entstehen.",
    description: [
      "Das zweite Fahrzeugprojekt umfasst eine Diesellokomotive der Baureihe 218 und drei historische IC-Reisezugwagen.",
      "Gemeinsam könnten die Fahrzeuge einen vollständigen historischen Reisezug für Präsentationen, Veranstaltungen und perspektivisch auch Sonderfahrten bilden.",
      "Aufgrund des Umfangs ist dieses Vorhaben deutlich aufwendiger als die Übernahme eines einzelnen Fahrzeugs. Neben dem Erwerb müssen Unterbringung, Instandhaltung, Zulassung und betriebliche Einsatzmöglichkeiten berücksichtigt werden.",
    ],

    priority: 2,
    publicPriority: "Aufbauprojekt",

    category: "train-set",
    status: "concept",

    featured: false,
    infrastructureProject: false,

    goals: [
      "Aufbau eines vollständigen historischen Reisezuges",
      "Erhalt einer Diesellokomotive der Baureihe 218",
      "Erhalt historischer Intercity-Reisezugwagen",
      "Einsatz bei Veranstaltungen und Präsentationen",
      "Perspektivische Durchführung von Sonderfahrten",
    ],

    requirements: [
      "Finanzierung von vier Fahrzeugen",
      "Ausreichend lange Abstellgleise",
      "Technische Begutachtung aller Fahrzeuge",
      "Instandhaltungs- und Betriebskonzept",
      "Kooperation mit Eisenbahnverkehrsunternehmen",
    ],

    vehicles: [
      {
        name: "Baureihe 218",
        role: "Zuglokomotive",
        description:
          "Die Diesellokomotive soll den historischen Reisezug befördern.",
        externalUrl:
          "https://www.db-gebrauchtzug.de/r/gbzp/gbzp/schaufenster-detail?p210_id=83&g_sf_liste_id=35&g_babrgruppe_id=44&session=10449381435590&cs=1OxqntlaEZJ9mXTrivEq_CX4vP-fRgttMYlQ4ADxgc3jITR0naTy6_WIrKM3ixafwe7VVxLGpddDGJIQJRKpIKw",
      },
      {
        name: "IC-Wagen 1",
        role: "Historischer Reisezugwagen",
        externalUrl:
          "https://www.db-gebrauchtzug.de/r/gbzp/gbzp/schaufenster-detail?p210_id=3683&session=12383521313690&cs=1EAoeQ5SrPjiA7fZgGZbvfJKbzLLzOKaKM98xQBI2m1Dw-6rFziu-nZ5uOn3gQJu1N6KfPLL7H2jD0vAgxovwew",
      },
      {
        name: "IC-Wagen 2",
        role: "Historischer Reisezugwagen",
        externalUrl:
          "https://www.db-gebrauchtzug.de/r/gbzp/gbzp/schaufenster-detail?p210_id=2315&session=8881555219590&cs=119clHQpgmTMV1vYy-E3w0ccgWAToHaenAhUBtBYBuvfzIkop3mNQ3IvJ06WsieF_hErHaWCGBt6KQpTNHLilUA",
      },
      {
        name: "IC-Wagen 3",
        role: "Historischer Reisezugwagen",
        externalUrl:
          "https://www.db-gebrauchtzug.de/r/gbzp/gbzp/schaufenster-detail?p210_id=3685&session=8458005037502&cs=1S1WUZmVA_ZoH1Gor0Ss_s5JZGS1ZLFRag_pfglLTpDzls0KIywVt2rkZdmFpU_7JNi1saqWJ-WPL9M9Px5ELYA",
      },
    ],

    milestones: [
      {
        title: "Projektidee entwickelt",
        description:
          "Die grundsätzliche Idee eines historischen lokbespannten Zuges wurde festgelegt.",
        completed: true,
      },
      {
        title: "Fahrzeugkonzept prüfen",
        description:
          "Die Eignung und Zusammenstellung der einzelnen Fahrzeuge muss geprüft werden.",
        completed: false,
      },
      {
        title: "Unterbringung sicherstellen",
        description:
          "Für den gesamten Zugverband werden geeignete Abstellgleise benötigt.",
        completed: false,
      },
      {
        title: "Finanzierung planen",
        description:
          "Erwerb, Transport und Aufarbeitung müssen finanziell geplant werden.",
        completed: false,
      },
      {
        title: "Projekt umsetzen",
        description:
          "Eine Umsetzung erfolgt erst nach erfolgreichem Abschluss der Vorprüfungen.",
        completed: false,
      },
    ],
  },

  {
    slug: "br-120",
    title: "Baureihe 120",
    shortTitle: "Baureihe 120",
    subtitle: "Ein mögliches Zukunftsprojekt",
    shortDescription:
      "Die Erhaltung einer Lokomotive der Baureihe 120 ist ein langfristiges Ziel für die weitere Entwicklung des Vereins.",
    description: [
      "Die Baureihe 120 gehört zu den bedeutenden deutschen Elektrolokomotiv-Baureihen und stellt ein mögliches späteres Erhaltungsprojekt dar.",
      "Dieses Projekt hat derzeit eine niedrigere Priorität als die Baureihe 629 und der geplante Zugverband aus Baureihe 218 und IC-Wagen.",
      "Eine Umsetzung wäre insbesondere von geeigneter Infrastruktur, Finanzierung und der Möglichkeit eines langfristigen Erhalts abhängig.",
    ],

    priority: 3,
    publicPriority: "Zukunftsprojekt",

    category: "locomotive",
    status: "future",

    featured: false,
    infrastructureProject: false,

    externalUrl:
      "https://www.db-gebrauchtzug.de/r/gbzp/gbzp/schaufenster-detail?p210_id=359&g_app_unternehmen_id=3&session=9775177458722&cs=12ykxtrwLWaLJYztMM2rsTzVLnnCozvwMKt3D_nahpD-dlG_-_eCb0Cflh3q1abQLkO1CrTr1anLvHIrgzfHbCg",

    goals: [
      "Erhalt einer Lokomotive der Baureihe 120",
      "Dokumentation ihrer technischen Bedeutung",
      "Präsentation bei öffentlichen Veranstaltungen",
      "Langfristige betriebliche Perspektive prüfen",
    ],

    requirements: [
      "Geeignete Unterbringung",
      "Zugang zu elektrifizierter Infrastruktur",
      "Technische Begutachtung",
      "Langfristige Finanzierung",
      "Fachkundige Instandhaltung",
    ],

    milestones: [
      {
        title: "Projektidee",
        description:
          "Die Baureihe 120 wurde als mögliches langfristiges Projekt aufgenommen.",
        completed: true,
      },
      {
        title: "Voraussetzungen schaffen",
        description:
          "Zunächst müssen Verein, Finanzierung und Infrastruktur weiter aufgebaut werden.",
        completed: false,
      },
      {
        title: "Machbarkeit bewerten",
        description:
          "Zu einem späteren Zeitpunkt kann eine konkrete Machbarkeitsprüfung erfolgen.",
        completed: false,
      },
    ],
  },

  {
    slug: "betriebswerk-und-abstellanlage",
    title: "Betriebswerk und Abstellanlage",
    shortTitle: "Eigene Eisenbahninfrastruktur",
    subtitle: "Unsere langfristige Vision",
    shortDescription:
      "Langfristig möchten wir einen dauerhaften Ort schaffen, an dem historische Fahrzeuge sicher abgestellt, gepflegt und restauriert werden können.",
    description: [
      "Historische Fahrzeuge benötigen dauerhaft sichere und geeignete Abstellmöglichkeiten. Eine eigene oder langfristig nutzbare Eisenbahninfrastruktur wäre deshalb ein wichtiger Baustein für die Zukunft des Vereins.",
      "Denkbar wäre die Nutzung eines ehemaligen Betriebswerks, einer Halle, einer Werkstatt oder geeigneter Abstellgleise.",
      "Der Standort könnte nicht nur der Unterbringung dienen, sondern auch Raum für Restaurierungsarbeiten, Vereinsveranstaltungen, Führungen und Bildungsangebote schaffen.",
      "Dieses Vorhaben liegt bewusst in weiter Zukunft und hängt von der Entwicklung des Vereins, möglichen Partnern, verfügbaren Flächen und einer langfristig gesicherten Finanzierung ab.",
    ],

    priority: null,
    publicPriority: "Langfristige Vision",

    category: "infrastructure",
    status: "future",

    featured: false,
    infrastructureProject: true,

    goals: [
      "Geschützte Abstellung historischer Fahrzeuge",
      "Flächen für Wartung und Restaurierung",
      "Werkstatt- und Lagermöglichkeiten",
      "Treffpunkt für Vereinsmitglieder",
      "Möglicher Besucher- und Veranstaltungsbereich",
      "Langfristige Sicherung der Fahrzeugsammlung",
    ],

    requirements: [
      "Geeigneter Standort mit Gleisanschluss",
      "Langfristiger Miet-, Pacht- oder Nutzungsvertrag",
      "Finanzierung von Betrieb und Unterhaltung",
      "Baurechtliche und eisenbahnrechtliche Prüfung",
      "Kooperation mit Eigentümern und Infrastrukturunternehmen",
      "Ausreichend aktive Vereinsmitglieder",
    ],

    milestones: [
      {
        title: "Langfristige Vision formuliert",
        description:
          "Der Bedarf an einer dauerhaften Infrastruktur wurde als Vereinsziel erkannt.",
        completed: true,
      },
      {
        title: "Anforderungen festlegen",
        description:
          "Benötigte Gleislängen, Gebäude und technische Einrichtungen müssen definiert werden.",
        completed: false,
      },
      {
        title: "Mögliche Standorte suchen",
        description:
          "Geeignete Flächen und bestehende Anlagen können langfristig geprüft werden.",
        completed: false,
      },
      {
        title: "Partner gewinnen",
        description:
          "Für ein solches Vorhaben werden starke regionale und fachliche Partner benötigt.",
        completed: false,
      },
      {
        title: "Nutzungskonzept entwickeln",
        description:
          "Betrieb, Finanzierung, Restaurierung und mögliche Besucherangebote müssen geplant werden.",
        completed: false,
      },
    ],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export const vehicleProjects = projects.filter(
  (project) => !project.infrastructureProject,
);

export const infrastructureProjects = projects.filter(
  (project) => project.infrastructureProject,
);

export const featuredProject = projects.find(
  (project) => project.featured,
);