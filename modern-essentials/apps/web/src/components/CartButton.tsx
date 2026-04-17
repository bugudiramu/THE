'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Button } from '@modern-essentials/ui';

export default function CartButton() {
  const { totalItems, openCart } = useCart();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={openCart}
      className="relative group transition-all duration-300 outline-none p-0 h-10 w-10"
    >
      <div className="relative">
        <ShoppingBag className="h-5 w-5 text-primary group-hover:text-secondary transition-colors" strokeWidth={1.5} />
        
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center bg-secondary text-[8px] font-black text-white rounded-full ring-2 ring-surface shadow-sm animate-in zoom-in duration-300">
            {totalItems > 9 ? '9+' : totalItems}
          </span>
        )}
      </div>
    </Button>
  );
}
