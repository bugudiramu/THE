import UserHeader from "@/components/UserHeader";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "../contexts/CartContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
        <html lang="en" className={cn("font-sans antialiased", inter.variable)}>
          <body className="bg-background text-foreground min-h-screen flex flex-col">
            <UserHeader />
            <main className="flex-grow">{children}</main>
          </body>
        </html>
      </CartProvider>
    </ClerkProvider>
  );
}
