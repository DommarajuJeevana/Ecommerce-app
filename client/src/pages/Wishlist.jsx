import { useEffect, useState } from "react";
import API from "../api";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const { data } = await API.get("/wishlist", {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      setWishlist(data);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  const removeItem = async (id) => {
    try {
      await API.delete(`/wishlist/${id}`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      fetchWishlist();
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  const moveToCart = async (id) => {
    try {
      await API.post(
        `/wishlist/move/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      fetchWishlist();
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Wishlist
      </h1>

      {wishlist.map((item) => (
        <div
          key={item._id}
          className="bg-white p-4 rounded shadow mb-4"
        >
          <h2 className="font-bold">
            {item.product.name}
          </h2>

          <div className="flex gap-3 mt-3">
            <button
              onClick={() => moveToCart(item._id)}
              className="bg-blue-700 text-white px-4 py-2 rounded"
            >
              Move To Cart
            </button>

            <button
              onClick={() => removeItem(item._id)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Wishlist;