"use client";

import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import { 
  Button, 
  AspectRatio, 
  Heading, 
  Text, 
  Badge, 
  Card, 
  CardContent 
} from "@modern-essentials/ui";
import Image from "next/image";
import { Plus, Minus } from "lucide-react";

interface ProductListProps {
  products: any[];
}

export function ProductList({ products }: ProductListProps) {
  const { addItem, items, updateItem, removeItem } = useCart();

  const getInCartQuantity = (variantId: string) => {
    return items
      .filter((i) => i.variantId === variantId)
      .reduce((sum, i) => sum + i.quantity, 0);
  };

  if (products.length === 0) {
    return (
      <Card className="border-dashed bg-transparent flex items-center justify-center py-20 rounded-2xl">
        <Text variant="lead" className="text-primary/40 font-headline italic">
          No products available at the moment.
        </Text>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {products.map((product) => {
        const mainImage =
          product.images?.[0]?.url ||
          "https://images.unsplash.com/photo-1559229873-383d75ba200f?q=80&w=2012&auto=format&fit=crop";
        
        // Use first variant for default display
        const defaultVariant = product.variants?.[0];
        if (!defaultVariant) return null;

        const inCartQty = getInCartQuantity(defaultVariant.id);

        return (
          <Card
            key={product.id}
            className="group border-none bg-surface-container-low transition-all duration-500 overflow-hidden flex flex-col relative rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-1"
          >
            {inCartQty > 0 && (
              <Badge className="absolute top-4 left-4 z-10 bg-secondary text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-in fade-in zoom-in duration-500 border-none">
                {inCartQty} in cart
              </Badge>
            )}
            
            <Link
              href={`/products/${product.id}`}
              className="block relative overflow-hidden"
            >
              <AspectRatio ratio={1.2}>
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.05] group-hover:grayscale-0"
                />
              </AspectRatio>
              <Badge variant="secondary" className="absolute top-4 right-4 bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-black text-primary shadow-sm border-none">
                {product.category.replace("_", " ")}
              </Badge>
            </Link>

            <CardContent className="p-6 flex flex-col flex-grow space-y-3">
              <div className="space-y-1.5">
                <Link
                  href={`/products/${product.id}`}
                  className="block group/title"
                >
                  <Heading variant="h3" className="text-xl text-primary group-hover/title:text-secondary transition-colors line-clamp-1 font-bold">
                    {product.name}
                  </Heading>
                </Link>
                <Text variant="small" className="text-primary/60 line-clamp-2 leading-relaxed text-xs">
                  {product.description || "Farm fresh directly to your doorstep. Perfect for daily consumption, packed with care."}
                </Text>
              </div>

              <div className="mt-auto pt-4 flex items-center justify-between border-t border-primary/5">
                <div className="flex flex-col">
                  <Text variant="large" className="text-primary font-bold text-lg">
                    ₹{(defaultVariant.price / 100).toFixed(2)}
                  </Text>
                  {defaultVariant.subPrice && (
                    <Text variant="xs" className="text-secondary font-black text-[9px] uppercase tracking-tight mt-0.5">
                      Save ₹{((defaultVariant.price - defaultVariant.subPrice) / 100).toFixed(2)} with sub
                    </Text>
                  )}
                </div>

                {inCartQty > 0 ? (
                  <div className="flex items-center bg-surface rounded-full p-1 shadow-inner border border-primary/5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const item = items.find(
                          (i) => i.variantId === defaultVariant.id,
                        );
                        if (item) {
                          if (item.quantity > 1)
                            updateItem(item.id, item.quantity - 1);
                          else removeItem(item.id);
                        }
                      }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors text-primary p-0"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </Button>
                    <Text className="w-8 text-center font-bold text-xs text-primary">
                      {inCartQty}
                    </Text>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const item = items.find(
                          (i) => i.variantId === defaultVariant.id,
                        );
                        if (item) updateItem(item.id, item.quantity + 1);
                      }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors text-primary p-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => addItem(defaultVariant, 1, false, "WEEKLY", product)}
                    className="bg-secondary hover:brightness-110 text-white font-black py-2.5 px-5 rounded-full transition-all active:scale-95 flex items-center gap-2 text-[10px] uppercase tracking-widest h-auto shadow-md shadow-secondary/10"
                  >
                    Add to Cart
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
