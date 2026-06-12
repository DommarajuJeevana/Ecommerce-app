import express from "express";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import {
  protect,
  admin,
} from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getProducts);

router.get("/:id", getProduct);

router.post(
  "/",
  protect,
  admin,
  upload.single("image"),
  createProduct
);

router.put(
  "/:id",
  protect,
  admin,
  upload.single("image"),
  updateProduct
);

router.delete(
  "/:id",
  protect,
  admin,
  deleteProduct
);

export default router;