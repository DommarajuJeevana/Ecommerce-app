import { useEffect, useState } from "react";
import axios from "axios";

function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data } = await axios.get(
      "http://localhost:5000/api/orders",
      {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
    );

    setOrders(data);
  };

  const updateStatus = async (
    id,
    status
  ) => {
    await axios.put(
      `http://localhost:5000/api/orders/${id}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
    );

    fetchOrders();
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">
        Order Management
      </h1>

      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-white p-5 rounded shadow mb-4"
        >
          <p>
            User: {order.user?.name}
          </p>

          <p>
            Total: ₹{order.totalPrice}
          </p>

          <p>
            Status: {order.orderStatus}
          </p>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() =>
                updateStatus(
                  order._id,
                  "Shipped"
                )
              }
              className="bg-yellow-400 px-4 py-2 rounded"
            >
              Shipped
            </button>

            <button
              onClick={() =>
                updateStatus(
                  order._id,
                  "Delivered"
                )
              }
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Delivered
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminOrders;