import { ProductDetailClient } from "@/components/ProductDetailClient";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getProduct(id: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  try {
    const res = await fetch(`${apiUrl}/products/${id}`, {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Failed to fetch product");
    }

    return res.json();
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Breadcrumb */}
        <nav className="flex mb-12 text-[10px] uppercase tracking-widest font-bold" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-3 text-on-surface-variant">
            <li>
              <Link
                href="/products"
                className="hover:text-on-surface transition-colors"
              >
                Products
              </Link>
            </li>
            <li aria-hidden="true" className="opacity-30">/</li>
            <li>
              <span className="text-on-surface">{product.name}</span>
            </li>
          </ol>
        </nav>

        <ProductDetailClient product={product} />
      </div>
    </div>
  );
}
