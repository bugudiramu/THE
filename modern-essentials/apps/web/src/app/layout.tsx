import UserHeader from "@/components/UserHeader";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import { CartProvider } from "../contexts/CartContext";
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
  title: "Modern Essentials",
  description: "Fresh essentials, delivered.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <ClerkProvider>
      <CartProvider>
        <html lang="en" className={cn("font-sans antialiased", spaceGrotesk.variable, fraunces.variable)}>
          <body className="bg-background text-foreground min-h-screen flex flex-col">
            <UserHeader />
            <CartSidebar />
            <main className="flex-grow pt-24 md:pt-32">{children}</main>
            <Footer />
          </body>
        </html>
      </CartProvider>
    </ClerkProvider>
  );
}
