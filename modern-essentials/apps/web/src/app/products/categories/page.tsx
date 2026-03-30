import Link from "next/link";

export const dynamic = "force-dynamic";

async function getCategories(): Promise<string[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/categories`,
      { next: { revalidate: 0 } },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Product Categories
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category: string) => (
            <div
              key={category}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {category
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </h2>
                <p className="text-gray-600 mb-4">
                  Browse our selection of{" "}
                  {category.replace(/_/g, " ").toLowerCase()} products.
                </p>
                <Link
                  href={`/products?category=${category}`}
                  className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
                >
                  View Products
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
