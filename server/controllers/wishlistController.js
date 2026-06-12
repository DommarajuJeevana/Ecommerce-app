import Wishlist from "../models/Wishlist.js";
import Cart from "../models/Cart.js";

// Add Wishlist
export const addWishlist = async (
  req,
  res
) => {
  try {
    const { productId } = req.body;

    const existing =
      await Wishlist.findOne({
        user: req.user._id,
        product: productId,
      });

    if (existing) {
      return res.json({
        message: "Already added",
      });
    }

    const wishlist =
      await Wishlist.create({
        user: req.user._id,
        product: productId,
      });

    res.status(201).json(wishlist);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Wishlist
export const getWishlist = async (
  req,
  res
) => {
  try {
    const wishlist =
      await Wishlist.find({
        user: req.user._id,
      }).populate("product");

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Remove Wishlist
export const removeWishlist = async (
  req,
  res
) => {
  try {
    const item =
      await Wishlist.findById(
        req.params.id
      );

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    await item.deleteOne();

    res.json({
      message: "Removed",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Move To Cart
export const moveToCart = async (
  req,
  res
) => {
  try {
    const item =
      await Wishlist.findById(
        req.params.id
      );

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    await Cart.create({
      user: item.user,
      product: item.product,
      quantity: 1,
    });

    await item.deleteOne();

    res.json({
      message:
        "Moved from wishlist to cart",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};