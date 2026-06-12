import { useEffect, useState } from "react";
import axios from "axios";

function Cart() {
  const [cartItems, setCartItems] = useState([]);

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const { data } = await axios.get(
        "https://ecommerce-app-otze.onrender.com/api/cart",
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      setCartItems(data);
    } catch (error) {
      console.log(error);
    }
  };

  const removeItem = async (id) => {
    try {
      await axios.delete(
        `https://ecommerce-app-otze.onrender.com/api/cart/${id}`,
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      fetchCart();
    } catch (error) {
      console.log(error);
    }
  };

  const placeOrder = async () => {
    try {
      await axios.post(
        "https://ecommerce-app-otze.onrender.com/api/orders",
        {},
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      alert("Order Placed Successfully");
      fetchCart();
    } catch (error) {
      alert(error.response?.data?.message);
    }
  };

  const total = cartItems.reduce(
    (acc, item) =>
      acc + item.product.price * item.quantity,
    0
  );

  return (
    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        Shopping Cart
      </h1>

      {cartItems.map((item) => (
        <div
          key={item._id}
          className="bg-white p-4 rounded shadow mb-4 flex justify-between"
        >
          <div>
            <h2 className="font-bold">
              {item.product.name}
            </h2>

            <p>
              Qty: {item.quantity}
            </p>

            <p>
              ₹{item.product.price}
            </p>
          </div>

          <button
            onClick={() =>
              removeItem(item._id)
            }
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Remove
          </button>
        </div>
      ))}

      <div className="bg-white p-5 rounded shadow">

        <h2 className="text-2xl font-bold">
          Total: ₹{total}
        </h2>

        <button
          onClick={placeOrder}
          className="mt-4 bg-yellow-400 px-6 py-3 rounded font-semibold"
        >
          Place Order (COD)
        </button>

      </div>

    </div>
  );
}

export default Cart;