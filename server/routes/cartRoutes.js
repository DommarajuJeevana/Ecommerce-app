const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getCart, addToCart, updateCartItem, removeCartItem,
  saveForLater, moveToCart, applyCoupon, clearCart,
} = require("../controllers/cartController");

router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.delete("/", clearCart);
router.post("/coupon", applyCoupon);
router.put("/:productId", updateCartItem);
router.delete("/:productId", removeCartItem);
router.put("/:productId/save-for-later", saveForLater);
router.put("/:productId/move-to-cart", moveToCart);

module.exports = router;
