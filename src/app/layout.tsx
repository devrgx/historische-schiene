import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Historische Schiene",
    template: "%s | Historische Schiene",
  },
  description:
    "Historische Schiene – Verein zum Erhalt historischer Eisenbahnfahrzeuge und regionaler Eisenbahngeschichte.",
  applicationName: "Historische Schiene",
  keywords: [
    "Historische Schiene",
    "Eisenbahnverein",
    "historische Eisenbahn",
    "Südostbayern",
    "Baureihe 628",
    "Sonderfahrten",
  ],
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-page font-sans text-content antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <Header />

          <main className="flex-1">
            {children}
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}