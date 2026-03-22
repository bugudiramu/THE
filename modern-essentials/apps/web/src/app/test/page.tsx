export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Page</h1>
        <p className="text-gray-600">This is a simple test page to verify the app is working.</p>
        <p className="text-gray-600 mt-2">API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
      </div>
    </div>
  );
}
