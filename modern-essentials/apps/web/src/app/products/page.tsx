import { ProductList } from "@/components/ProductList";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function getProducts(category?: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const url = new URL(`${apiUrl}/products`);
  if (category) {
    url.searchParams.set("category", category);
  }

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 0 } });
    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.status}`);
    }
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const products = await getProducts(searchParams.category);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Our Fresh Essentials
          </h1>
          {searchParams.category && (
            <p className="text-gray-600 font-medium bg-white inline-block px-4 py-1 rounded-full border">
              Showing: {searchParams.category.replace("_", " ")}
            </p>
          )}
        </div>

        <Suspense
          fallback={
            <div className="min-h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          }
        >
          <ProductList products={products} />
        </Suspense>
      </div>
    </div>
  );
}
