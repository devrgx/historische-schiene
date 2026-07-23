export type LegalAddress = {
  street: string;
  postalCode: string;
  city: string;
  country: string;
};

export type HostingProvider = {
  name: string;
  addressLines: string[];
  website?: string;
  processingLocation: string;
};

export type LegalConfig = {
  projectName: string;
  legalName: string;

  formationStatus:
    | "in-formation"
    | "founded"
    | "registered";

  address: LegalAddress;

  representedBy: string[];
  responsibleForContent: string;

  email: string;
  phone?: string;

  registerCourt?: string;
  registerNumber?: string;

  taxNumber?: string;
  vatId?: string;

  hostingProvider: HostingProvider;

  privacyContactEmail: string;
  supervisoryAuthority: {
    name: string;
    addressLines: string[];
    website?: string;
  };

  usesContactForm: boolean;
  usesMemberPortal: boolean;
  usesNewsletter: boolean;
  usesAnalytics: boolean;
  usesExternalFonts: boolean;
  usesNecessaryCookies: boolean;
};

export const legalConfig: LegalConfig = {
  projectName: "Historische Schiene",

  /*
   * Solange der Verein noch nicht gegründet beziehungsweise
   * eingetragen ist, hier noch nicht „e. V.“ ergänzen.
   */
  legalName: "Historische Schiene",

  formationStatus: "in-formation",

  /*
   * WICHTIG:
   * Für das Impressum wird regelmäßig eine ladungsfähige Anschrift
   * benötigt. Ein Postfach allein reicht dafür normalerweise nicht aus.
   *
   * Vor Veröffentlichung vollständig ersetzen.
   */
  address: {
    street: "[Straße und Hausnummer]",
    postalCode: "[PLZ]",
    city: "Mühldorf am Inn",
    country: "Deutschland",
  },

  /*
   * Vor der Vereinsgründung kann hier beispielsweise die für die
   * Website verantwortliche Person stehen.
   *
   * Nach der Gründung an die tatsächliche Vertretungsregelung anpassen.
   */
  representedBy: [
    "[Vorname Nachname – Funktion]",
  ],

  responsibleForContent:
    "[Vorname Nachname, vollständige Anschrift wie oben]",

  email: "info@historische-schiene.de",

  /*
   * Nur eintragen, wenn ihr diese Telefonnummer tatsächlich
   * veröffentlichen möchtet.
   */
  phone: undefined,

  /*
   * Erst nach erfolgter Registereintragung ergänzen.
   */
  registerCourt: undefined,
  registerNumber: undefined,

  /*
   * Nur eintragen, wenn vorhanden und eine Veröffentlichung
   * tatsächlich erforderlich ist.
   */
  taxNumber: undefined,
  vatId: undefined,

  /*
   * Diese Angaben an euren tatsächlichen Hostingvertrag anpassen.
   * STRATO ist hier nur entsprechend eurer bisherigen Planung
   * eingetragen.
   */
  hostingProvider: {
    name: "STRATO AG",
    addressLines: [
      "Otto-Ostrowski-Straße 7",
      "10249 Berlin",
      "Deutschland",
    ],
    website: "https://www.strato.de",
    processingLocation:
      "Deutschland beziehungsweise Europäische Union",
  },

  privacyContactEmail:
    "datenschutz@historische-schiene.de",

  /*
   * Für einen Verein mit Sitz in Bayern ist regelmäßig das
   * Bayerische Landesamt für Datenschutzaufsicht zuständig.
   * Vor Veröffentlichung bitte anhand des tatsächlichen Vereinssitzes
   * und der konkreten Verantwortlichkeit prüfen.
   */
  supervisoryAuthority: {
    name:
      "Bayerisches Landesamt für Datenschutzaufsicht",
    addressLines: [
      "Promenade 18",
      "91522 Ansbach",
      "Deutschland",
    ],
    website: "https://www.lda.bayern.de",
  },

  /*
   * Aktueller technischer Stand der Website.
   * Bei späteren Änderungen unbedingt anpassen.
   */
  usesContactForm: false,
  usesMemberPortal: false,
  usesNewsletter: false,
  usesAnalytics: false,
  usesExternalFonts: false,
  usesNecessaryCookies: false,
};