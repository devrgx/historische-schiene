import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Historische Schiene",
    template: "%s | Historische Schiene",
  },
  description:
    "Historische Schiene – Verein zum Erhalt historischer Eisenbahnfahrzeuge und regionaler Eisenbahngeschichte.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}