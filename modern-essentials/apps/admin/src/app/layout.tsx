import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

export const dynamic = "force-dynamic";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"], 
  display: "swap",
  variable: "--font-sans" 
});

const fraunces = Fraunces({ 
  subsets: ["latin"], 
  weight: ["400", "700", "800"],
  display: "swap",
  variable: "--font-serif" 
});

export const metadata: Metadata = {
  title: "Modern Essentials Admin",
  description: "Ops Dashboard — Modern Essentials",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${fraunces.variable}`}>
      <body className="font-sans flex h-screen overflow-hidden bg-surface text-foreground">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
