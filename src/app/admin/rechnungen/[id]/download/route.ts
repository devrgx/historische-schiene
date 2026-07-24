import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import {
  createInvoiceFilename,
  createInvoiceStorageDirectory,
} from "@/config/invoicing";

import { getCurrentUser } from "@/lib/auth";
import { generateInvoicePdf } from "@/lib/billing/generate-invoice-pdf";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type InvoiceDownloadRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  { params }: InvoiceDownloadRouteProps,
): Promise<NextResponse> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      {
        error: "Du bist nicht angemeldet.",
      },
      {
        status: 401,
      },
    );
  }

  if (!currentUser.roleKeys.includes("ADMIN")) {
    return NextResponse.json(
      {
        error: "Du bist nicht berechtigt, diese Rechnung herunterzuladen.",
      },
      {
        status: 403,
      },
    );
  }

  const resolvedParams = await params;

  const invoiceId = Number.parseInt(resolvedParams.id, 10);

  if (!Number.isInteger(invoiceId) || invoiceId < 1) {
    return NextResponse.json(
      {
        error: "Die Rechnungs-ID ist ungültig.",
      },
      {
        status: 400,
      },
    );
  }

  const invoice = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },

    select: {
      id: true,
      invoiceNumber: true,
      billingYear: true,
      pdfStoragePath: true,
      pdfSha256: true,
    },
  });

  if (!invoice) {
    return NextResponse.json(
      {
        error: "Die Rechnung wurde nicht gefunden.",
      },
      {
        status: 404,
      },
    );
  }

  /*
   * Falls für eine ausgestellte Rechnung noch keine PDF
   * vorhanden ist, wird sie beim ersten Download erzeugt.
   */
  if (!invoice.pdfStoragePath) {
    try {
      await generateInvoicePdf(invoice.id);
    } catch (error: unknown) {
      console.error("Rechnungs-PDF konnte nicht erzeugt werden:", error);

      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Die Rechnungs-PDF konnte nicht erzeugt werden.",
        },
        {
          status: 500,
        },
      );
    }
  }

  const refreshedInvoice = await prisma.invoice.findUnique({
    where: {
      id: invoice.id,
    },

    select: {
      invoiceNumber: true,
      billingYear: true,
      pdfStoragePath: true,
      pdfSha256: true,
    },
  });

  if (!refreshedInvoice?.pdfStoragePath) {
    return NextResponse.json(
      {
        error: "Für die Rechnung wurde keine PDF-Datei gespeichert.",
      },
      {
        status: 500,
      },
    );
  }

  const storageDirectory = path.resolve(
    createInvoiceStorageDirectory(refreshedInvoice.billingYear),
  );

  /*
   * In der Datenbank steht nur ein relativer Dateiname.
   * resolve() und relative() verhindern, dass ein manipulierter
   * Pfad aus dem vorgesehenen Rechnungsordner ausbricht.
   */
  const absolutePath = path.resolve(
    storageDirectory,
    refreshedInvoice.pdfStoragePath,
  );

  const relativeCheck = path.relative(storageDirectory, absolutePath);

  if (relativeCheck.startsWith("..") || path.isAbsolute(relativeCheck)) {
    return NextResponse.json(
      {
        error: "Der gespeicherte Rechnungspfad ist ungültig.",
      },
      {
        status: 500,
      },
    );
  }

  let pdfBuffer: Buffer;

  try {
    pdfBuffer = await readFile(absolutePath);
  } catch (error) {
    console.error(
      "Gespeicherte Rechnungs-PDF konnte nicht gelesen werden:",
      error,
    );

    return NextResponse.json(
      {
        error: "Die gespeicherte Rechnungs-PDF wurde nicht gefunden.",
      },
      {
        status: 404,
      },
    );
  }

  const filename = createInvoiceFilename(refreshedInvoice.invoiceNumber);

  const responseBody = new Uint8Array(pdfBuffer);

  return new NextResponse(responseBody, {
    status: 200,

    headers: {
      "Content-Type": "application/pdf",

      "Content-Length": responseBody.byteLength.toString(),

      "Content-Disposition": `attachment; filename="${filename}"`,

      "Cache-Control": "private, no-store, max-age=0",

      "X-Content-Type-Options": "nosniff",

      ...(refreshedInvoice.pdfSha256
        ? {
            ETag: `"${refreshedInvoice.pdfSha256}"`,
          }
        : {}),
    },
  });
}
