import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, ShoppingCart, Eye } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { getImageUrl } from "../api";

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!product) return null;

  const {
    _id, name, brand, price, discount = 0, images = [], rating = 0, reviewCount = 0, stock,
  } = product;

  const finalPrice = discount > 0 ? price - (price * discount) / 100 : price;
  const wishlisted = isWishlisted(_id);

  return (
    <div className="group card relative flex w-full shrink-0 flex-col overflow-hidden hover:-translate-y-1 hover:shadow-hover">
      {/* Badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
        {discount > 0 && (
          <span className="rounded-full bg-deal px-2.5 py-1 text-[11px] font-bold text-white shadow-card">
            -{discount}%
          </span>
        )}
        {stock === 0 && (
          <span className="rounded-full bg-ink-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-card">
            Out of stock
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button
        onClick={() => toggleWishlist(_id)}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-card backdrop-blur transition-transform hover:scale-110"
      >
        <Heart size={17} className={wishlisted ? "fill-deal text-deal" : "text-ink-500"} />
      </button>

      {/* Image */}
      <Link to={`/product/${_id}`} className="relative block aspect-square overflow-hidden bg-surface-soft">
        {!imgLoaded && <div className="skeleton absolute inset-0" />}
        <img
          src={getImageUrl(images[0])}
          alt={name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/placeholder.png";
            setImgLoaded(true);
          }}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            onQuickView?.(product);
          }}
          className="absolute inset-x-3 bottom-3 flex translate-y-12 items-center justify-center gap-2 rounded-full bg-white/95 py-2.5 text-xs font-semibold text-ink-900 opacity-0 shadow-card backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Eye size={14} /> Quick View
        </button>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-300">{brand}</span>
        <Link to={`/product/${_id}`} className="line-clamp-2 min-h-[2.6em] text-sm font-semibold text-ink-900 hover:text-brand-600">
          {name}
        </Link>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={13} className={i < Math.round(rating) ? "fill-amber-400" : "fill-transparent text-ink-300"} />
            ))}
          </div>
          <span className="text-xs text-ink-500">({reviewCount})</span>
        </div>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-ink-900">${finalPrice.toFixed(2)}</span>
          {discount > 0 && <span className="text-sm text-ink-300 line-through">${price.toFixed(2)}</span>}
        </div>

        <button
          onClick={() => addToCart(_id, 1)}
          disabled={stock === 0}
          className="btn-primary mt-2 w-full !py-2.5 text-xs"
        >
          <ShoppingCart size={15} /> Add to Cart
        </button>
      </div>
    </div>
  );
}
