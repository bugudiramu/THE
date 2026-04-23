import Link from "next/link";
import { Heading, Text, Card, Button } from "@modern-essentials/ui";
import { ArrowRight } from "lucide-react";
export const runtime = "edge";


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
    <div className="min-h-screen bg-surface py-12 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <header className="mb-20 space-y-6 max-w-3xl">
          <Heading variant="h1" className="text-5xl md:text-7xl text-primary tracking-tighter border-l-8 border-secondary pl-8">
            Our Collections
          </Heading>
          <Text variant="lead" className="text-primary/60 pl-8 text-xl leading-relaxed">
            Thoughtfully curated essentials for your home and lifestyle. 
            Discover quality that endures and designs that inspire.
          </Text>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {categories.map((category: string) => (
            <Link
              key={category}
              href={`/products?category=${category}`}
              className="group block"
            >
              <Card className="border-none bg-surface-container-low p-10 h-full flex flex-col justify-between transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 rounded-[40px] relative overflow-hidden shadow-sm">
                {/* Bleed-off effect element */}
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-secondary/5 rounded-full group-hover:scale-150 transition-transform duration-1000" />
                
                <div className="relative z-10 space-y-6">
                  <Heading variant="h2" className="text-3xl text-primary group-hover:text-secondary transition-colors tracking-tight">
                    {category
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Heading>
                  <Text className="text-primary/60 font-medium leading-relaxed">
                    Browse our selection of{" "}
                    {category.replace(/_/g, " ").toLowerCase()} products curated for the modern home.
                  </Text>
                </div>
                
                <div className="relative z-10 mt-12">
                  <Button variant="ghost" className="p-0 text-secondary font-black tracking-widest uppercase text-xs group-hover:gap-6 transition-all gap-3 hover:bg-transparent">
                    Explore Collection
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
