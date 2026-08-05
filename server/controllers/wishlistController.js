const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, items: [] });
  return wishlist;
};

// @route GET /api/wishlist
const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await getOrCreateWishlist(req.user._id);
    await wishlist.populate("items.product");
    res.json(wishlist);
  } catch (err) {
    next(err);
  }
};

// @route POST /api/wishlist
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const wishlist = await getOrCreateWishlist(req.user._id);
    const exists = wishlist.items.some((i) => i.product.toString() === productId);
    if (!exists) wishlist.items.push({ product: productId });
    await wishlist.save();
    await wishlist.populate("items.product");
    res.json(wishlist);
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/wishlist/:productId
const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await getOrCreateWishlist(req.user._id);
    wishlist.items = wishlist.items.filter((i) => i.product.toString() !== req.params.productId);
    await wishlist.save();
    await wishlist.populate("items.product");
    res.json(wishlist);
  } catch (err) {
    next(err);
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
