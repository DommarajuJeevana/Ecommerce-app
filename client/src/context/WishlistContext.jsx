import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.get("/wishlist");
      setItems(data.items || []);
    } catch {
      /* noop */
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isWishlisted = useCallback(
    (productId) => items.some((i) => (i.product?._id || i.product) === productId),
    [items]
  );

  const toggleWishlist = useCallback(
    async (productId) => {
      if (!isAuthenticated) {
        toast.error("Please log in to use your wishlist");
        return;
      }
      try {
        if (isWishlisted(productId)) {
          const { data } = await api.delete(`/wishlist/${productId}`);
          setItems(data.items);
          toast.success("Removed from wishlist");
        } else {
          const { data } = await api.post("/wishlist", { productId });
          setItems(data.items);
          toast.success("Added to wishlist");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Could not update wishlist");
      }
    },
    [isAuthenticated, isWishlisted]
  );

  const removeFromWishlist = useCallback(async (productId) => {
    try {
      const { data } = await api.delete(`/wishlist/${productId}`);
      setItems(data.items);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove item");
    }
  }, []);

  return (
    <WishlistContext.Provider value={{ items, isWishlisted, toggleWishlist, removeFromWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
