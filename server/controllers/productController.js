import Product from "../models/Product.js";

// Create Product
export const createProduct = async (
  req,
  res
) => {
  try {
    const product = await Product.create({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      stock: req.body.stock,
      image: req.body.image,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Products
export const getProducts = async (
  req,
  res
) => {
  try {
    const page =
      Number(req.query.page) || 1;

    const limit = 8;

    const keyword = req.query.keyword
      ? {
          name: {
            $regex:
              req.query.keyword,
            $options: "i",
          },
        }
      : {};

    const category =
      req.query.category
        ? {
            category:
              req.query.category,
          }
        : {};

    const filter = {
      ...keyword,
      ...category,
    };

    const count =
      await Product.countDocuments(
        filter
      );

    const products =
      await Product.find(filter)
        .skip(limit * (page - 1))
        .limit(limit);

    res.json({
      products,
      page,
      pages: Math.ceil(
        count / limit
      ),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Single Product
export const getProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        message:
          "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Product
export const updateProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        message:
          "Product not found",
      });
    }

    product.name =
      req.body.name ||
      product.name;

    product.description =
      req.body.description ||
      product.description;

    product.category =
      req.body.category ||
      product.category;

    product.price =
      req.body.price ||
      product.price;

    product.stock =
      req.body.stock ||
      product.stock;

    product.image =
      req.body.image ||
      product.image;

    const updated =
      await product.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Product
export const deleteProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        message:
          "Product not found",
      });
    }

    await product.deleteOne();

    res.json({
      message:
        "Product deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};