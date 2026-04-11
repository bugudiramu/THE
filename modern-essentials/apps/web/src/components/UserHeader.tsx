"use client";

import { UserButton, useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import CartButton from "./CartButton";
import CartSidebar from "./CartSidebar";
import { Button } from "@modern-essentials/ui";
import { LayoutDashboard, Package, Gift, ShoppingBag, User } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function UserHeader() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-500 ease-in-out px-6 md:px-12",
          isScrolled 
            ? "bg-surface/90 backdrop-blur-[20px] py-4 shadow-[0_10px_40px_rgba(6,27,14,0.05)]" 
            : "bg-surface py-6"
        )}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Left: Brand */}
            <div className="flex items-center gap-16">
              <Link href="/" className="group flex items-center space-x-2 outline-none">
                <span className="font-headline font-bold text-3xl tracking-tighter text-primary group-hover:text-secondary transition-colors duration-300">
                  Modern Essentials
                </span>
              </Link>

              {/* Navigation */}
              <nav className="hidden lg:flex gap-10 items-center">
                <Link
                  href="/products"
                  className="text-[11px] font-black text-primary/60 hover:text-primary transition-all tracking-[0.2em] uppercase"
                >
                  Shop
                </Link>
                <Link
                  href="/products/categories"
                  className="text-[11px] font-black text-primary/60 hover:text-primary transition-all tracking-[0.2em] uppercase"
                >
                  Collections
                </Link>
                <Link
                  href="/traceability"
                  className="text-[11px] font-black text-primary/60 hover:text-primary transition-all tracking-[0.2em] uppercase"
                >
                  Our Story
                </Link>
              </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-6 md:gap-10">
              {isSignedIn && (
                <nav className="hidden md:flex items-center gap-8 pr-8 border-r border-outline-variant/20">
                  <Link 
                    href="/dashboard" 
                    className="group flex flex-col items-center gap-1"
                  >
                    <LayoutDashboard className="w-4 h-4 text-primary/30 group-hover:text-secondary transition-colors" />
                    <span className="text-[9px] font-black text-primary/40 group-hover:text-primary uppercase tracking-widest transition-colors">Overview</span>
                  </Link>
                  <Link 
                    href="/account/subscriptions" 
                    className="group flex flex-col items-center gap-1"
                  >
                    <Package className="w-4 h-4 text-primary/30 group-hover:text-secondary transition-colors" />
                    <span className="text-[9px] font-black text-primary/40 group-hover:text-primary uppercase tracking-widest transition-colors">Rituals</span>
                  </Link>
                  <Link 
                    href="/dashboard#rewards" 
                    className="group flex flex-col items-center gap-1"
                  >
                    <Gift className="w-4 h-4 text-primary/30 group-hover:text-secondary transition-colors" />
                    <span className="text-[9px] font-black text-primary/40 group-hover:text-primary uppercase tracking-widest transition-colors">Rewards</span>
                  </Link>
                </nav>
              )}

              <div className="flex items-center gap-6">
                <CartButton />
                
                {isSignedIn ? (
                  <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="text-right hidden xl:block">
                      <p className="text-[10px] font-black text-primary leading-none uppercase tracking-tighter">
                        {user?.firstName || 'Member'}
                      </p>
                      <p className="text-[8px] text-secondary font-black uppercase tracking-widest mt-1 opacity-60">Verified</p>
                    </div>
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-11 h-11 rounded-full ring-2 ring-primary/5 hover:ring-secondary transition-all shadow-sm",
                          userButtonPopoverCard: "shadow-[0_20px_60px_rgba(6,27,14,0.15)] border-none rounded-2xl bg-surface",
                        },
                      }}
                    />
                  </div>
                ) : (
                  <Link href="/sign-in">
                    <Button 
                      variant="default" 
                      className="bg-secondary text-white text-[10px] font-black tracking-[0.2em] uppercase px-10 py-3 h-auto rounded-full hover:brightness-110 shadow-lg shadow-secondary/20 transition-all duration-300"
                    >
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <CartSidebar />
    </>
  );
}
