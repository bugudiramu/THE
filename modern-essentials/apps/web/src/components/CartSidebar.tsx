"use client";

import Image from "next/image";
import { useCart } from "../contexts/CartContext";
import { Button, Badge } from "@modern-essentials/ui";
import { X, Minus, Plus, Trash2, ShoppingBag, RefreshCcw } from "lucide-react";

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
    return `Rs. ${(priceInPaise / 100).toFixed(2)}`;
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
          className="absolute inset-0 bg-black/10 backdrop-blur-sm transition-opacity"
          onClick={closeCart}
        />

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-screen max-w-md">
            <div className="flex h-full flex-col bg-surface/70 backdrop-blur-[20px] shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-8">
                <h2 className="text-3xl font-headline tracking-tight text-foreground flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6" />
                  Your Cart
                  {totalItems > 0 && <span className="text-sm font-sans font-medium text-muted-foreground ml-1">({totalItems})</span>}
                </h2>
                <Button variant="ghost" size="icon" onClick={closeCart} className="rounded-full hover:bg-black/5 transition-colors">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-8 py-4">
                {isLoading ? (
                  <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3AAFA9] mb-4"></div>
                    <p className="text-muted-foreground font-medium font-headline">Securing your items...</p>
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center justify-center h-full">
                    <div className="bg-surface-container-high w-24 h-24 rounded-full flex items-center justify-center mb-6">
                      <ShoppingBag className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-2xl font-headline tracking-tight text-foreground mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-muted-foreground max-w-[250px] mx-auto mb-8 font-sans">
                      Looks like you haven't added any fresh essentials yet.
                    </p>
                    <Button 
                      onClick={closeCart} 
                      size="lg" 
                      className="px-10 font-bold tracking-wide text-white bg-[#3AAFA9] hover:bg-[#2B7A78] rounded-none h-14"
                    >
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-10 pt-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-6 group"
                      >
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-24 h-24 bg-surface-container-high rounded-none overflow-hidden relative">
                          {item.product.images && item.product.images.length > 0 ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={
                                item.product.images[0].alt || item.product.name
                              }
                              width={96}
                              height={96}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-6 h-6 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>

                        {/* Product Details & Controls */}
                        <div className="flex flex-col flex-1 py-1 justify-between">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                               <h3 className="text-lg font-headline text-foreground line-clamp-2 leading-tight">
                                 {item.product.name}
                               </h3>
                               <div className="flex flex-wrap gap-2 mt-2">
                                 {item.isSubscription ? (
                                   <Badge variant="default" className="bg-[#3AAFA9]/10 text-[#3AAFA9] hover:bg-[#3AAFA9]/10 border-none text-[10px] py-0 px-2 h-5 flex items-center gap-1 rounded-none">
                                     <RefreshCcw className="w-2.5 h-2.5" />
                                     {item.frequency || 'WEEKLY'}
                                   </Badge>
                                 ) : (
                                   <Badge variant="outline" className="text-[10px] py-0 px-2 h-5 rounded-none border-outline-variant/40">One-time</Badge>
                                 )}
                               </div>
                            </div>
                            <p className="text-lg font-headline text-foreground whitespace-nowrap">
                              {formatPrice(item.priceSnapshot * item.quantity)}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center bg-surface-container-low h-9 px-1">
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.id, item.quantity - 1)
                                }
                                className="w-8 h-full flex items-center justify-center hover:text-[#3AAFA9] transition-colors text-muted-foreground"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-10 font-sans font-bold text-sm text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.id, item.quantity + 1)
                                }
                                className="w-8 h-full flex items-center justify-center hover:text-[#3AAFA9] transition-colors text-muted-foreground"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-[#3AAFA9] hover:bg-transparent h-8 w-8"
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
                <div className="px-8 py-8 pb-10">
                  <div className="flex justify-between text-2xl font-headline text-foreground mb-3">
                    <p>Subtotal</p>
                    <p>{formatPrice(totalAmount)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-8 font-sans leading-relaxed">
                    Shipping and taxes are calculated during the next stage of your curation process.
                  </p>
                  <Button
                    size="lg"
                    className="w-full text-base font-bold tracking-widest h-16 transition-all bg-[#3AAFA9] hover:bg-[#2B7A78] text-white rounded-none shadow-xl shadow-[#3AAFA9]/10"
                    onClick={() => {
                      if (typeof globalThis !== "undefined") {
                        (globalThis as any).location.href = "/checkout";
                      }
                    }}
                  >
                    CONTINUE TO CHECKOUT
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
