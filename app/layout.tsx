import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ServiceWorker } from "@/components/pwa/ServiceWorker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  applicationName: "BiblioTEC",
  title: {
    default: "BiblioTEC",
    template: "%s · BiblioTEC",
  },
  description:
    "Sistema de gestión de biblioteca universitaria: catálogo, préstamos, reservas y multas.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BiblioTEC",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1D4ED8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen font-sans">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
