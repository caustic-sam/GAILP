// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "../styles/globals.css";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "GAILP — Global AI & Identity Policy",
  description:
    "Translating regulation into trustworthy, interoperable systems.",
  openGraph: {
    title: "GAILP — Global AI & Identity Policy",
    description:
      "Translating regulation into trustworthy, interoperable systems.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GAILP — Global AI & Identity Policy",
    description:
      "Translating regulation into trustworthy, interoperable systems.",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Tailwind v4 tokens: bg/text come from styles/globals.css @theme */}
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}