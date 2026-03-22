"use client";

import { useEffect, useState } from "react";
import { useCart } from "../../contexts/CartContext";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  category: string;
}

export default function ProductsFixedPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    // Simulate loading completed
    setLoading(false);
    setError(null);
    
    // Use mock data for now
    setProducts([
      {
        id: "cmn1hvz3t00047kz4b2sjt4ps",
        name: "High-Protein Eggs",
        description: "Extra high-protein eggs with enhanced nutritional value. Perfect for fitness enthusiasts.",
        price: 18000,
        sku: "EGG003",
        category: "HIGH_PROTEIN_EGGS"
      },
      {
        id: "cmn1hvz3q00027kz4psycn7gi",
        name: "Organic Brown Eggs",
        description: "Premium organic brown eggs from certified organic farms.",
        price: 15000,
        sku: "EGG002",
        category: "BROWN_EGGS"
      },
      {
        id: "cmn1hvz3700007kz4vbi8cc9h",
        name: "Fresh Regular Eggs",
        description: "Fresh farm eggs from free-range chickens. Perfect for breakfast and baking.",
        price: 12000,
        sku: "EGG001",
        category: "REGULAR_EGGS"
      }
    ]);
  }, []);

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      console.log("Adding to cart:", productId, productName);
      await addItem(productId, 1);
      console.log(`Added ${productName} to cart!`);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const formatPrice = (priceInPaise: number) => {
    return `₹${(priceInPaise / 100).toFixed(2)}`;
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
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <p className="text-2xl font-bold text-blue-600 mb-4">
                  {formatPrice(product.price)}
                </p>
                <button
                  onClick={() => handleAddToCart(product.id, product.name)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
