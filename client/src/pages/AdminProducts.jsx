import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit2, Trash2, X, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import api, { getImageUrl } from "../api";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  name: "", brand: "", category: "Laptops", description: "", price: "", discount: "0", stock: "",
  specifications: [{ key: "", value: "" }],
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/products", {
        params: { page, limit, search, category: categoryFilter },
      });
      setProducts(data.products);
      setTotal(data.total);
    } catch {
      toast.error("Could not load products");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImages([]);
    setExistingImages([]);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name, brand: p.brand, category: p.category, description: p.description,
      price: p.price, discount: p.discount || "0", stock: p.stock,
      specifications: Object.entries(p.specifications || {}).map(([key, value]) => ({ key, value })) || [{ key: "", value: "" }],
    });
    setExistingImages(p.images || []);
    setImages([]);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("brand", form.brand);
      fd.append("category", form.category);
      fd.append("description", form.description);
      fd.append("price", form.price);
      fd.append("discount", form.discount);
      fd.append("stock", form.stock);
      const specs = {};
      form.specifications.forEach(({ key, value }) => { if (key) specs[key] = value; });
      fd.append("specifications", JSON.stringify(specs));
      images.forEach((img) => fd.append("images", img));
      if (editingId) fd.append("existingImages", JSON.stringify(existingImages));

      if (editingId) {
        await api.put(`/admin/products/${editingId}`, fd, { headers: { "Content-Type": undefined } });
        toast.success("Product updated");
      } else {
        await api.post("/admin/products", fd, { headers: { "Content-Type": undefined } });
        toast.success("Product created");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success("Product deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete product");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">Products</h1>
          <p className="text-sm text-ink-500">{total} total products</p>
        </div>
        <button onClick={openCreate} className="btn-primary !py-2.5 text-sm"><Plus size={16} /> Add Product</button>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search products..." className="input-field pl-11" />
        </div>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="input-field w-auto">
          <option value="">All Categories</option>
          {["Laptops", "Phones", "Tablets", "Accessories", "Gaming", "Audio"].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-soft text-left text-xs font-bold uppercase tracking-wide text-ink-500">
              <th className="px-5 py-3.5">Product</th>
              <th className="px-5 py-3.5">Category</th>
              <th className="px-5 py-3.5">Price</th>
              <th className="px-5 py-3.5">Stock</th>
              <th className="px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {products.map((p) => (
              <tr key={p._id} className="hover:bg-surface-soft/50">
                <td className="flex items-center gap-3 px-5 py-3.5">
                  <img src={getImageUrl(p.images?.[0])} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <div>
                    <p className="line-clamp-1 font-semibold text-ink-900">{p.name}</p>
                    <p className="text-xs text-ink-500">{p.brand}</p>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-ink-700">{p.category}</td>
                <td className="px-5 py-3.5 font-semibold text-ink-900">${p.price?.toFixed(2)}</td>
                <td className="px-5 py-3.5">
                  <span className={p.stock < 10 ? "font-bold text-red-600" : "text-ink-700"}>{p.stock}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)} className="rounded-lg p-2 hover:bg-surface-soft" aria-label="Edit"><Edit2 size={15} /></button>
                    <button onClick={() => handleDelete(p._id)} className="rounded-lg p-2 hover:bg-red-50" aria-label="Delete"><Trash2 size={15} className="text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && products.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-ink-500">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-5 flex items-center justify-between text-sm">
        <span className="text-ink-500">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary !px-3 !py-2 disabled:opacity-40"><ChevronLeft size={15} /></button>
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary !px-3 !py-2 disabled:opacity-40"><ChevronRight size={15} /></button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/40 p-4">
          <div className="my-8 w-full max-w-2xl animate-fadeUp rounded-2xl bg-white p-6 shadow-pop sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink-900">{editingId ? "Edit Product" : "Add New Product"}</h2>
              <button onClick={() => setShowModal(false)} className="rounded-full p-2 hover:bg-surface-soft" aria-label="Close"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="input-field col-span-2" />
                <input required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Brand" className="input-field" />
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                  {["Laptops", "Phones", "Tablets", "Accessories", "Gaming", "Audio"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price ($)" className="input-field" />
                <input type="number" min="0" max="100" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="Discount (%)" className="input-field" />
                <input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock quantity" className="input-field col-span-2" />
              </div>

              <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="input-field" />

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink-700">Specifications</label>
                {form.specifications.map((spec, i) => (
                  <div key={i} className="mb-2 flex gap-2">
                    <input
                      value={spec.key}
                      onChange={(e) => {
                        const specs = [...form.specifications];
                        specs[i].key = e.target.value;
                        setForm({ ...form, specifications: specs });
                      }}
                      placeholder="e.g. RAM"
                      className="input-field !py-2 text-xs"
                    />
                    <input
                      value={spec.value}
                      onChange={(e) => {
                        const specs = [...form.specifications];
                        specs[i].value = e.target.value;
                        setForm({ ...form, specifications: specs });
                      }}
                      placeholder="e.g. 16GB"
                      className="input-field !py-2 text-xs"
                    />
                  </div>
                ))}
                <button type="button" onClick={() => setForm({ ...form, specifications: [...form.specifications, { key: "", value: "" }] })} className="text-xs font-semibold text-brand-600 hover:underline">
                  + Add specification
                </button>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink-700">Images</label>
                {existingImages.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {existingImages.map((img, i) => (
                      <div key={i} className="relative h-16 w-16">
                        <img src={getImageUrl(img)} alt="" className="h-full w-full rounded-lg object-cover" />
                        <button type="button" onClick={() => setExistingImages(existingImages.filter((_, idx) => idx !== i))} className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white">
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-surface-border py-4 text-xs font-semibold text-ink-500 hover:border-brand-300 hover:text-brand-600">
                  <Upload size={15} /> {images.length > 0 ? `${images.length} file(s) selected` : "Upload images"}
                  <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => setImages(Array.from(e.target.files))} />
                </label>
              </div>

              <div className="mt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary !py-2.5">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary !py-2.5">{saving ? "Saving..." : editingId ? "Update Product" : "Create Product"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
