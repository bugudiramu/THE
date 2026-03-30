"use client";

import Link from "next/link";
import { Button } from "@modern-essentials/ui";

export default function Home(): JSX.Element {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Modern Essentials</h1>
        <p className="mt-4 text-xl text-muted-foreground">Fresh essentials, delivered.</p>

        <div className="mt-8 space-x-4">
          <Button asChild size="lg" className="px-8 text-lg hover:scale-105 transition-all shadow-md text-white">
            <Link href="/products">
              Browse Products
            </Link>
          </Button>
        </div>
      </main>
    </>
  );
}
