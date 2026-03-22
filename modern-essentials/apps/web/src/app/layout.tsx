import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { CartProvider } from "../contexts/CartContext";
import "./globals.css";

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
        <html lang="en">
          <body>{children}</body>
        </html>
      </CartProvider>
    </ClerkProvider>
  );
}
