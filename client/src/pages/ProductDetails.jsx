import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, Share2, Star, Minus, Plus, ShoppingCart, Zap, Truck, Edit2, Trash2 } from "lucide-react";
import api from "../api";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import { StarRating } from "../components/UIHelpers";
import toast from "react-hot-toast";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [fbt, setFbt] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("description");
  const [zoomStyle, setZoomStyle] = useState({});
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [editingReview, setEditingReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const imgRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      setActiveImg(0);
      setQty(1);
      const [relRes, fbtRes] = await Promise.allSettled([
        api.get(`/products/${id}/related`),
        api.get(`/products/${id}/frequently-bought-together`),
      ]);
      if (relRes.status === "fulfilled") setRelated(relRes.value.data);
      if (fbtRes.status === "fulfilled") setFbt(fbtRes.value.data);
      // recently viewed tracking
      api.post(`/products/${id}/view`).catch(() => {});
    } catch {
      toast.error("Could not load this product");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [load]);

  const handleMouseMove = (e) => {
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: "scale(1.8)" });
  };
  const resetZoom = () => setZoomStyle({ transform: "scale(1)" });

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      if (editingReview) {
        await api.put(`/products/${id}/reviews/${editingReview}`, reviewForm);
        toast.success("Review updated");
      } else {
        await api.post(`/products/${id}/reviews`, reviewForm);
        toast.success("Review submitted");
      }
      setReviewForm({ rating: 5, comment: "" });
      setEditingReview(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review");
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await api.delete(`/products/${id}/reviews/${reviewId}`);
      toast.success("Review deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete review");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 lg:grid-cols-2 lg:px-8">
        <div className="skeleton aspect-square rounded-2xl" />
        <div className="flex flex-col gap-4">
          <div className="skeleton h-6 w-1/3 rounded" />
          <div className="skeleton h-9 w-3/4 rounded" />
          <div className="skeleton h-24 w-full rounded" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const finalPrice = product.discount > 0 ? product.price - (product.price * product.discount) / 100 : product.price;
  const wishlisted = isWishlisted(product._id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-1.5 text-xs text-ink-500">
        <Link to="/" className="hover:text-brand-600">Home</Link> /
        <Link to={`/search?category=${product.category}`} className="hover:text-brand-600">{product.category}</Link> /
        <span className="text-ink-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div
            ref={imgRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={resetZoom}
            className="relative aspect-square overflow-hidden rounded-2xl border border-surface-border bg-surface-soft"
          >
            <img
              src={product.images?.[activeImg] || "/placeholder.png"}
              alt={product.name}
              style={zoomStyle}
              className="h-full w-full object-cover transition-transform duration-200"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-18 w-18 shrink-0 overflow-hidden rounded-xl border-2 ${i === activeImg ? "border-brand-500" : "border-surface-border"}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wide text-brand-500">{product.brand}</span>
          <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">{product.name}</h1>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className={i < Math.round(product.rating || 0) ? "fill-amber-400" : "fill-transparent text-ink-300"} />
              ))}
            </div>
            <span className="text-sm font-medium text-ink-500">{product.rating?.toFixed(1) || "0.0"} ({product.reviews?.length || 0} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-ink-900">${finalPrice.toFixed(2)}</span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-ink-300 line-through">${product.price.toFixed(2)}</span>
                <span className="rounded-full bg-deal-light px-2.5 py-1 text-xs font-bold text-deal">Save {product.discount}%</span>
              </>
            )}
          </div>

          <p className={`text-sm font-semibold ${product.stock > 0 ? "text-emerald-600" : "text-red-600"}`}>
            {product.stock > 0 ? `In stock — ${product.stock} available` : "Out of stock"}
          </p>

          <p className="text-sm leading-relaxed text-ink-500">{product.description}</p>

          <div className="flex items-center gap-2 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-700">
            <Truck size={17} className="text-brand-500" /> Free delivery on orders over $50 — estimated 2-3 business days
          </div>

          {/* Quantity + actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-surface-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:bg-surface-soft" aria-label="Decrease quantity"><Minus size={15} /></button>
              <span className="w-10 text-center text-sm font-bold">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="p-3 hover:bg-surface-soft" aria-label="Increase quantity"><Plus size={15} /></button>
            </div>
            <button onClick={() => toggleWishlist(product._id)} className="btn-secondary !px-4">
              <Heart size={16} className={wishlisted ? "fill-deal text-deal" : ""} />
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                toast.success("Link copied to clipboard");
              }}
              className="btn-secondary !px-4"
            >
              <Share2 size={16} />
            </button>
          </div>

          <div className="flex gap-3">
            <button disabled={product.stock === 0} onClick={() => addToCart(product._id, qty)} className="btn-primary flex-1">
              <ShoppingCart size={16} /> Add to Cart
            </button>
            <Link to="/checkout" onClick={() => addToCart(product._id, qty)} className="btn-secondary flex-1 !border-ink-900 !bg-ink-900 !text-white hover:!bg-ink-700">
              <Zap size={16} /> Buy Now
            </Link>
          </div>
        </div>
      </div>

      {/* Frequently bought together */}
      {fbt.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-5 text-xl font-extrabold text-ink-900">Frequently Bought Together</h2>
          <div className="flex flex-wrap gap-4">
            {fbt.map((p) => (
              <div key={p._id} className="w-48"><ProductCard product={p} /></div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-16 border-b border-surface-border">
        <div className="flex gap-8">
          {["description", "specifications", "reviews"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-2 pb-3 text-sm font-bold capitalize transition-colors ${tab === t ? "border-brand-500 text-brand-600" : "border-transparent text-ink-500 hover:text-ink-900"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="py-8">
        {tab === "description" && <p className="max-w-3xl text-sm leading-relaxed text-ink-700">{product.description}</p>}

        {tab === "specifications" && (
          <div className="max-w-2xl divide-y divide-surface-border rounded-xl border border-surface-border">
            {Object.entries(product.specifications || {}).map(([k, v]) => (
              <div key={k} className="flex justify-between px-4 py-3 text-sm">
                <span className="font-medium text-ink-500">{k}</span>
                <span className="font-semibold text-ink-900">{v}</span>
              </div>
            ))}
            {!product.specifications || Object.keys(product.specifications).length === 0 ? (
              <p className="px-4 py-6 text-sm text-ink-500">No specifications listed.</p>
            ) : null}
          </div>
        )}

        {tab === "reviews" && (
          <div className="max-w-2xl">
            {isAuthenticated && (
              <form onSubmit={submitReview} className="card mb-8 p-5">
                <h3 className="mb-3 text-sm font-bold text-ink-900">{editingReview ? "Edit your review" : "Write a review"}</h3>
                <StarRating value={reviewForm.rating} onChange={(v) => setReviewForm({ ...reviewForm, rating: v })} size={20} />
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your thoughts about this product..."
                  rows={3}
                  className="input-field mt-3"
                />
                <div className="mt-3 flex gap-2">
                  <button type="submit" className="btn-primary !px-5 !py-2 text-xs">{editingReview ? "Update" : "Submit"} Review</button>
                  {editingReview && (
                    <button type="button" onClick={() => { setEditingReview(null); setReviewForm({ rating: 5, comment: "" }); }} className="btn-secondary !px-5 !py-2 text-xs">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}

            <div className="flex flex-col gap-5">
              {(product.reviews || []).map((r) => (
                <div key={r._id} className="border-b border-surface-border pb-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-ink-900">{r.user?.name || "Anonymous"}</p>
                      <StarRating value={r.rating} size={13} />
                    </div>
                    {r.user?._id === user?._id && (
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingReview(r._id); setReviewForm({ rating: r.rating, comment: r.comment }); }} className="rounded-full p-2 hover:bg-surface-soft" aria-label="Edit review"><Edit2 size={14} /></button>
                        <button onClick={() => deleteReview(r._id)} className="rounded-full p-2 hover:bg-red-50" aria-label="Delete review"><Trash2 size={14} className="text-red-500" /></button>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-ink-700">{r.comment}</p>
                </div>
              ))}
              {(!product.reviews || product.reviews.length === 0) && (
                <p className="text-sm text-ink-500">No reviews yet. Be the first to share your thoughts!</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-4">
          <h2 className="mb-5 text-xl font-extrabold text-ink-900">Related Products</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
