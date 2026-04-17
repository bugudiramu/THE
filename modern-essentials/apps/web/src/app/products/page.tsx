import { ProductList } from "@/components/ProductList";
import { Suspense } from "react";
import { Heading, Badge, Skeleton } from "@modern-essentials/ui";

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
    <div className="min-h-screen bg-surface py-12 md:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <header className="mb-20 text-center space-y-6">
          <Heading variant="h1" className="text-5xl md:text-7xl text-primary tracking-tighter">
            Our Fresh Essentials
          </Heading>
          {searchParams.category && (
            <Badge variant="secondary" className="px-6 py-2 rounded-full uppercase tracking-[0.2em] text-xs font-black border-none shadow-sm bg-secondary text-white">
              {searchParams.category.replace("_", " ")}
            </Badge>
          )}
        </header>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <Skeleton className="h-96 rounded-[40px]" />
              <Skeleton className="h-96 rounded-[40px]" />
              <Skeleton className="h-96 rounded-[40px]" />
            </div>
          }
        >
          <ProductList products={products} />
        </Suspense>
      </div>
    </div>
  );
}
