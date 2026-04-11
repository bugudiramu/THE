import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-24">
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-3xl font-headline font-bold tracking-tight mb-8">Modern Essentials</h2>
            <p className="text-white/60 leading-relaxed mb-10 text-lg">
              Radical transparency. Fresh delivery. Zero compromises. Starting with the humble egg, we are redefining daily essentials for the modern home.
            </p>
            <div className="flex space-x-6">
              {/* Placeholder for social icons if needed */}
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.3em] mb-10">Shop</h3>
            <ul className="space-y-6 text-white/80 font-medium">
              <li><Link href="/products" className="hover:text-secondary transition-colors">All Products</Link></li>
              <li><Link href="/products?category=REGULAR_EGGS" className="hover:text-secondary transition-colors">Regular Eggs</Link></li>
              <li><Link href="/products?category=BROWN_EGGS" className="hover:text-secondary transition-colors">Brown Eggs</Link></li>
              <li><Link href="/products?category=HIGH_PROTEIN_EGGS" className="hover:text-secondary transition-colors">High Protein</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.3em] mb-10">Brand</h3>
            <ul className="space-y-6 text-white/80 font-medium">
              <li><Link href="/about" className="hover:text-secondary transition-colors">Our Story</Link></li>
              <li><Link href="/traceability" className="hover:text-secondary transition-colors">Traceability</Link></li>
              <li><Link href="/quality" className="hover:text-secondary transition-colors">Quality Control</Link></li>
              <li><Link href="/sustainability" className="hover:text-secondary transition-colors">Sustainability</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.3em] mb-10">Support</h3>
            <ul className="space-y-6 text-white/80 font-medium">
              <li><Link href="/faq" className="hover:text-secondary transition-colors">FAQs</Link></li>
              <li><Link href="/shipping" className="hover:text-secondary transition-colors">Shipping Policy</Link></li>
              <li><Link href="/returns" className="hover:text-secondary transition-colors">Refund Policy</Link></li>
              <li><Link href="/contact" className="hover:text-secondary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-32 pt-12 flex flex-col md:flex-row justify-between items-center text-sm text-white/30 font-medium tracking-wide">
          <p>© 2026 Modern Essentials Private Limited. All rights reserved.</p>
          <div className="flex space-x-10 mt-8 md:mt-0 uppercase text-xs tracking-widest font-bold">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
