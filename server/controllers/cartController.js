import Cart from "../models/Cart.js";

// Add To Cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const existing = await Cart.findOne({
      user: req.user._id,
      product: productId,
    });

    if (existing) {
      existing.quantity += quantity || 1;

      await existing.save();

      return res.json(existing);
    }

    const cart = await Cart.create({
      user: req.user._id,
      product: productId,
      quantity: quantity || 1,
    });

    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.find({
      user: req.user._id,
    }).populate("product");

    res.json(cart);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Quantity
export const updateCart = async (req, res) => {
  try {
    const item = await Cart.findById(
      req.params.id
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    item.quantity = req.body.quantity;

    await item.save();

    res.json(item);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Remove Item
export const removeCartItem = async (
  req,
  res
) => {
  try {
    const item = await Cart.findById(
      req.params.id
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    await item.deleteOne();

    res.json({
      message: "Removed from cart",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};