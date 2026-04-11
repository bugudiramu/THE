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
    <div className="min-h-screen bg-surface-container-low">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <header className="mb-16 border-l-4 border-secondary pl-6">
          <h1 className="text-5xl md:text-6xl font-headline text-on-surface mb-4 tracking-tight">
            Our Collections
          </h1>
          <p className="text-xl text-on-surface-variant font-body max-w-2xl leading-relaxed">
            Thoughtfully curated essentials for your home and lifestyle. 
            Discover quality that endures and designs that inspire.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {categories.map((category: string) => (
            <Link
              key={category}
              href={`/products?category=${category}`}
              className="group block"
            >
              <div className="bg-surface p-10 h-full flex flex-col justify-between transition-all duration-500 hover:shadow-xl hover:-translate-y-1 rounded-sm relative overflow-hidden">
                {/* Bleed-off effect element */}
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative z-10">
                  <h2 className="text-3xl font-headline text-on-surface mb-4 group-hover:text-secondary transition-colors">
                    {category
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </h2>
                  <p className="text-on-surface-variant mb-8 font-body leading-relaxed">
                    Browse our selection of{" "}
                    {category.replace(/_/g, " ").toLowerCase()} products.
                  </p>
                </div>
                
                <div className="relative z-10 mt-auto">
                  <span className="inline-flex items-center text-secondary font-bold tracking-wider uppercase text-sm group-hover:gap-4 transition-all gap-2">
                    Explore Collection
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
