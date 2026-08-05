import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { EmptyState } from "../components/UIHelpers";

export default function Wishlist() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          subtitle="Save items you love so you can find them easily later."
          action={<Link to="/" className="btn-primary">Discover Products</Link>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <h1 className="mb-8 text-2xl font-extrabold text-ink-900 sm:text-3xl">My Wishlist ({items.length})</h1>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {items.map(({ product: p }) => {
          const price = p.discount > 0 ? p.price - (p.price * p.discount) / 100 : p.price;
          return (
            <div key={p._id} className="card group flex flex-col overflow-hidden hover:shadow-hover">
              <Link to={`/product/${p._id}`} className="relative block aspect-square overflow-hidden bg-surface-soft">
                <img src={p.images?.[0] || "/placeholder.png"} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <Link to={`/product/${p._id}`} className="line-clamp-2 text-sm font-semibold text-ink-900 hover:text-brand-600">{p.name}</Link>
                <span className="text-base font-extrabold text-ink-900">${price.toFixed(2)}</span>
                <div className="mt-1 flex gap-2">
                  <button onClick={() => addToCart(p._id, 1)} className="btn-primary flex-1 !py-2 text-xs"><ShoppingCart size={13} /> Add</button>
                  <button onClick={() => removeFromWishlist(p._id)} className="rounded-full border border-surface-border p-2.5 hover:bg-red-50" aria-label="Remove from wishlist">
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
