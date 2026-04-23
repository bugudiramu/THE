"use client";

export const runtime = "edge";

import { useEffect } from "react";
import { Button } from "@modern-essentials/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-surface">
      <h2 className="text-4xl font-headline text-on-surface mb-4">Something went wrong!</h2>
      <p className="max-w-md mb-8 text-on-surface-variant font-body text-lg">
        An unexpected error occurred in our system. 
        We've been notified and are looking into it.
      </p>
      <Button
        onClick={() => reset()}
        className="px-8 py-3 bg-secondary text-secondary-foreground font-body rounded-md shadow-sm hover:opacity-90 transition-opacity h-auto"
      >
        Try again
      </Button>
    </div>
  );
}
