export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h2 className="text-2xl font-bold">404 - Not Found</h2>
      <p className="mt-2 text-muted-foreground">The page you are looking for does not exist.</p>
      <a href="/" className="mt-4 text-primary underline">Go back home</a>
    </div>
  );
}
