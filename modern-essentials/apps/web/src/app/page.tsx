"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Home(): JSX.Element {
  const { isSignedIn } = useUser();

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Modern Essentials
              </Link>
            </div>

            <nav className="hidden md:flex space-x-8">
              <Link
                href="/products"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Products
              </Link>
              <Link
                href="/cart"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Cart
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {!isSignedIn ? (
                <>
                  <Link
                    href="/sign-in"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                      userButtonPopoverCard: "shadow-lg",
                      userButtonPopoverActionButton:
                        "text-gray-700 hover:bg-gray-50",
                      userButtonPopoverActionButtonText: "text-sm",
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold">Modern Essentials</h1>
        <p className="mt-4 text-xl">Fresh essentials, delivered.</p>

        <div className="mt-8 space-x-4">
          <Link
            href="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700"
          >
            Browse Products
          </Link>
        </div>
      </main>
    </>
  );
}
