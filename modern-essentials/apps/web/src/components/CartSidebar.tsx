"use client";

import Image from "next/image";
import { useCart } from "../contexts/CartContext";
import { Button } from "@modern-essentials/ui";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function CartSidebar() {
  const {
    items,
    totalItems,
    totalAmount,
    isOpen,
    isLoading,
    updateItem,
    removeItem,
    closeCart,
  } = useCart();

  const formatPrice = (priceInPaise: number) => {
    return `₹${(priceInPaise / 100).toFixed(2)}`;
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateItem(itemId, newQuantity);
    } else {
      removeItem(itemId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
          onClick={closeCart}
        />

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-screen max-w-md">
            <div className="flex h-full flex-col bg-background shadow-2xl border-l">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-6 border-b bg-muted/20">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Your Cart ({totalItems})
                </h2>
                <Button variant="ghost" size="icon" onClick={closeCart} className="rounded-full hover:bg-muted">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {isLoading ? (
                  <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground font-medium">Securing your items...</p>
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center justify-center h-full">
                    <div className="bg-muted w-24 h-24 rounded-full flex items-center justify-center mb-6">
                      <ShoppingBag className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-muted-foreground max-w-[250px] mx-auto mb-8">
                      Looks like you haven't added any fresh essentials yet.
                    </p>
                    <Button onClick={closeCart} size="lg" className="px-8 font-semibold shadow-sm tracking-wide">
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6 pt-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 group"
                      >
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-24 h-24 bg-muted/30 rounded-xl border overflow-hidden relative">
                          {item.product.images.length > 0 ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={
                                item.product.images[0].alt || item.product.name
                              }
                              width={96}
                              height={96}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-6 h-6 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>

                        {/* Product Details & Controls */}
                        <div className="flex flex-col flex-1 py-1 justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                               <h3 className="text-base font-bold text-foreground line-clamp-2 leading-tight pr-4">
                                 {item.product.name}
                               </h3>
                               <p className="text-xs text-muted-foreground mt-1 tracking-wider uppercase font-medium">
                                 {item.product.sku}
                               </p>
                            </div>
                            <p className="text-base font-bold text-foreground whitespace-nowrap">
                              {formatPrice(item.priceSnapshot * item.quantity)}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border rounded-lg bg-background shadow-sm h-8">
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.id, item.quantity - 1)
                                }
                                className="w-8 h-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground rounded-l-lg"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 font-semibold text-sm text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.id, item.quantity + 1)
                                }
                                className="w-8 h-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground rounded-r-lg"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t bg-muted/10 px-6 py-6 pb-8">
                  <div className="flex justify-between text-lg font-bold text-foreground mb-2">
                    <p>Subtotal</p>
                    <p>{formatPrice(totalAmount)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-6 font-medium">
                    Shipping & taxes calculated at checkout. Discount codes can be applied in the next step.
                  </p>
                  <Button
                    size="lg"
                    className="w-full text-base font-bold tracking-wide h-14 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                    onClick={() => {
                      if (typeof globalThis !== "undefined") {
                        (globalThis as any).location.href = "/checkout";
                      }
                    }}
                  >
                    Secure Checkout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
