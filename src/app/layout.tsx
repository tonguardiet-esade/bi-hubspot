import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BI TOP AI Ventures | Premium Dashboard",
  description: "Advanced business intelligence and data management platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
