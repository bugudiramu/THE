export default function NoClerkPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">No Clerk Test Page</h1>
        <p className="text-gray-600">This page doesn't use Clerk to test if the issue is with Clerk.</p>
        <p className="text-gray-600 mt-2">API URL: {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
      </div>
    </div>
  );
}
