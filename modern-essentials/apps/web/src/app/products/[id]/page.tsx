import { ProductDetailClient } from "@/components/ProductDetailClient";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
export const runtime = "edge";

  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator,
  Text
} from "@modern-essentials/ui";

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
    <div className="min-h-screen bg-surface pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8 md:py-10">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/products">
                  <Text variant="xs" className="font-bold text-primary/40 hover:text-primary transition-colors">Products</Text>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-primary/20" />
            <BreadcrumbItem>
              <BreadcrumbPage>
                <Text variant="xs" className="font-bold text-primary">{product.name}</Text>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <ProductDetailClient product={product} />
      </div>
    </div>
  );
}
