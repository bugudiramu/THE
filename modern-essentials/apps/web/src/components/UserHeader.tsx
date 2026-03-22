"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import CartButton from "./CartButton";
import CartSidebar from "./CartSidebar";

export default function UserHeader() {
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
              <CartButton />
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
            </div>
          </div>
        </div>
      </header>
      <CartSidebar />
    </>
  );
}
