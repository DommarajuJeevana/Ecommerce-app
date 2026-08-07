import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, Heart, Tag, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../api";
import { EmptyState } from "../components/UIHelpers";

export default function Cart() {
  const { items, savedItems, totals, updateQuantity, removeFromCart, saveForLater, moveToCart, applyCoupon, coupon } = useCart();
  const [couponCode, setCouponCode] = useState("");

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          subtitle="Looks like you haven't added anything yet. Let's fix that."
          action={<Link to="/" className="btn-primary">Start Shopping</Link>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <h1 className="mb-8 text-2xl font-extrabold text-ink-900 sm:text-3xl">Your Cart</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {items.map((item) => {
            const p = item.product;
            const price = p.discount > 0 ? p.price - (p.price * p.discount) / 100 : p.price;
            return (
              <div key={p._id} className="card flex gap-4 p-4">
                <Link to={`/product/${p._id}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-soft">
                  <img src={getImageUrl(p.images?.[0])} alt={p.name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/product/${p._id}`} className="text-sm font-bold text-ink-900 hover:text-brand-600">{p.name}</Link>
                      <p className="text-xs text-ink-500">{p.brand}</p>
                    </div>
                    <span className="text-base font-extrabold text-ink-900">${(price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-surface-border">
                      <button onClick={() => updateQuantity(p._id, Math.max(1, item.quantity - 1))} className="p-2 hover:bg-surface-soft" aria-label="Decrease quantity"><Minus size={13} /></button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(p._id, item.quantity + 1)} className="p-2 hover:bg-surface-soft" aria-label="Increase quantity"><Plus size={13} /></button>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold text-ink-500">
                      <button onClick={() => saveForLater(p._id)} className="flex items-center gap-1 hover:text-brand-600">
                        <Heart size={13} /> Save for later
                      </button>
                      <button onClick={() => removeFromCart(p._id)} className="flex items-center gap-1 hover:text-red-600">
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {savedItems.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-sm font-bold text-ink-900">Saved for Later ({savedItems.length})</h2>
              <div className="flex flex-col gap-3">
                {savedItems.map((item) => {
                  const p = item.product;
                  return (
                    <div key={p._id} className="card flex items-center gap-4 p-3">
                      <img src={getImageUrl(p.images?.[0])} alt={p.name} className="h-16 w-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-ink-900">{p.name}</p>
                        <p className="text-xs text-ink-500">${p.price.toFixed(2)}</p>
                      </div>
                      <button onClick={() => moveToCart(p._id)} className="btn-secondary !px-4 !py-1.5 text-xs">Move to Cart</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="card h-fit p-6">
          <h2 className="mb-4 text-base font-bold text-ink-900">Order Summary</h2>

          <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Coupon code"
                className="input-field pl-10 !py-2.5 text-xs"
              />
            </div>
            <button onClick={() => applyCoupon(couponCode)} className="btn-secondary !px-4 text-xs">Apply</button>
          </div>
          {coupon && <p className="mb-4 text-xs font-semibold text-emerald-600">Coupon "{coupon.code}" applied ✓</p>}

          <div className="flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between text-ink-500"><span>Subtotal</span><span className="font-semibold text-ink-900">${totals.subtotal.toFixed(2)}</span></div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-emerald-600"><span>Discount</span><span className="font-semibold">-${totals.discount.toFixed(2)}</span></div>
            )}
            <div className="flex justify-between text-ink-500"><span>Tax</span><span className="font-semibold text-ink-900">${totals.tax.toFixed(2)}</span></div>
            <div className="flex justify-between text-ink-500"><span>Shipping</span><span className="font-semibold text-ink-900">{totals.shipping === 0 ? "Free" : `$${totals.shipping.toFixed(2)}`}</span></div>
          </div>

          <div className="my-4 border-t border-surface-border" />
          <div className="flex justify-between text-base font-extrabold text-ink-900">
            <span>Grand Total</span><span>${totals.total.toFixed(2)}</span>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-lg bg-surface-soft px-3 py-2.5 text-xs text-ink-500">
            <Truck size={14} className="text-brand-500" /> Estimated delivery: 2-3 business days
          </div>

          <Link to="/checkout" className="btn-primary mt-5 w-full">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
}
