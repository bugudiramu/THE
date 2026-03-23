"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  category: string;
  subPrice?: number;
}

export default function ProductsFixedPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const mockProducts: Product[] = [
        {
          id: "cmn1hvz3700007kz4vbi8cc9h",
          name: "Fresh Regular Eggs",
          description:
            "Fresh farm eggs from free-range chickens. Perfect for breakfast and baking.",
          price: 12000, // ₹120.00
          sku: "EGG001",
          category: "REGULAR_EGGS",
          subPrice: 10800, // ₹108.00 with 10% savings
        },
        {
          id: "cmn1hvz3t00027kz4psycn7gi",
          name: "Organic Brown Eggs",
          description:
            "Premium organic brown eggs from certified organic farms.",
          price: 15000, // ₹150.00
          sku: "EGG002",
          category: "BROWN_EGGS",
          subPrice: 13200, // ₹132.00 with 12% savings
        },
        {
          id: "cmn1hvz3t00047kz4b2sjt4ps",
          name: "High-Protein Eggs",
          description:
            "Extra high-protein eggs with enhanced nutritional value. Perfect for fitness enthusiasts.",
          price: 18000, // ₹180.00
          sku: "EGG003",
          category: "HIGH_PROTEIN_EGGS",
          subPrice: 15300, // ₹153.00 with 15% savings
        },
      ];

      setProducts(mockProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Our Products</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-4">{product.description}</p>

                <div className="flex items-baseline space-x-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{(product.price / 100).toFixed(2)}
                  </span>
                  {product.subPrice && (
                    <span className="text-sm text-green-600 font-medium">
                      Subscribe & Save{" "}
                      {Math.round(
                        ((product.price - product.subPrice) / product.price) *
                          100,
                      )}
                      %
                    </span>
                  )}
                </div>

                <button
                  onClick={() => router.push(`/products/${product.id}`)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
