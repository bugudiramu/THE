"use client";

import { UserButton, useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import CartButton from "./CartButton";
import { 
  Button, 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  ScrollArea,
  Heading,
  Text,
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "@modern-essentials/ui";
import { LayoutDashboard, Package, Gift, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function UserHeader() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          "fixed top-0 z-50 w-full transition-all duration-300 px-4 md:px-6 lg:px-8",
          isScrolled 
            ? "bg-surface/95 backdrop-blur-[12px] py-2 shadow-sm border-b border-primary/5" 
            : "bg-surface py-3 md:py-4"
        )}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Left: Brand & Desktop Nav */}
            <div className="flex items-center gap-6 md:gap-10">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="lg:hidden h-8 w-8 p-0"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </Button>

                <Link href="/" className="group outline-none">
                  <Heading variant="h3" className="text-lg md:text-xl tracking-tighter text-primary font-bold group-hover:text-secondary transition-colors">
                    Modern Essentials
                  </Heading>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <NavigationMenu className="hidden lg:flex">
                <NavigationMenuList className="gap-0.5">
                  <NavigationMenuItem>
                    <Link href="/products" legacyBehavior passHref>
                      <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-[9px] font-black tracking-[0.1em] uppercase text-primary/60 hover:text-primary h-8 px-3")}>
                        Shop
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/products/categories" legacyBehavior passHref>
                      <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-[9px] font-black tracking-[0.1em] uppercase text-primary/60 hover:text-primary h-8 px-3")}>
                        Collections
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/traceability" legacyBehavior passHref>
                      <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-[9px] font-black tracking-[0.1em] uppercase text-primary/60 hover:text-primary h-8 px-3")}>
                        Our Story
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Right: User Actions */}
            <div className="flex items-center gap-3 md:gap-6">
              {isSignedIn && (
                <nav className="hidden lg:flex items-center gap-5 pr-5 border-r border-primary/5">
                  <Link href="/dashboard" className="group flex flex-col items-center">
                    <LayoutDashboard className="w-3.5 h-3.5 text-primary/20 group-hover:text-secondary transition-colors" />
                    <Text variant="xs" className="text-[7px] text-primary/30 group-hover:text-primary transition-colors font-bold uppercase tracking-widest mt-0.5">Overview</Text>
                  </Link>
                  <Link href="/account/subscriptions" className="group flex flex-col items-center">
                    <Package className="w-3.5 h-3.5 text-primary/20 group-hover:text-secondary transition-colors" />
                    <Text variant="xs" className="text-[7px] text-primary/30 group-hover:text-primary transition-colors font-bold uppercase tracking-widest mt-0.5">Plans</Text>
                  </Link>
                  <Link href="/rewards" className="group flex flex-col items-center">
                    <Gift className="w-3.5 h-3.5 text-primary/20 group-hover:text-secondary transition-colors" />
                    <Text variant="xs" className="text-[7px] text-primary/30 group-hover:text-primary transition-colors font-bold uppercase tracking-widest mt-0.5">Rewards</Text>
                  </Link>
                </nav>
              )}

              <div className="flex items-center gap-2 md:gap-4">
                <CartButton />
                
                {isSignedIn ? (
                  <div className="flex items-center gap-3 group">
                    <div className="text-right hidden xl:block">
                      <Text variant="xs" className="text-primary font-bold text-[9px] leading-none tracking-tight">
                        {user?.firstName || 'Member'}
                      </Text>
                      <Text variant="xs" className="text-[7px] text-secondary font-black opacity-60">Verified</Text>
                    </div>
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8 md:w-9 md:h-9 rounded-full ring-1 ring-primary/5 hover:ring-secondary transition-all",
                          userButtonPopoverCard: "shadow-xl border-none rounded-xl bg-surface",
                        },
                      }}
                    />
                  </div>
                ) : (
                  <Button asChild className="hidden sm:flex bg-secondary text-white text-[9px] font-black tracking-widest uppercase px-5 h-8 rounded-full shadow-sm">
                    <Link href="/sign-in">Login</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[80vw] sm:w-[300px] p-0 flex flex-col bg-surface border-r border-primary/5">
          <SheetHeader className="p-4 border-b border-primary/5 text-left">
            <SheetTitle>
              <Heading variant="h3" className="text-lg tracking-tighter text-primary">Menu</Heading>
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1 py-6 px-5">
            <div className="space-y-8">
              <div className="space-y-3">
                <Text variant="xs" className="text-primary/30 font-bold">Shop</Text>
                <div className="flex flex-col gap-2">
                  <Link href="/products" onClick={() => setIsMobileMenuOpen(false)}>
                    <Heading variant="h3" className="text-xl text-primary hover:text-secondary transition-colors">Products</Heading>
                  </Link>
                  <Link href="/products/categories" onClick={() => setIsMobileMenuOpen(false)}>
                    <Heading variant="h3" className="text-xl text-primary hover:text-secondary transition-colors">Collections</Heading>
                  </Link>
                </div>
              </div>
              
              <div className="space-y-3">
                <Text variant="xs" className="text-primary/30 font-bold">Brand</Text>
                <div className="flex flex-col gap-2">
                  <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>
                    <Heading variant="h3" className="text-lg text-primary hover:text-secondary transition-colors">Our Story</Heading>
                  </Link>
                  <Link href="/quality" onClick={() => setIsMobileMenuOpen(false)}>
                    <Heading variant="h3" className="text-lg text-primary hover:text-secondary transition-colors">Quality</Heading>
                  </Link>
                  <Link href="/sustainability" onClick={() => setIsMobileMenuOpen(false)}>
                    <Heading variant="h3" className="text-lg text-primary hover:text-secondary transition-colors">Eco-Initative</Heading>
                  </Link>
                </div>
              </div>

              {isSignedIn && (
                <div className="space-y-4 pt-6 border-t border-primary/5">
                  <Text variant="xs" className="text-primary/30 font-bold">Account</Text>
                  <div className="flex flex-col gap-3">
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary/5 flex items-center justify-center">
                        <LayoutDashboard className="w-4 h-4 text-secondary" />
                      </div>
                      <Heading variant="h4" className="text-base text-primary">Overview</Heading>
                    </Link>
                    <Link href="/account/subscriptions" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary/5 flex items-center justify-center">
                        <Package className="w-4 h-4 text-secondary" />
                      </div>
                      <Heading variant="h4" className="text-base text-primary">Subscriptions</Heading>
                    </Link>
                    <Link href="/rewards" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary/5 flex items-center justify-center">
                        <Gift className="w-4 h-4 text-secondary" />
                      </div>
                      <Heading variant="h4" className="text-base text-primary">Rewards</Heading>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          {!isSignedIn && (
            <div className="p-5 border-t border-primary/5">
              <Button asChild size="lg" className="w-full bg-secondary h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>Login / Register</Link>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
