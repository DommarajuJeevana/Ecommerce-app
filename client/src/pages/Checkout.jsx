import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Truck, MapPin, CheckCircle2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import toast from "react-hot-toast";

export default function Checkout() {
  const { items, totals, coupon, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user?.name || "", phone: user?.phone || "", street: "", city: "", state: "", zip: "", country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setPlacing(true);
    try {
      const { data } = await api.post("/orders", {
        items: items.map((i) => ({ product: i.product._id, quantity: i.quantity, price: i.product.price })),
        shippingAddress: address,
        paymentMethod,
        couponCode: coupon?.code,
        totals,
      });
      await clearCart();
      toast.success("Order placed successfully!");
      navigate(`/orders`, { state: { newOrderId: data._id } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <h1 className="mb-8 text-2xl font-extrabold text-ink-900 sm:text-3xl">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Shipping */}
          <div className="card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-ink-900"><MapPin size={17} className="text-brand-500" /> Shipping Address</h2>
            <div className="grid grid-cols-2 gap-4">
              <input required value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} placeholder="Full name" className="input-field col-span-2" />
              <input required value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} placeholder="Phone number" className="input-field col-span-2" />
              <input required value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="Street address" className="input-field col-span-2" />
              <input required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="City" className="input-field" />
              <input required value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} placeholder="State" className="input-field" />
              <input required value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} placeholder="ZIP code" className="input-field" />
              <input required value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} placeholder="Country" className="input-field" />
            </div>
          </div>

          {/* Payment */}
          <div className="card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-ink-900"><CreditCard size={17} className="text-brand-500" /> Payment Method</h2>
            <div className="flex flex-col gap-2">
              {[
                { id: "card", label: "Credit / Debit Card" },
                { id: "paypal", label: "PayPal" },
                { id: "cod", label: "Cash on Delivery" },
              ].map((m) => (
                <label key={m.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-medium ${paymentMethod === m.id ? "border-brand-500 bg-brand-50" : "border-surface-border"}`}>
                  <input type="radio" name="payment" checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="accent-brand-500" />
                  {m.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-surface-soft px-4 py-3 text-sm text-ink-600">
            <Truck size={16} className="text-brand-500" /> Estimated delivery: 2-3 business days after order confirmation
          </div>
        </div>

        {/* Summary */}
        <div className="card h-fit p-6">
          <h2 className="mb-4 text-base font-bold text-ink-900">Order Summary</h2>
          <div className="flex flex-col gap-3 border-b border-surface-border pb-4">
            {items.map((i) => (
              <div key={i.product._id} className="flex justify-between text-sm">
                <span className="line-clamp-1 text-ink-700">{i.product.name} × {i.quantity}</span>
                <span className="font-semibold text-ink-900">${(i.product.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 py-4 text-sm">
            <div className="flex justify-between text-ink-500"><span>Subtotal</span><span className="font-semibold text-ink-900">${totals.subtotal.toFixed(2)}</span></div>
            {totals.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span className="font-semibold">-${totals.discount.toFixed(2)}</span></div>}
            <div className="flex justify-between text-ink-500"><span>Tax</span><span className="font-semibold text-ink-900">${totals.tax.toFixed(2)}</span></div>
            <div className="flex justify-between text-ink-500"><span>Shipping</span><span className="font-semibold text-ink-900">{totals.shipping === 0 ? "Free" : `$${totals.shipping.toFixed(2)}`}</span></div>
          </div>
          <div className="flex justify-between border-t border-surface-border pt-4 text-base font-extrabold text-ink-900">
            <span>Grand Total</span><span>${totals.total.toFixed(2)}</span>
          </div>
          <button type="submit" disabled={placing} className="btn-primary mt-5 w-full">
            <CheckCircle2 size={16} /> {placing ? "Placing order..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
