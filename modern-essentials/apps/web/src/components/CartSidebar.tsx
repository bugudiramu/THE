"use client";

import Image from "next/image";
import { useCart } from "../contexts/CartContext";
import { 
  Button, 
  Badge, 
  Sheet, 
  SheetContent, 
  ScrollArea, 
  SheetHeader, 
  SheetTitle,
  Heading,
  Text
} from "@modern-essentials/ui";
import { Minus, Plus, Trash2, ShoppingBag, RefreshCcw } from "lucide-react";

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
    return `₹ ${(priceInPaise / 100).toFixed(2)}`;
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateItem(itemId, newQuantity);
    } else {
      removeItem(itemId);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-md bg-surface shadow-2xl p-0 border-l border-primary/5 h-full overflow-hidden flex flex-col gap-0">
        {/* Header - Fixed height */}
        <div className="border-b border-primary/5 bg-surface z-20 shrink-0">
          <SheetHeader className="px-8 py-10 text-left">
            <SheetTitle>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-secondary" />
                </div>
                <div className="space-y-1">
                  <Heading variant="h3" className="text-2xl tracking-tighter text-primary">Your Selection</Heading>
                  {totalItems > 0 && <Text variant="xs" className="text-primary/40 font-bold uppercase tracking-widest">{totalItems} items curated</Text>}
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>
        </div>

        {/* Cart Items - Scrollable flex-grow */}
        <div className="flex-1 min-h-0 w-full bg-surface overflow-hidden relative">
          <ScrollArea className="h-full w-full overflow-y-scroll">
            <div className="px-8 py-8">
              {isLoading ? (
                <div className="text-center py-20 flex flex-col items-center justify-center min-h-[300px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mb-6"></div>
                  <Text variant="lead" className="text-primary/40 font-headline italic">Securing your essentials...</Text>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center justify-center min-h-[300px] space-y-8">
                  <div className="bg-surface-container-low w-24 h-24 rounded-full flex items-center justify-center shadow-inner">
                    <ShoppingBag className="w-10 h-10 text-primary/10" />
                  </div>
                  <div className="space-y-3">
                    <Heading variant="h3" className="text-primary">Your cart is empty</Heading>
                    <Text className="text-primary/60 max-w-[280px] mx-auto">
                      Looks like you haven't added any fresh essentials yet.
                    </Text>
                  </div>
                  <Button 
                    onClick={closeCart} 
                    size="lg" 
                    className="px-12 bg-secondary text-white rounded-full h-16 font-bold uppercase tracking-widest text-xs shadow-lg shadow-secondary/20"
                  >
                    Start Discovering
                  </Button>
                </div>
              ) : (
                <div className="space-y-8 pb-8">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-6 group"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-24 h-24 bg-surface-container-high rounded-2xl overflow-hidden relative shadow-sm">
                        {item.variant?.product?.images && item.variant.product.images.length > 0 ? (
                          <Image
                            src={item.variant.product.images[0].url}
                            alt={
                              item.variant.product.images[0].alt || item.variant.product.name
                            }
                            fill
                            className="object-cover transition-transform group-hover:scale-110 duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-primary/10" />
                          </div>
                        )}
                      </div>

                      {/* Product Details & Controls */}
                      <div className="flex flex-col flex-1 py-1 justify-between">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-2">
                              <Heading variant="h5" className="text-lg text-primary line-clamp-2 leading-tight group-hover:text-secondary transition-colors">
                                {item.variant?.product?.name || 'Loading item...'} ({item.variant?.packSize || 0}pk)
                              </Heading>
                              <div className="flex flex-wrap gap-2">
                                {item.isSubscription ? (
                                  <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                                    <RefreshCcw className="w-2.5 h-2.5 mr-1 inline" />
                                    {item.frequency}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/10 text-primary/40 px-2 py-0.5">One-time</Badge>
                                )}
                              </div>
                          </div>
                          <Text className="font-headline font-bold text-primary whitespace-nowrap pt-1">
                            {formatPrice(item.priceSnapshot * item.quantity)}
                          </Text>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                          <div className="flex items-center bg-surface-container-low h-10 px-1 rounded-xl shadow-inner border border-primary/5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-full text-primary p-0"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </Button>
                            <Text className="w-10 font-bold text-sm text-center text-primary">
                              {item.quantity}
                            </Text>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                              className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-full text-primary p-0"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-primary/20 hover:text-destructive hover:bg-transparent h-8 w-8 p-0"
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
          </ScrollArea>
        </div>

        {/* Footer - Fixed height at bottom */}
        <div className="shrink-0 bg-surface z-20">
          {items.length > 0 && (
            <div className="px-8 py-10 border-t border-primary/5 space-y-8 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <Text variant="xs" className="text-primary/40 font-bold uppercase tracking-widest text-[10px]">Subtotal</Text>
                  <Heading variant="h2" className="text-4xl text-primary">{formatPrice(totalAmount)}</Heading>
                </div>
                <Badge className="bg-secondary/10 text-secondary font-black text-[10px] uppercase tracking-widest border-none px-3 py-1 mb-1">
                  Tax incl.
                </Badge>
              </div>
              
              <div className="space-y-4">
                <Text variant="xs" className="text-primary/40 leading-relaxed italic font-medium text-[10px]">
                  Shipping and taxes are calculated during the next stage of your curation process.
                </Text>
                <Button
                  size="lg"
                  className="w-full h-16 bg-secondary hover:brightness-110 text-white rounded-full font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-secondary/20 transition-all active:scale-[0.98]"
                  onClick={() => {
                    if (typeof globalThis !== "undefined") {
                      (globalThis as any).location.href = "/checkout";
                    }
                  }}
                >
                  Continue to Checkout
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
