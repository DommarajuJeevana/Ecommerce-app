const express = require("express");
const router = express.Router();
const {
  getProducts, suggestProducts, getRecommended, getProductById,
  trackView, getRelated, getFrequentlyBoughtTogether,
} = require("../controllers/productController");
const reviewRoutes = require("./reviewRoutes");

// Optional auth — attaches req.user if a valid token is present, but doesn't require it
const optionalAuth = async (req, res, next) => {
  if (!req.headers.authorization) return next();
  try {
    const jwt = require("jsonwebtoken");
    const User = require("../models/User");
    const decoded = jwt.verify(req.headers.authorization.split(" ")[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
  } catch {
    /* ignore invalid token for optional auth */
  }
  next();
};

router.get("/suggest", suggestProducts);
router.get("/recommended", getRecommended);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/:id/view", optionalAuth, trackView);
router.get("/:id/related", getRelated);
router.get("/:id/frequently-bought-together", getFrequentlyBoughtTogether);

// Reviews — delegated to reviewRoutes.js (mergeParams gives it :productId)
router.use("/:productId/reviews", reviewRoutes);

module.exports = router;
