import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

// Place Order
export const placeOrder = async (
  req,
  res
) => {
  try {
    const cartItems = await Cart.find({
      user: req.user._id,
    }).populate("product");

    if (!cartItems.length) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    const validCartItems =
      cartItems.filter(
        (item) => item.product
      );

    if (!validCartItems.length) {
      return res.status(400).json({
        message:
          "No valid products in cart",
      });
    }

    const totalPrice =
      validCartItems.reduce(
        (acc, item) =>
          acc +
          item.product.price *
            item.quantity,
        0
      );

    const order =
      await Order.create({
        user: req.user._id,

        orderItems:
          validCartItems.map(
            (item) => ({
              product:
                item.product._id,
              quantity:
                item.quantity,
            })
          ),

        totalPrice,

        paymentMethod:
          "Cash on Delivery",

        orderStatus: "Pending",
      });

    await Cart.deleteMany({
      user: req.user._id,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// User Orders
export const getMyOrders =
  async (req, res) => {
    try {
      const orders =
        await Order.find({
          user: req.user._id,
        }).populate(
          "orderItems.product"
        );

      res.json(orders);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

// Admin Orders
export const getAllOrders =
  async (req, res) => {
    try {
      const orders =
        await Order.find()
          .populate("user")
          .populate(
            "orderItems.product"
          );

      res.json(orders);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

// Update Status
export const updateOrderStatus =
  async (req, res) => {
    try {
      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res
          .status(404)
          .json({
            message:
              "Order not found",
          });
      }

      order.orderStatus =
        req.body.status;

      await order.save();

      res.json(order);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };