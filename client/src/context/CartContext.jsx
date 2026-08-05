import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import api from "../api";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setItems(data.items || []);
      setSavedItems(data.savedForLater || []);
      setCoupon(data.coupon || null);
    } catch {
      // silent fail — cart may just be empty
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      if (!isAuthenticated) {
        toast.error("Please log in to add items to your cart");
        return;
      }
      try {
        const { data } = await api.post("/cart", { productId, quantity });
        setItems(data.items);
        toast.success("Added to cart");
      } catch (err) {
        toast.error(err.response?.data?.message || "Could not add to cart");
      }
    },
    [isAuthenticated]
  );

  const updateQuantity = useCallback(async (productId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${productId}`, { quantity });
      setItems(data.items);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update quantity");
    }
  }, []);

  const removeFromCart = useCallback(async (productId) => {
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      setItems(data.items);
      toast.success("Removed from cart");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove item");
    }
  }, []);

  const saveForLater = useCallback(async (productId) => {
    try {
      const { data } = await api.put(`/cart/${productId}/save-for-later`);
      setItems(data.items);
      setSavedItems(data.savedForLater);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save item");
    }
  }, []);

  const moveToCart = useCallback(async (productId) => {
    try {
      const { data } = await api.put(`/cart/${productId}/move-to-cart`);
      setItems(data.items);
      setSavedItems(data.savedForLater);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not move item");
    }
  }, []);

  const applyCoupon = useCallback(async (code) => {
    try {
      const { data } = await api.post("/cart/coupon", { code });
      setCoupon(data.coupon);
      toast.success(`Coupon "${code}" applied`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon code");
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await api.delete("/cart");
      setItems([]);
      setCoupon(null);
    } catch {
      /* noop */
    }
  }, []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
    const discount = coupon ? (coupon.type === "percent" ? subtotal * (coupon.value / 100) : coupon.value) : 0;
    const tax = Math.max(0, (subtotal - discount) * 0.08);
    const shipping = subtotal > 50 || items.length === 0 ? 0 : 5.99;
    const total = Math.max(0, subtotal - discount + tax + shipping);
    return { subtotal, discount, tax, shipping, total, count: items.reduce((n, i) => n + i.quantity, 0) };
  }, [items, coupon]);

  const value = {
    items,
    savedItems,
    coupon,
    loading,
    totals,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    saveForLater,
    moveToCart,
    applyCoupon,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
