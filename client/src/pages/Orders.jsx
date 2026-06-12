import { useEffect, useState } from "react";
import axios from "axios";

function Orders() {
  const [orders, setOrders] =
    useState([]);

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/orders/myorders",
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      setOrders(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        My Orders
      </h1>

      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-white p-5 rounded shadow mb-4"
        >
          <p>
            Order ID: {order._id}
          </p>

          <p>
            Total: ₹
            {order.totalPrice}
          </p>

          <p>
            Payment:{" "}
            {order.paymentMethod}
          </p>

          <p>
            Status:{" "}
            {order.orderStatus ||
              "Pending"}
          </p>

        </div>
      ))}
    </div>
  );
}

export default Orders;