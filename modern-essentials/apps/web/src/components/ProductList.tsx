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
            className="group bg-surface-container-low transition-all duration-300 overflow-hidden flex flex-col relative"
          >
            {inCartQty > 0 && (
              <div className="absolute top-4 left-4 z-10 bg-secondary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-in fade-in zoom-in duration-300">
                {inCartQty} in cart
              </div>
            )}
            <Link
              href={`/products/${product.id}`}
              className="block relative h-64"
            >
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold text-on-surface shadow-sm">
                {product.category.replace("_", " ")}
              </div>
            </Link>

            <div className="p-6 flex flex-col flex-grow space-y-2">
              <Link
                href={`/products/${product.id}`}
                className="hover:opacity-80 transition-opacity"
              >
                <h3 className="text-xl font-headline text-on-surface">
                  {product.name}
                </h3>
              </Link>
              <p className="text-on-surface-variant line-clamp-2 text-sm leading-relaxed font-body">
                {product.description}
              </p>

              <div className="mt-auto pt-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-on-surface font-body">
                    Rs. {(product.price / 100).toFixed(2)}
                  </span>
                  {product.subPrice && (
                    <span className="text-[10px] text-on-secondary-container font-bold uppercase tracking-wider font-body">
                      Save Rs.{" "}
                      {((product.price - product.subPrice) / 100).toFixed(2)}{" "}
                      with sub
                    </span>
                  )}
                </div>

                {inCartQty > 0 ? (
                  <div className="flex items-center bg-surface rounded-full p-1 border-none shadow-sm">
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
                      className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors font-bold text-on-surface"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-on-surface">
                      {inCartQty}
                    </span>
                    <button
                      onClick={() => {
                        const item = items.find(
                          (i) => i.productId === product.id,
                        );
                        if (item) updateItem(item.id, item.quantity + 1);
                      }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors font-bold text-on-surface"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addItem(product, 1)}
                    className="bg-secondary hover:opacity-90 text-white font-bold py-2.5 px-5 rounded-full transition-all active:scale-95 flex items-center gap-2 text-sm uppercase tracking-widest"
                  >
                    <span>Add to Cart</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
