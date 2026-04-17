import Link from "next/link";
import { Heading, Text } from "@modern-essentials/ui";

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16">
          <div className="col-span-1 md:col-span-1 space-y-6">
            <Heading variant="h3" className="text-white tracking-tight text-xl font-bold">
              Modern Essentials
            </Heading>
            <Text variant="small" className="text-white/60 leading-relaxed max-w-xs">
              Radical transparency. Fresh delivery. Zero compromises. Starting with the humble egg, we are redefining daily essentials for the modern home.
            </Text>
          </div>
          
          <div className="space-y-6 md:space-y-8">
            <Text variant="xs" className="text-white/40 font-black tracking-widest">Shop</Text>
            <ul className="space-y-4">
              <li><Link href="/products" className="text-white/80 text-sm font-medium hover:text-secondary transition-colors">All Products</Link></li>
              <li><Link href="/products?category=REGULAR_EGGS" className="text-white/80 text-sm font-medium hover:text-secondary transition-colors">Regular Eggs</Link></li>
              <li><Link href="/products?category=BROWN_EGGS" className="text-white/80 text-sm font-medium hover:text-secondary transition-colors">Brown Eggs</Link></li>
              <li><Link href="/products?category=HIGH_PROTEIN_EGGS" className="text-white/80 text-sm font-medium hover:text-secondary transition-colors">High Protein</Link></li>
            </ul>
          </div>

          <div className="space-y-6 md:space-y-8">
            <Text variant="xs" className="text-white/40 font-black tracking-widest">Brand</Text>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-white/80 text-sm font-medium hover:text-secondary transition-colors">Our Story</Link></li>
              <li><Link href="/traceability" className="text-white/80 text-sm font-medium hover:text-secondary transition-colors">Traceability</Link></li>
              <li><Link href="/quality" className="text-white/80 text-sm font-medium hover:text-secondary transition-colors">Quality Control</Link></li>
              <li><Link href="/sustainability" className="text-white/80 text-sm font-medium hover:text-secondary transition-colors">Sustainability</Link></li>
            </ul>
          </div>

          <div className="space-y-6 md:space-y-8">
            <Text variant="xs" className="text-white/40 font-black tracking-widest">Support</Text>
            <ul className="space-y-4">
              <li><Link href="/faq" className="text-white/80 text-sm font-medium hover:text-secondary transition-colors">FAQs</Link></li>
              <li><Link href="/shipping" className="text-white/80 text-sm font-medium hover:text-secondary transition-colors">Shipping Policy</Link></li>
              <li><Link href="/returns" className="text-white/80 text-sm font-medium hover:text-secondary transition-colors">Refund Policy</Link></li>
              <li><Link href="/contact" className="text-white/80 text-sm font-medium hover:text-secondary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-20 pt-10 flex flex-col md:flex-row justify-between items-center border-t border-white/5 gap-6">
          <Text variant="xs" className="text-white/30 tracking-wide">
            © 2026 Modern Essentials Private Limited. All rights reserved.
          </Text>
          <div className="flex space-x-8">
            <Link href="/terms" className="text-[10px] tracking-widest font-black text-white/30 hover:text-white transition-colors uppercase">Terms</Link>
            <Link href="/privacy" className="text-[10px] tracking-widest font-black text-white/30 hover:text-white transition-colors uppercase">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
