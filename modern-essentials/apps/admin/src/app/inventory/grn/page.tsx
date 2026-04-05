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
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Record Goods Receipt Note (GRN)" />
      
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <Link
          href="/inventory"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </Link>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product / SKU
                </label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                >
                  <option value="">Select a product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Received Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.qty || ""}
                    onChange={(e) => setFormData({ ...formData, qty: parseInt(e.target.value) })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    placeholder="e.g. 500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Collection Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.collectedAt}
                    onChange={(e) => setFormData({ ...formData, collectedAt: e.target.value })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>
              </div>

              {/* Warehouse Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warehouse Location (Bin)
                </label>
                <input
                  type="text"
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="e.g. A-12-04"
                />
              </div>

              <hr className="my-2 border-gray-100" />

              {/* Farm Traceability (Optional) */}
              <div className="bg-gray-50 -mx-6 px-6 py-4 border-y border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Farm Traceability (Optional)
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Origin Farm
                    </label>
                    <select
                      value={formData.farmId}
                      onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    >
                      <option value="">Unknown / Skip</option>
                      {farms.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qty Collected from Farm
                    </label>
                    <input
                      type="number"
                      value={formData.qtyCollected || ""}
                      onChange={(e) => setFormData({ ...formData, qtyCollected: parseInt(e.target.value) })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      placeholder="Defaults to received qty"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Batch
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
