import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-bold tracking-tighter mb-6">Modern Essentials</h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Radical transparency. Fresh delivery. Zero compromises. Starting with the humble egg, we are redefining daily essentials.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-widest mb-6">Shop</h3>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/products?category=REGULAR_EGGS" className="hover:text-white transition-colors">Regular Eggs</Link></li>
              <li><Link href="/products?category=BROWN_EGGS" className="hover:text-white transition-colors">Brown Eggs</Link></li>
              <li><Link href="/products?category=HIGH_PROTEIN_EGGS" className="hover:text-white transition-colors">High Protein</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-widest mb-6">Brand</h3>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="/traceability" className="hover:text-white transition-colors">Traceability</Link></li>
              <li><Link href="/quality" className="hover:text-white transition-colors">Quality Control</Link></li>
              <li><Link href="/sustainability" className="hover:text-white transition-colors">Sustainability</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-widest mb-6">Support</h3>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© 2026 Modern Essentials Private Limited. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
