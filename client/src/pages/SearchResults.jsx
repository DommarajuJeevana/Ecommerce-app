import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import api from "../api";
import ProductCard from "../components/ProductCard";
import { ProductCardSkeleton, EmptyState } from "../components/UIHelpers";

const CATEGORIES = ["Laptops", "Phones", "Tablets", "Accessories", "Gaming", "Audio"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popularity", label: "Popularity" },
  { value: "rating", label: "Rating" },
];

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [maxPrice, setMaxPrice] = useState(3000);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  const q = params.get("q") || "";
  const category = params.get("category") || "";
  const sort = params.get("sort") || "newest";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products", {
        params: {
          search: q, category, sort, maxPrice, brands: selectedBrands.join(","),
          minRating: minRating || undefined, inStock: inStockOnly || undefined,
        },
      });
      setProducts(data.products || data);
      setTotal(data.total ?? (data.products || data).length);
      if (data.availableBrands) setBrands(data.availableBrands);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [q, category, sort, maxPrice, selectedBrands, minRating, inStockOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const setSort = (val) => {
    params.set("sort", val);
    setParams(params);
  };

  const setCategory = (val) => {
    if (val) params.set("category", val); else params.delete("category");
    setParams(params);
  };

  const toggleBrand = (b) => {
    setSelectedBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  };

  const FiltersPanel = (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-sm font-bold text-ink-900">Category</h3>
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="radio" name="cat" checked={!category} onChange={() => setCategory("")} /> All
          </label>
          {CATEGORIES.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm text-ink-700">
              <input type="radio" name="cat" checked={category === c} onChange={() => setCategory(c)} /> {c}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-ink-900">Max Price: ${maxPrice}</h3>
        <input type="range" min="10" max="3000" step="10" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-brand-500" />
      </div>

      {brands.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold text-ink-900">Brand</h3>
          <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto">
            {brands.map((b) => (
              <label key={b} className="flex items-center gap-2 text-sm text-ink-700">
                <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)} /> {b}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-bold text-ink-900">Minimum Rating</h3>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((r) => (
            <button key={r} onClick={() => setMinRating(r)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${minRating === r ? "bg-brand-500 text-white" : "bg-surface-soft text-ink-700"}`}>
              {r === 0 ? "Any" : `${r}+`}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
        <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} /> In stock only
      </label>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900 sm:text-2xl">{q ? `Results for "${q}"` : category || "All Products"}</h1>
          <p className="text-sm text-ink-500">{total} products found</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field !w-auto !py-2 text-xs">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setShowFilters(true)} className="btn-secondary !py-2 text-xs lg:hidden"><SlidersHorizontal size={14} /> Filters</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">{FiltersPanel}</aside>

        <div>
          {loading ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <EmptyState title="No products match your filters" subtitle="Try adjusting your filters or search term." />
          )}
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-80 overflow-y-auto bg-white p-5 shadow-pop">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-ink-900">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="rounded-full p-1.5 hover:bg-surface-soft" aria-label="Close"><X size={18} /></button>
            </div>
            {FiltersPanel}
          </div>
        </div>
      )}
    </div>
  );
}
