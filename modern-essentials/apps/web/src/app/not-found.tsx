import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-surface">
      <h2 className="text-4xl font-headline text-on-surface mb-4">404 - Not Found</h2>
      <p className="max-w-md mb-8 text-on-surface-variant font-body text-lg">
        The page you are looking for has been curated away or never existed. 
        Let's get you back to the collection.
      </p>
      <Link 
        href="/" 
        className="px-8 py-3 bg-secondary text-secondary-foreground font-body rounded-md shadow-sm hover:opacity-90 transition-opacity"
      >
        Go back home
      </Link>
    </div>
  );
}
