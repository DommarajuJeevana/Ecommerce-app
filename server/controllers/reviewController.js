const Product = require("../models/Product");

// @route POST /api/products/:productId/reviews
const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const alreadyReviewed = product.reviews.some((r) => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    product.reviews.push({ user: req.user._id, rating: Number(rating), comment });
    product.recalculateRating();
    await product.save();

    res.status(201).json({ message: "Review added" });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/products/:productId/reviews/:reviewId
const updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own review" });
    }

    review.rating = Number(rating);
    review.comment = comment;
    product.recalculateRating();
    await product.save();

    res.json({ message: "Review updated" });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/products/:productId/reviews/:reviewId
const deleteReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only delete your own review" });
    }

    review.deleteOne();
    product.recalculateRating();
    await product.save();

    res.json({ message: "Review deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { addReview, updateReview, deleteReview };
