import {
  createHash,
} from "node:crypto";
import {
  mkdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";

import {
  InvoiceStatus,
} from "@/generated/prisma/client";

import {
  createInvoiceFilename,
  createInvoiceStorageDirectory,
} from "@/config/invoicing";

import {
  formatContributionMonth,
} from "@/config/membership-fees";

import { prisma } from "@/lib/prisma";

export type GenerateInvoicePdfResult = {
  invoiceId: number;
  invoiceNumber: string;

  absolutePath: string;
  relativeStoragePath: string;

  sha256: string;
  sizeBytes: number;
  generatedAt: Date;
};

/**
 * Erzeugt die PDF einer bereits ausgestellten Rechnung,
 * speichert sie im internen Rechnungsordner und trägt
 * Pfad, Prüfsumme und Dateigröße in die Datenbank ein.
 *
 * Eine vorhandene PDF derselben Rechnung wird ersetzt.
 * Die Rechnungsdaten selbst werden dabei nicht verändert.
 */
export async function generateInvoicePdf(
  invoiceId: number,
): Promise<GenerateInvoicePdfResult> {
  assertPositiveInteger(
    invoiceId,
    "Rechnungs-ID",
  );

  const invoice =
    await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
      },

      include: {
        items: {
          orderBy: {
            position: "asc",
          },
        },
      },
    });

  if (!invoice) {
    throw new Error(
      "Die Rechnung wurde nicht gefunden.",
    );
  }

  if (
    invoice.status ===
    InvoiceStatus.DRAFT
  ) {
    throw new Error(
      "Für einen Rechnungsentwurf kann noch keine endgültige PDF erzeugt werden.",
    );
  }

  if (
    invoice.status ===
    InvoiceStatus.CANCELLED
  ) {
    throw new Error(
      "Für eine stornierte Rechnung kann keine neue PDF erzeugt werden.",
    );
  }

  if (!invoice.finalizedAt) {
    throw new Error(
      "Die Rechnung wurde noch nicht finalisiert.",
    );
  }

  if (invoice.items.length === 0) {
    throw new Error(
      "Die Rechnung enthält keine Rechnungspositionen.",
    );
  }

  const pdfBytes =
    await renderInvoicePdf(invoice);

  const storageDirectory =
    path.resolve(
      createInvoiceStorageDirectory(
        invoice.billingYear,
      ),
    );

  await mkdir(
    storageDirectory,
    {
      recursive: true,
    },
  );

  const filename =
    createInvoiceFilename(
      invoice.invoiceNumber,
    );

  const absolutePath =
    path.join(
      storageDirectory,
      filename,
    );

  const temporaryPath =
    `${absolutePath}.${process.pid}.${Date.now()}.tmp`;

  try {
    await writeFile(
      temporaryPath,
      pdfBytes,
    );

    /*
     * rename() ist auf demselben Datenträger atomar.
     * Unter Windows kann eine bereits vorhandene Zieldatei
     * das Umbenennen verhindern. Deshalb wird sie vorher
     * kontrolliert entfernt.
     */
    await rm(
      absolutePath,
      {
        force: true,
      },
    );

    await rename(
      temporaryPath,
      absolutePath,
    );
  } catch (error) {
    await rm(
      temporaryPath,
      {
        force: true,
      },
    );

    throw error;
  }

  const fileInformation =
    await stat(absolutePath);

  const sha256 =
    createHash("sha256")
      .update(pdfBytes)
      .digest("hex");

  const generatedAt =
    new Date();

  /*
   * In der Datenbank speichern wir einen Pfad relativ zum
   * konfigurierten Speicherverzeichnis, keinen öffentlichen URL.
   */
  const relativeStoragePath =
    path
      .relative(
        path.resolve(
          createInvoiceStorageDirectory(
            invoice.billingYear,
          ),
        ),
        absolutePath,
      )
      .replaceAll(
        path.sep,
        "/",
      );

  await prisma.invoice.update({
    where: {
      id: invoice.id,
    },

    data: {
      pdfStoragePath:
        relativeStoragePath,

      pdfSha256:
        sha256,

      pdfSizeBytes:
        fileInformation.size,

      pdfGeneratedAt:
        generatedAt,
    },
  });

  return {
    invoiceId:
      invoice.id,

    invoiceNumber:
      invoice.invoiceNumber,

    absolutePath,
    relativeStoragePath,

    sha256,
    sizeBytes:
      fileInformation.size,

    generatedAt,
  };
}

type InvoicePdfData = NonNullable<
  Awaited<
    ReturnType<
      typeof readInvoicePdfDataType
    >
  >
>;

function readInvoicePdfDataType() {
  return prisma.invoice.findUnique({
    where: {
      id: 0,
    },

    include: {
      items: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });
}

async function renderInvoicePdf(
  invoice: InvoicePdfData,
): Promise<Uint8Array> {
  const pdfDocument =
    await PDFDocument.create();

  pdfDocument.setTitle(
    `Rechnung ${invoice.invoiceNumber}`,
  );

  pdfDocument.setAuthor(
    invoice.issuerName,
  );

  pdfDocument.setSubject(
    "Mitgliedsbeitragsrechnung",
  );

  pdfDocument.setCreator(
    "Historische Schiene Mitgliederverwaltung",
  );

  pdfDocument.setProducer(
    "Historische Schiene",
  );

  pdfDocument.setCreationDate(
    invoice.finalizedAt ??
      invoice.issueDate,
  );

  const regularFont =
    await pdfDocument.embedFont(
      StandardFonts.Helvetica,
    );

  const boldFont =
    await pdfDocument.embedFont(
      StandardFonts.HelveticaBold,
    );

  const page =
    pdfDocument.addPage([
      595.28,
      841.89,
    ]);

  const context: InvoiceRenderContext = {
    pdfDocument,
    page,
    regularFont,
    boldFont,

    marginLeft: 48,
    marginRight: 48,
    pageWidth: 595.28,
    pageHeight: 841.89,

    cursorY: 790,
  };

  drawInvoiceHeader(
    context,
    invoice,
  );

  drawRecipient(
    context,
    invoice,
  );

  drawInvoiceInformation(
    context,
    invoice,
  );

  drawInvoiceItems(
    context,
    invoice,
  );

  drawPaymentInformation(
    context,
    invoice,
  );

  drawFooter(
    context,
    invoice,
  );

  return pdfDocument.save({
    useObjectStreams: false,
  });
}

type InvoiceRenderContext = {
  pdfDocument: PDFDocument;
  page: PDFPage;

  regularFont: PDFFont;
  boldFont: PDFFont;

  marginLeft: number;
  marginRight: number;

  pageWidth: number;
  pageHeight: number;

  cursorY: number;
};

function drawInvoiceHeader(
  context: InvoiceRenderContext,
  invoice: InvoicePdfData,
): void {
  const {
    page,
    boldFont,
    regularFont,
  } = context;

  page.drawText(
    invoice.issuerName,
    {
      x: context.marginLeft,
      y: context.cursorY,
      size: 18,
      font: boldFont,
      color: rgb(
        0.08,
        0.11,
        0.17,
      ),
    },
  );

  const issuerLines = [
    createStreetLine(
      invoice.issuerStreet,
      invoice.issuerHouseNumber,
    ),

    createPostalLine(
      invoice.issuerPostalCode,
      invoice.issuerCity,
    ),

    invoice.issuerCountry,

    invoice.issuerEmail ??
      null,

    invoice.issuerWebsite ??
      null,
  ].filter(
    (
      value,
    ): value is string =>
      Boolean(value),
  );

  let issuerY =
    context.cursorY - 24;

  for (
    const line of issuerLines
  ) {
    page.drawText(
      sanitizePdfText(line),
      {
        x:
          context.pageWidth -
          context.marginRight -
          measureText(
            regularFont,
            line,
            9,
          ),

        y: issuerY,
        size: 9,
        font: regularFont,
        color: rgb(
          0.3,
          0.34,
          0.42,
        ),
      },
    );

    issuerY -= 13;
  }

  context.cursorY -= 92;

  drawHorizontalLine(
    context,
    context.cursorY,
  );

  context.cursorY -= 28;
}

function drawRecipient(
  context: InvoiceRenderContext,
  invoice: InvoicePdfData,
): void {
  const {
    page,
    regularFont,
    boldFont,
  } = context;

  const smallIssuerLine = [
    invoice.issuerName,
    createStreetLine(
      invoice.issuerStreet,
      invoice.issuerHouseNumber,
    ),
    createPostalLine(
      invoice.issuerPostalCode,
      invoice.issuerCity,
    ),
  ].join(" · ");

  page.drawText(
    sanitizePdfText(
      smallIssuerLine,
    ),
    {
      x: context.marginLeft,
      y: context.cursorY,
      size: 7,
      font: regularFont,
      color: rgb(
        0.38,
        0.42,
        0.5,
      ),
    },
  );

  context.cursorY -= 24;

  const recipientLines = [
    invoice.recipientName,

    createStreetLine(
      invoice.recipientStreet,
      invoice.recipientHouseNumber,
    ),

    createPostalLine(
      invoice.recipientPostalCode,
      invoice.recipientCity,
    ),

    invoice.recipientCountry,
  ];

  for (
    const [
      index,
      line,
    ] of recipientLines.entries()
  ) {
    page.drawText(
      sanitizePdfText(line),
      {
        x: context.marginLeft,
        y: context.cursorY,
        size:
          index === 0
            ? 11
            : 10,

        font:
          index === 0
            ? boldFont
            : regularFont,

        color: rgb(
          0.1,
          0.13,
          0.19,
        ),
      },
    );

    context.cursorY -= 16;
  }

  context.cursorY -= 24;
}

function drawInvoiceInformation(
  context: InvoiceRenderContext,
  invoice: InvoicePdfData,
): void {
  const {
    page,
    regularFont,
    boldFont,
  } = context;

  page.drawText(
    "Beitragsrechnung",
    {
      x: context.marginLeft,
      y: context.cursorY,
      size: 20,
      font: boldFont,
      color: rgb(
        0.08,
        0.11,
        0.17,
      ),
    },
  );

  context.cursorY -= 34;

  const labelX =
    context.marginLeft;

  const valueX =
    context.marginLeft + 128;

  const rows = [
    [
      "Rechnungsnummer",
      invoice.invoiceNumber,
    ],

    [
      "Rechnungsdatum",
      formatPdfDate(
        invoice.issueDate,
      ),
    ],

    [
      "Beitragsmonat",
      formatContributionMonth(
        invoice.billingYear,
        invoice.billingMonth,
      ),
    ],

    [
      "Mitgliedsnummer",
      invoice
        .recipientMembershipNumber,
    ],

    [
      "Fällig am",
      formatPdfDate(
        invoice.dueDate,
      ),
    ],
  ] as const;

  for (const [
    label,
    value,
  ] of rows) {
    page.drawText(
      label,
      {
        x: labelX,
        y: context.cursorY,
        size: 9,
        font: regularFont,
        color: rgb(
          0.38,
          0.42,
          0.5,
        ),
      },
    );

    page.drawText(
      sanitizePdfText(value),
      {
        x: valueX,
        y: context.cursorY,
        size: 9,
        font: boldFont,
        color: rgb(
          0.1,
          0.13,
          0.19,
        ),
      },
    );

    context.cursorY -= 16;
  }

  context.cursorY -= 20;
}

function drawInvoiceItems(
  context: InvoiceRenderContext,
  invoice: InvoicePdfData,
): void {
  const {
    page,
    regularFont,
    boldFont,
  } = context;

  const tableLeft =
    context.marginLeft;

  const tableRight =
    context.pageWidth -
    context.marginRight;

  const positionX =
    tableLeft;

  const descriptionX =
    tableLeft + 34;

  const quantityX =
    tableRight - 150;

  const unitPriceX =
    tableRight - 92;

  const totalX =
    tableRight;

  page.drawRectangle({
    x: tableLeft,
    y:
      context.cursorY - 8,
    width:
      tableRight -
      tableLeft,
    height: 26,
    color: rgb(
      0.93,
      0.95,
      0.97,
    ),
  });

  drawTextRightAligned(
    page,
    boldFont,
    "Menge",
    quantityX,
    context.cursorY,
    8,
  );

  drawTextRightAligned(
    page,
    boldFont,
    "Einzelpreis",
    unitPriceX,
    context.cursorY,
    8,
  );

  drawTextRightAligned(
    page,
    boldFont,
    "Gesamt",
    totalX,
    context.cursorY,
    8,
  );

  page.drawText(
    "Pos.",
    {
      x: positionX,
      y: context.cursorY,
      size: 8,
      font: boldFont,
      color: rgb(
        0.2,
        0.24,
        0.31,
      ),
    },
  );

  page.drawText(
    "Beschreibung",
    {
      x: descriptionX,
      y: context.cursorY,
      size: 8,
      font: boldFont,
      color: rgb(
        0.2,
        0.24,
        0.31,
      ),
    },
  );

  context.cursorY -= 30;

  for (
    const item of invoice.items
  ) {
    const descriptionLines =
      wrapText(
        sanitizePdfText(
          item.description,
        ),
        regularFont,
        9,
        245,
      );

    const rowHeight =
      Math.max(
        28,
        descriptionLines.length *
          13 +
          10,
      );

    page.drawText(
      item.position.toString(),
      {
        x: positionX,
        y: context.cursorY,
        size: 9,
        font: regularFont,
        color: rgb(
          0.15,
          0.18,
          0.24,
        ),
      },
    );

    let descriptionY =
      context.cursorY;

    for (
      const line of descriptionLines
    ) {
      page.drawText(
        line,
        {
          x: descriptionX,
          y: descriptionY,
          size: 9,
          font: regularFont,
          color: rgb(
            0.15,
            0.18,
            0.24,
          ),
        },
      );

      descriptionY -= 13;
    }

    drawTextRightAligned(
      page,
      regularFont,
      item.quantity.toString(),
      quantityX,
      context.cursorY,
      9,
    );

    drawTextRightAligned(
      page,
      regularFont,
      formatPdfMoney(
        item.unitAmountCents,
        invoice.currency,
      ),
      unitPriceX,
      context.cursorY,
      9,
    );

    drawTextRightAligned(
      page,
      boldFont,
      formatPdfMoney(
        item.totalAmountCents,
        invoice.currency,
      ),
      totalX,
      context.cursorY,
      9,
    );

    context.cursorY -=
      rowHeight;

    drawHorizontalLine(
      context,
      context.cursorY + 10,
      rgb(
        0.87,
        0.89,
        0.92,
      ),
    );
  }

  context.cursorY -= 12;

  page.drawText(
    "Rechnungsbetrag",
    {
      x:
        tableRight -
        210,
      y: context.cursorY,
      size: 11,
      font: boldFont,
      color: rgb(
        0.1,
        0.13,
        0.19,
      ),
    },
  );

  drawTextRightAligned(
    page,
    boldFont,
    formatPdfMoney(
      invoice.totalCents,
      invoice.currency,
    ),
    totalX,
    context.cursorY,
    12,
  );

  context.cursorY -= 42;
}

function drawPaymentInformation(
  context: InvoiceRenderContext,
  invoice: InvoicePdfData,
): void {
  const {
    page,
    regularFont,
    boldFont,
  } = context;

  page.drawText(
    "Zahlungsinformationen",
    {
      x: context.marginLeft,
      y: context.cursorY,
      size: 11,
      font: boldFont,
      color: rgb(
        0.1,
        0.13,
        0.19,
      ),
    },
  );

  context.cursorY -= 20;

  const paymentLines: string[] = [
    `Bitte überweisen Sie den Rechnungsbetrag bis zum ${formatPdfDate(
      invoice.dueDate,
    )}.`,

    `Verwendungszweck: ${invoice.invoiceNumber}`,
  ];

  if (
    invoice.issuerAccountHolder
  ) {
    paymentLines.push(
      `Kontoinhaber: ${invoice.issuerAccountHolder}`,
    );
  }

  if (invoice.issuerIban) {
    paymentLines.push(
      `IBAN: ${invoice.issuerIban}`,
    );
  }

  if (invoice.issuerBic) {
    paymentLines.push(
      `BIC: ${invoice.issuerBic}`,
    );
  }

  if (invoice.issuerBankName) {
    paymentLines.push(
      `Kreditinstitut: ${invoice.issuerBankName}`,
    );
  }

  for (
    const paymentLine of paymentLines
  ) {
    const lines =
      wrapText(
        sanitizePdfText(
          paymentLine,
        ),
        regularFont,
        9,
        context.pageWidth -
          context.marginLeft -
          context.marginRight,
      );

    for (const line of lines) {
      page.drawText(
        line,
        {
          x: context.marginLeft,
          y: context.cursorY,
          size: 9,
          font: regularFont,
          color: rgb(
            0.25,
            0.29,
            0.36,
          ),
        },
      );

      context.cursorY -= 14;
    }
  }

  if (
    invoice.contributionResolutionNote
  ) {
    context.cursorY -= 10;

    const noteLines =
      wrapText(
        sanitizePdfText(
          invoice
            .contributionResolutionNote,
        ),
        regularFont,
        8,
        context.pageWidth -
          context.marginLeft -
          context.marginRight,
      );

    for (
      const line of noteLines
    ) {
      page.drawText(
        line,
        {
          x: context.marginLeft,
          y: context.cursorY,
          size: 8,
          font: regularFont,
          color: rgb(
            0.38,
            0.42,
            0.5,
          ),
        },
      );

      context.cursorY -= 12;
    }
  }
}

function drawFooter(
  context: InvoiceRenderContext,
  invoice: InvoicePdfData,
): void {
  const {
    page,
    regularFont,
  } = context;

  const footerY = 42;

  drawHorizontalLine(
    context,
    footerY + 22,
    rgb(
      0.82,
      0.85,
      0.89,
    ),
  );

  const footerParts = [
    invoice.issuerName,

    invoice.issuerEmail ??
      null,

    invoice.issuerWebsite ??
      null,
  ].filter(
    (
      value,
    ): value is string =>
      Boolean(value),
  );

  page.drawText(
    sanitizePdfText(
      footerParts.join(" · "),
    ),
    {
      x: context.marginLeft,
      y: footerY,
      size: 7,
      font: regularFont,
      color: rgb(
        0.42,
        0.46,
        0.53,
      ),
    },
  );

  const pageNumber =
    "Seite 1 von 1";

  drawTextRightAligned(
    page,
    regularFont,
    pageNumber,
    context.pageWidth -
      context.marginRight,
    footerY,
    7,
  );
}

function drawHorizontalLine(
  context: InvoiceRenderContext,
  y: number,
  color = rgb(
    0.75,
    0.78,
    0.83,
  ),
): void {
  context.page.drawLine({
    start: {
      x: context.marginLeft,
      y,
    },

    end: {
      x:
        context.pageWidth -
        context.marginRight,
      y,
    },

    thickness: 0.7,
    color,
  });
}

function drawTextRightAligned(
  page: PDFPage,
  font: PDFFont,
  text: string,
  rightX: number,
  y: number,
  size: number,
): void {
  const safeText =
    sanitizePdfText(text);

  page.drawText(
    safeText,
    {
      x:
        rightX -
        measureText(
          font,
          safeText,
          size,
        ),

      y,
      size,
      font,
      color: rgb(
        0.15,
        0.18,
        0.24,
      ),
    },
  );
}

function measureText(
  font: PDFFont,
  text: string,
  size: number,
): number {
  return font.widthOfTextAtSize(
    sanitizePdfText(text),
    size,
  );
}

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maximumWidth: number,
): string[] {
  const words =
    text.split(/\s+/);

  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate =
      currentLine
        ? `${currentLine} ${word}`
        : word;

    if (
      measureText(
        font,
        candidate,
        size,
      ) <= maximumWidth
    ) {
      currentLine =
        candidate;

      continue;
    }

    if (currentLine) {
      lines.push(
        currentLine,
      );
    }

    currentLine = word;
  }

  if (currentLine) {
    lines.push(
      currentLine,
    );
  }

  return lines.length > 0
    ? lines
    : [""];
}

function formatPdfMoney(
  amountCents: number,
  currency: string,
): string {
  assertNonNegativeAmount(
    amountCents,
  );

  const amount =
    new Intl.NumberFormat(
      "de-DE",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    ).format(
      amountCents / 100,
    );

  /*
   * "EUR" wird statt des Eurozeichens benutzt, damit die
   * eingebaute Helvetica-Schrift auf allen PDF-Viewern
   * zuverlässig funktioniert.
   */
  return `${amount} ${currency}`;
}

function formatPdfDate(
  date: Date,
): string {
  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Europe/Berlin",
    },
  ).format(date);
}

function createStreetLine(
  street: string,
  houseNumber: string,
): string {
  return [
    street.trim(),
    houseNumber.trim(),
  ]
    .filter(Boolean)
    .join(" ");
}

function createPostalLine(
  postalCode: string,
  city: string,
): string {
  return [
    postalCode.trim(),
    city.trim(),
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * StandardFonts.Helvetica verwendet WinAnsi. Zeichen außerhalb
 * dieses Zeichensatzes werden deshalb auf kompatible Varianten
 * abgebildet.
 */
function sanitizePdfText(
  value: string,
): string {
  return value
    .replaceAll("–", "-")
    .replaceAll("—", "-")
    .replaceAll("„", '"')
    .replaceAll("“", '"')
    .replaceAll("”", '"')
    .replaceAll("’", "'")
    .replaceAll("…", "...")
    .replaceAll("\u00a0", " ");
}

function assertPositiveInteger(
  value: number,
  fieldName: string,
): void {
  if (
    !Number.isInteger(value) ||
    value < 1
  ) {
    throw new Error(
      `${fieldName} ist ungültig.`,
    );
  }
}

function assertNonNegativeAmount(
  amountCents: number,
): void {
  if (
    !Number.isSafeInteger(
      amountCents,
    ) ||
    amountCents < 0
  ) {
    throw new Error(
      "Der Geldbetrag ist ungültig.",
    );
  }
}