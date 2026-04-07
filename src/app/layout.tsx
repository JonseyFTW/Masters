import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Masters Pick 'Em 2026",
  description: "Masters Tournament Pick 'Em Pool - Live Leaderboard & Scoring",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Masters Pick 'Em",
  },
};

export const viewport: Viewport = {
  themeColor: "#006747",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-masters-dark text-white font-sans">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 pb-24 md:pb-6">
          {children}
        </main>
        <Navigation />
      </body>
    </html>
  );
}
