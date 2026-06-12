import express from "express";

import {
  addWishlist,
  getWishlist,
  removeWishlist,
  moveToCart,
} from "../controllers/wishlistController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addWishlist);

router.get("/", protect, getWishlist);

router.delete(
  "/:id",
  protect,
  removeWishlist
);

router.post(
  "/move/:id",
  protect,
  moveToCart
);

export default router;