import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BiblioTEC",
    template: "%s · BiblioTEC",
  },
  description:
    "Sistema de gestión de biblioteca universitaria: catálogo, préstamos, reservas y multas.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
