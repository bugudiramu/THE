"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import CartButton from "./CartButton";
import CartSidebar from "./CartSidebar";

export default function UserHeader() {
  const { isSignedIn } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex gap-6 md:gap-10">
              <Link href="/" className="flex items-center space-x-2 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                <span className="inline-block font-extrabold text-xl tracking-tight text-foreground hover:opacity-80 transition-opacity">
                  Modern Essentials
                </span>
              </Link>
              <nav className="hidden md:flex gap-8 items-center">
                <Link
                  href="/products"
                  className="flex items-center text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground tracking-wide uppercase"
                >
                  Shop
                </Link>
                {isSignedIn && (
                  <Link
                    href="/dashboard"
                    className="flex items-center text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground tracking-wide uppercase"
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  href="#"
                  className="flex items-center text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground tracking-wide uppercase"
                >
                  Our Story
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-6">
              <CartButton />
              {isSignedIn ? (
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 rounded-full ring-2 ring-primary/10 hover:ring-primary/30 transition-all",
                      userButtonPopoverCard: "shadow-lg border rounded-xl",
                    },
                  }}
                />
              ) : (
                <Link
                  href="/sign-in"
                  className="text-sm font-bold text-foreground bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-full transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      <CartSidebar />
    </>
  );
}
