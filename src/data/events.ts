export type EventType =
  | "special-trip"
  | "club-event"
  | "information"
  | "work-session"
  | "future-concept";

export type EventStatus =
  | "idea"
  | "planned"
  | "announced"
  | "bookable"
  | "sold-out"
  | "completed"
  | "cancelled";

export type EventStop = {
  station: string;
  arrival?: string;
  departure?: string;
  note?: string;
};

export type EventPrice = {
  label: string;
  price: string;
  description?: string;
};

export type ClubEvent = {
  slug: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  description: string[];

  type: EventType;
  status: EventStatus;

  featured: boolean;
  public: boolean;

  startAt?: string;
  endAt?: string;

  location?: string;
  route?: string;
  meetingPoint?: string;

  imageUrl?: string;
  bookingUrl?: string;

  registrationRequired: boolean;
  registrationUrl?: string;

  vehicle?: string;
  organizer: string;

  stops?: EventStop[];
  prices?: EventPrice[];
  notices: string[];
};

export const events: ClubEvent[] = [
  {
    slug: "erste-sonderfahrt",
    title: "Erste Sonderfahrt der Historischen Schiene",
    subtitle: "Eine langfristige Projektidee",
    shortDescription:
      "Langfristig möchten wir eine erste öffentliche Sonderfahrt mit einem historischen Fahrzeug durchführen.",
    description: [
      "Eine eigene Sonderfahrt gehört zu den langfristigen Zielen der Historischen Schiene.",
      "Zum jetzigen Zeitpunkt stehen weder Datum, Strecke noch eingesetztes Fahrzeug verbindlich fest. Vor einer Durchführung müssen unter anderem Fahrzeugverfügbarkeit, Finanzierung, Trassen, Genehmigungen und die Zusammenarbeit mit einem Eisenbahnverkehrsunternehmen geklärt werden.",
      "Sobald konkrete Planungen beginnen, werden Strecke, Fahrplan, Fahrpreise und Buchungsmöglichkeiten auf dieser Seite veröffentlicht.",
    ],

    type: "future-concept",
    status: "idea",

    featured: true,
    public: true,

    route: "Strecke noch nicht festgelegt",
    vehicle: "Historisches Fahrzeug noch nicht festgelegt",

    registrationRequired: false,

    organizer: "Historische Schiene",

    notices: [
      "Es handelt sich derzeit ausschließlich um eine langfristige Projektidee.",
      "Es gibt noch keinen verbindlichen Termin.",
      "Fahrkarten können derzeit nicht gebucht oder reserviert werden.",
      "Die Durchführung hängt von technischen, betrieblichen und finanziellen Voraussetzungen ab.",
    ],
  },
  {
    slug: "vereinsvorstellung",
    title: "Öffentliche Vereinsvorstellung",
    subtitle: "Die Historische Schiene kennenlernen",
    shortDescription:
      "Bei einer späteren Informationsveranstaltung möchten wir den Verein, seine Ziele und die geplanten Fahrzeugprojekte vorstellen.",
    description: [
      "Die Historische Schiene möchte sich nach der Vereinsgründung öffentlich vorstellen.",
      "Geplant ist eine Informationsveranstaltung, bei der Besucher mehr über den Verein, die geplanten Fahrzeugprojekte und Möglichkeiten zur Unterstützung erfahren können.",
      "Ein Termin und Veranstaltungsort stehen derzeit noch nicht fest.",
    ],

    type: "information",
    status: "planned",

    featured: false,
    public: true,

    location: "Mühldorf am Inn",
    meetingPoint: "Veranstaltungsort wird später bekannt gegeben",

    registrationRequired: false,

    organizer: "Historische Schiene",

    notices: [
      "Termin und Veranstaltungsort sind noch nicht festgelegt.",
      "Die Teilnahme soll voraussichtlich kostenlos möglich sein.",
      "Weitere Informationen werden rechtzeitig veröffentlicht.",
    ],
  },
  {
    slug: "erster-vereinsarbeitstag",
    title: "Erster gemeinsamer Vereinsarbeitstag",
    subtitle: "Organisation und gemeinsamer Aufbau",
    shortDescription:
      "Nach der Gründung soll ein erster gemeinsamer Arbeitstag der Vorbereitung und Aufgabenverteilung dienen.",
    description: [
      "Bei einem ersten gemeinsamen Vereinsarbeitstag sollen organisatorische Aufgaben besprochen und Arbeitsbereiche aufgebaut werden.",
      "Dazu können unter anderem Projektplanung, Öffentlichkeitsarbeit, Dokumentation und die Vorbereitung künftiger Veranstaltungen gehören.",
      "Diese Veranstaltung richtet sich vorrangig an Mitglieder und geladene Interessierte.",
    ],

    type: "work-session",
    status: "planned",

    featured: false,
    public: false,

    location: "Mühldorf am Inn",

    registrationRequired: true,

    organizer: "Historische Schiene",

    notices: [
      "Die Veranstaltung richtet sich vorrangig an Vereinsmitglieder.",
      "Eine Teilnahme ist nur nach vorheriger Anmeldung möglich.",
      "Termin und Ort werden intern bekannt gegeben.",
    ],
  },
];

export const publicEvents = events.filter(
  (event) => event.public,
);

export const featuredEvent = publicEvents.find(
  (event) => event.featured,
);

export function getEventBySlug(
  slug: string,
): ClubEvent | undefined {
  return events.find(
    (event) => event.slug === slug && event.public,
  );
}