"use client";

import { useEffect, useState } from "react";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  subPrice?: number;
  description?: string;
  images?: Array<{
    url: string;
    alt?: string;
    sortOrder: number;
  }>;
}

async function getProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}

async function getCategories() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/categories`,
    {
      next: { revalidate: 0 },
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  return res.json();
}

export default function ProductsPage() {
  const [products, setProducts] = useState<any>({ products: [], total: 0 });
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);

        setProducts(productsData);
        setCategories(categoriesData as string[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredProducts =
    selectedCategory === "all"
      ? products.products
      : products.products.filter(
          (product: Product) => product.category === selectedCategory,
        );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Products</h1>

          {/* Categories Filter */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Categories
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  selectedCategory === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All
              </button>
              {categories.map((category: string) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {category
                    .replace("_", " ")
                    .replace(
                      /\b\w/g,
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase(),
                    )}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product: Product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="relative">
                  {product.images && product.images.length > 0 && (
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].alt || product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {product.description}
                    </p>

                    {/* Pricing */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          ₹{(product.price / 100).toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 block">
                          one-time
                        </span>
                      </div>

                      {product.subPrice && (
                        <div className="text-right">
                          <span className="text-lg font-semibold text-green-600">
                            ₹{(product.subPrice / 100).toFixed(2)}
                          </span>
                          <span className="text-sm text-green-500 block">
                            Save ₹
                            {((product.price - product.subPrice) / 100).toFixed(
                              2,
                            )}
                            /month
                          </span>
                        </div>
                      )}
                    </div>

                    <a
                      href={`/products/${product.id}`}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-center font-medium"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {selectedCategory === "all"
                  ? "No products found."
                  : `No products found in ${selectedCategory.replace("_", " ").toLowerCase()}.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
