import type { Metadata } from "next";
import { Geist_Mono, Inter, Jura } from "next/font/google";

import { Providers } from "@/components/layout/providers";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jura = Jura({
  variable: "--font-jura",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AAA Portfolio",
  description:
    "Internal portfolio MVP — project overview, phases, and client dashboard links.",
  appleWebApp: {
    title: "AAA",
  },
  icons: {
    icon: [
      { url: "/icon0.svg", type: "image/svg+xml" },
      { url: "/icon1.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jura.variable} ${geistMono.variable} min-h-screen font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
