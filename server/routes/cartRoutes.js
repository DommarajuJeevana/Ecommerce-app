import express from "express";

import {
  addToCart,
  getCart,
  updateCart,
  removeCartItem,
} from "../controllers/cartController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addToCart);

router.get("/", protect, getCart);

router.put(
  "/:id",
  protect,
  updateCart
);

router.delete(
  "/:id",
  protect,
  removeCartItem
);

export default router;