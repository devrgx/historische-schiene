export type InvoiceConfiguration = {
  issuer: {
    name: string;
    legalNameAddition: string | null;

    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    country: string;

    email: string;
    phone: string | null;
    website: string | null;
  };

  bankAccount: {
    accountHolder: string;
    iban: string;
    bic: string | null;
    bankName: string | null;
  };

  numbering: {
    prefix: string;
    yearSeparator: string;
    sequenceDigits: number;
  };

  payment: {
    paymentTermDays: number;
    defaultCurrency: "EUR";
  };

  storage: {
    /**
     * Absoluter Serverpfad, sofern INVOICE_STORAGE_PATH in
     * der Umgebung gesetzt ist.
     *
     * Lokal wird andernfalls ./storage/invoices verwendet.
     */
    rootDirectory: string;

    organizeByYear: boolean;
  };

  template: {
    headline: string;
    contributionDescription: string;
    footerLines: readonly string[];
  };
};

export const invoiceConfig: InvoiceConfiguration = {
  issuer: {
    /*
     * Vor der echten Rechnungsstellung durch die tatsächlichen
     * Vereinsdaten ersetzen.
     */
    name: "Historische Schiene",

    /*
     * Erst nach erfolgreicher Eintragung beispielsweise:
     * "e. V."
     */
    legalNameAddition: null,

    street: "Musterstraße",
    houseNumber: "1",
    postalCode: "84453",
    city: "Mühldorf am Inn",
    country: "Deutschland",

    email:
      "rechnung@historische-schiene.de",

    phone: null,

    website:
      "https://historische-schiene.de",
  },

  bankAccount: {
    accountHolder:
      "Historische Schiene",

    iban:
      "DE00 0000 0000 0000 0000 00",

    bic: null,

    bankName: null,
  },

  numbering: {
    /*
     * Beispiel:
     * HS-RE-2026-00001
     */
    prefix: "HS-RE",
    yearSeparator: "-",
    sequenceDigits: 5,
  },

  payment: {
    paymentTermDays: 14,
    defaultCurrency: "EUR",
  },

  storage: {
    rootDirectory:
      process.env
        .INVOICE_STORAGE_PATH?.trim() ||
      "./storage/invoices",

    organizeByYear: true,
  },

  template: {
    headline: "Beitragsrechnung",

    contributionDescription:
      "Mitgliedsbeitrag gemäß der gültigen Beitragsordnung",

    footerLines: [
      "Historische Schiene",
      "Vertreten durch den Vorstand",
      "Diese Rechnung wurde elektronisch erstellt.",
    ],
  },
};

export function getInvoiceIssuerName(): string {
  return [
    invoiceConfig.issuer.name,
    invoiceConfig.issuer
      .legalNameAddition,
  ]
    .filter(Boolean)
    .join(" ");
}

export function createInvoiceNumber(
  year: number,
  sequenceNumber: number,
): string {
  if (
    !Number.isInteger(year) ||
    year < 2_000 ||
    year > 9_999
  ) {
    throw new Error(
      `Ungültiges Rechnungsjahr: ${year}`,
    );
  }

  if (
    !Number.isInteger(sequenceNumber) ||
    sequenceNumber < 1
  ) {
    throw new Error(
      `Ungültige Rechnungsnummer: ${sequenceNumber}`,
    );
  }

  const sequence =
    sequenceNumber
      .toString()
      .padStart(
        invoiceConfig.numbering
          .sequenceDigits,
        "0",
      );

  const separator =
    invoiceConfig.numbering
      .yearSeparator;

  return [
    invoiceConfig.numbering.prefix,
    year,
    sequence,
  ].join(separator);
}

export function createInvoiceFilename(
  invoiceNumber: string,
): string {
  const safeInvoiceNumber =
    invoiceNumber
      .trim()
      .replace(
        /[^A-Za-z0-9_-]/g,
        "_",
      );

  if (!safeInvoiceNumber) {
    throw new Error(
      "Für die Rechnung konnte kein Dateiname erzeugt werden.",
    );
  }

  return `${safeInvoiceNumber}.pdf`;
}

export function getInvoiceDueDate(
  issueDate: Date,
): Date {
  const dueDate = new Date(issueDate);

  dueDate.setUTCDate(
    dueDate.getUTCDate() +
      invoiceConfig.payment
        .paymentTermDays,
  );

  return dueDate;
}

export function createInvoiceStorageDirectory(
  year: number,
): string {
  const rootDirectory =
    invoiceConfig.storage
      .rootDirectory.replace(
        /[\\/]+$/,
        "",
      );

  if (
    !invoiceConfig.storage
      .organizeByYear
  ) {
    return rootDirectory;
  }

  return `${rootDirectory}/${year}`;
}