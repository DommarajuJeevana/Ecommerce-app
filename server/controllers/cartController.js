const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [], savedForLater: [] });
  return cart;
};

const populateCart = (cart) =>
  cart.populate("items.product").then((c) => c.populate("savedForLater.product"));

// @route GET /api/cart
const getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    await populateCart(cart);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

// @route POST /api/cart
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock < quantity) return res.status(400).json({ message: "Not enough stock available" });

    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find((i) => i.product.toString() === productId);
    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }
    await cart.save();
    await populateCart(cart);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/cart/:productId
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.find((i) => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: "Item not found in cart" });
    item.quantity = Math.max(1, Number(quantity));
    await cart.save();
    await populateCart(cart);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/cart/:productId
const removeCartItem = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();
    await populateCart(cart);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/cart/:productId/save-for-later
const saveForLater = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    const idx = cart.items.findIndex((i) => i.product.toString() === req.params.productId);
    if (idx === -1) return res.status(404).json({ message: "Item not found in cart" });
    const [item] = cart.items.splice(idx, 1);
    cart.savedForLater.push(item);
    await cart.save();
    await populateCart(cart);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/cart/:productId/move-to-cart
const moveToCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    const idx = cart.savedForLater.findIndex((i) => i.product.toString() === req.params.productId);
    if (idx === -1) return res.status(404).json({ message: "Item not found in saved list" });
    const [item] = cart.savedForLater.splice(idx, 1);
    cart.items.push(item);
    await cart.save();
    await populateCart(cart);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

// @route POST /api/cart/coupon
const applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code?.toUpperCase(), active: true });
    if (!coupon || (coupon.expiresAt && coupon.expiresAt < new Date())) {
      return res.status(400).json({ message: "Invalid or expired coupon code" });
    }
    const cart = await getOrCreateCart(req.user._id);
    cart.coupon = { code: coupon.code, type: coupon.type, value: coupon.value };
    await cart.save();
    res.json({ coupon: cart.coupon });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/cart
const clearCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    cart.coupon = undefined;
    await cart.save();
    res.json({ message: "Cart cleared" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, saveForLater, moveToCart, applyCoupon, clearCart };
