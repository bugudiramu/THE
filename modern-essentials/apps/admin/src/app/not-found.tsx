import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-surface">
      <h2 className="text-4xl font-headline text-on-surface mb-4">404 - Not Found</h2>
      <p className="max-w-md mb-8 text-on-surface-variant font-body text-lg">
        The administration page you are looking for does not exist.
      </p>
      <Link 
        href="/" 
        className="px-8 py-3 bg-secondary text-secondary-foreground font-body rounded-md shadow-sm hover:opacity-90 transition-opacity"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
