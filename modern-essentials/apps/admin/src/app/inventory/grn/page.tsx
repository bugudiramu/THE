"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { apiGet, apiPost } from "@/lib/api";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface ProductResponse {
  products: Product[];
  total: number;
}

interface Farm {
  id: string;
  name: string;
}

export default function GrnPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    productId: "",
    qty: 0,
    collectedAt: "",
    locationId: "",
    farmId: "",
    qtyCollected: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsData, farmsData] = await Promise.all([
          apiGet<ProductResponse>("products"), // Changed from catalog/products to products (API is mounted at /products)
          apiGet<Farm[]>("admin/inventory/farms"),
        ]);
        setProducts(productsData.products);
        setFarms(farmsData);
      } catch (err) {
        console.error("Failed to load form data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // API expects collectedAt as ISO string
      await apiPost("admin/inventory/grn", {
        ...formData,
        collectedAt: new Date(formData.collectedAt).toISOString(),
        qtyCollected: formData.qtyCollected || formData.qty,
      });
      router.push("/inventory");
      router.refresh();
    } catch (err) {
      console.error("Failed to record GRN:", err);
      alert("Failed to record GRN. Please check your inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Record GRN" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header title="Inventory: Goods Receipt" />
      
      <div className="flex-1 p-8 lg:p-12 max-w-4xl mx-auto w-full">
        <Link
          href="/inventory"
          className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface mb-10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Inventory
        </Link>

        <div className="bg-surface-container-low rounded-[2rem] p-10 lg:p-14">
          <div className="mb-12">
            <h3 className="text-3xl font-headline font-bold text-on-surface">Record GRN</h3>
            <p className="text-on-surface-variant/70 mt-2 font-body">Log received stock and maintain farm traceability.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 gap-10">
              {/* Product Selection */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                  Product / SKU
                </label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full bg-surface-container-high/50 border-0 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#3AAFA9]/20 transition-all text-on-surface text-lg appearance-none cursor-pointer"
                >
                  <option value="" className="bg-surface">Select a product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} className="bg-surface text-base">
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                    Received Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.qty || ""}
                    onChange={(e) => setFormData({ ...formData, qty: parseInt(e.target.value) })}
                    className="w-full bg-surface-container-high/50 border-0 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#3AAFA9]/20 transition-all text-on-surface text-lg"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                    Collection Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.collectedAt}
                    onChange={(e) => setFormData({ ...formData, collectedAt: e.target.value })}
                    className="w-full bg-surface-container-high/50 border-0 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#3AAFA9]/20 transition-all text-on-surface text-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Warehouse Location */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                  Warehouse Location (Bin)
                </label>
                <input
                  type="text"
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                  className="w-full bg-surface-container-high/50 border-0 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#3AAFA9]/20 transition-all text-on-surface text-lg"
                  placeholder="e.g. A-12-04"
                />
              </div>

              {/* Farm Traceability (Optional) */}
              <div className="pt-6">
                <div className="bg-surface-container-high/30 rounded-2xl p-8">
                  <h4 className="text-[10px] font-black text-[#3AAFA9] uppercase tracking-[0.2em] mb-8">
                    Farm Traceability (Optional)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.15em]">
                        Origin Farm
                      </label>
                      <select
                        value={formData.farmId}
                        onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
                        className="w-full bg-surface-container-low border-0 rounded-xl py-2 px-3 focus:ring-2 focus:ring-[#3AAFA9]/20 transition-all text-on-surface text-base appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-surface">Unknown / Skip</option>
                        {farms.map((f) => (
                          <option key={f.id} value={f.id} className="bg-surface">{f.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.15em]">
                        Qty Collected
                      </label>
                      <input
                        type="number"
                        value={formData.qtyCollected || ""}
                        onChange={(e) => setFormData({ ...formData, qtyCollected: parseInt(e.target.value) })}
                        className="w-full bg-surface-container-low border-0 rounded-xl py-2 px-3 focus:ring-2 focus:ring-[#3AAFA9]/20 transition-all text-on-surface text-base"
                        placeholder="Same as received"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-8">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-full bg-[#2B7A78] px-10 py-4 text-sm font-black uppercase tracking-widest text-[#ffffff] hover:bg-[#2B7A78]/90 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                Save Batch Entry
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
