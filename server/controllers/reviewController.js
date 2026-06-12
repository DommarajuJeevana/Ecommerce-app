import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// Add Review
export const addReview = async (
  req,
  res
) => {
  try {
    const { rating, comment } =
      req.body;

    const productId =
      req.params.productId;

    const purchased =
      await Order.findOne({
        user: req.user._id,
        "orderItems.product":
          productId,
      });

    if (!purchased) {
      return res.status(403).json({
        message:
          "Purchase required before reviewing",
      });
    }

    const existing =
      await Review.findOne({
        user: req.user._id,
        product: productId,
      });

    if (existing) {
      return res.status(400).json({
        message:
          "Review already submitted",
      });
    }

    await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment,
    });

    const reviews =
      await Review.find({
        product: productId,
      });

    const avg =
      reviews.reduce(
        (acc, item) =>
          acc + item.rating,
        0
      ) / reviews.length;

    await Product.findByIdAndUpdate(
      productId,
      {
        rating: avg,
        numReviews:
          reviews.length,
      }
    );

    res.status(201).json({
      message:
        "Review added successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Product Reviews
export const getReviews =
  async (req, res) => {
    try {
      const reviews =
        await Review.find({
          product:
            req.params.productId,
        }).populate(
          "user",
          "name"
        );

      res.json(reviews);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };