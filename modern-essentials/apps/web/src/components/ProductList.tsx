"use client";

import { useCart } from "@/contexts/CartContext";
import Link from "next/link";

interface ProductListProps {
  products: any[];
}

export function ProductList({ products }: ProductListProps) {
  const { addItem, items, updateItem, removeItem } = useCart();

  const getInCartQuantity = (productId: string) => {
    return items
      .filter((i) => i.productId === productId)
      .reduce((sum, i) => sum + i.quantity, 0);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-sm">
        <p className="text-xl text-gray-500">
          No products available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => {
        const mainImage =
          product.images?.[0]?.url ||
          "https://images.unsplash.com/photo-1559229873-383d75ba200f?q=80&w=2012&auto=format&fit=crop";
        const inCartQty = getInCartQuantity(product.id);

        return (
          <div
            key={product.id}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-100 relative"
          >
            {inCartQty > 0 && (
              <div className="absolute top-4 left-4 z-10 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-in fade-in zoom-in duration-300">
                {inCartQty} in cart
              </div>
            )}
            <Link
              href={`/products/${product.id}`}
              className="block relative h-64 overflow-hidden"
            >
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-900 shadow-sm">
                {product.category.replace("_", " ")}
              </div>
            </Link>

            <div className="p-6 flex flex-col flex-grow">
              <div className="mb-4">
                <Link
                  href={`/products/${product.id}`}
                  className="hover:text-primary transition-colors"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-gray-600 line-clamp-2 text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-gray-900">
                    Rs. {(product.price / 100).toFixed(2)}
                  </span>
                  {product.subPrice && (
                    <span className="text-sm text-green-600 font-medium">
                      Save Rs.{" "}
                      {((product.price - product.subPrice) / 100).toFixed(2)}{" "}
                      with sub
                    </span>
                  )}
                </div>

                {inCartQty > 0 ? (
                  <div className="flex items-center bg-gray-100 rounded-xl p-1 border">
                    <button
                      onClick={() => {
                        const item = items.find(
                          (i) => i.productId === product.id,
                        );
                        if (item) {
                          if (item.quantity > 1)
                            updateItem(item.id, item.quantity - 1);
                          else removeItem(item.id);
                        }
                      }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-sm">
                      {inCartQty}
                    </span>
                    <button
                      onClick={() => {
                        const item = items.find(
                          (i) => i.productId === product.id,
                        );
                        if (item) updateItem(item.id, item.quantity + 1);
                      }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors font-bold"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addItem(product, 1)}
                    className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95 shadow-lg shadow-gray-200 flex items-center gap-2"
                  >
                    <span className="text-white">Add to Cart</span>
                  </button>
                )}
              </div>

              <Link
                href={`/products/${product.id}`}
                className="mt-4 text-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors py-2"
              >
                View Details →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
