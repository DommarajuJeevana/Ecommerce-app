const Product = require("../models/Product");
const User = require("../models/User");

const SORT_MAP = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  popularity: { unitsSold: -1 },
  rating: { rating: -1 },
};

// @route GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const {
      search, category, brands, maxPrice, minRating, inStock,
      featured, deals, sort = "newest", page = 1, limit = 20,
    } = req.query;

    const filter = {};
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (brands) filter.brand = { $in: brands.split(",").filter(Boolean) };
    if (maxPrice) filter.price = { $lte: Number(maxPrice) };
    if (minRating) filter.rating = { $gte: Number(minRating) };
    if (inStock === "true") filter.stock = { $gt: 0 };
    if (featured === "true") filter.featured = true;
    if (deals === "true") filter.discount = { $gt: 0 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));

    const [products, total, availableBrands] = await Promise.all([
      Product.find(filter)
        .sort(SORT_MAP[sort] || SORT_MAP.newest)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Product.countDocuments(filter),
      Product.distinct("brand", category ? { category } : {}),
    ]);

    res.json({ products, total, page: pageNum, pages: Math.ceil(total / limitNum), availableBrands });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/products/suggest?q=
const suggestProducts = async (req, res, next) => {
  try {
    const { q = "" } = req.query;
    if (!q.trim()) return res.json([]);
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ],
    })
      .select("name images category price")
      .limit(8);
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/products/recommended
const getRecommended = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;
    let categories = [];

    if (req.headers.authorization) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(req.headers.authorization.split(" ")[1], process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).populate("recentlyViewed", "category");
        categories = [...new Set((user?.recentlyViewed || []).map((p) => p.category))];
      } catch {
        /* fall through to generic recommendations */
      }
    }

    const filter = categories.length > 0 ? { category: { $in: categories } } : {};
    const products = await Product.find(filter).sort({ rating: -1 }).limit(Number(limit));
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("reviews.user", "name avatar");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// @route POST /api/products/:id/view
const trackView = async (req, res, next) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { recentlyViewed: req.params.id },
      });
      await User.findByIdAndUpdate(req.user._id, {
        $push: { recentlyViewed: { $each: [req.params.id], $position: 0, $slice: 10 } },
      });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/products/:id/related
const getRelated = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const related = await Product.find({ category: product.category, _id: { $ne: product._id } }).limit(8);
    res.json(related);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/products/:id/frequently-bought-together
const getFrequentlyBoughtTogether = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const fbt = await Product.find({ category: product.category, brand: product.brand, _id: { $ne: product._id } }).limit(3);
    res.json(fbt);
  } catch (err) {
    next(err);
  }
};

// ---------- Admin ----------

// @route GET /api/admin/products
const adminGetProducts = async (req, res, next) => {
  try {
    const { search = "", category = "", page = 1, limit = 10 } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    if (category) filter.category = category;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({ products, total });
  } catch (err) {
    next(err);
  }
};

const parseImages = (req) => (req.files || []).map((f) => `/uploads/${f.filename}`);

// @route POST /api/admin/products
const adminCreateProduct = async (req, res, next) => {
  try {
    const { name, brand, category, description, price, discount, stock, specifications } = req.body;
    const product = await Product.create({
      name, brand, category, description,
      price: Number(price), discount: Number(discount) || 0, stock: Number(stock),
      specifications: specifications ? JSON.parse(specifications) : {},
      images: parseImages(req),
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/admin/products/:id
const adminUpdateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { name, brand, category, description, price, discount, stock, specifications, existingImages } = req.body;

    product.name = name ?? product.name;
    product.brand = brand ?? product.brand;
    product.category = category ?? product.category;
    product.description = description ?? product.description;
    if (price !== undefined) product.price = Number(price);
    if (discount !== undefined) product.discount = Number(discount);
    if (stock !== undefined) product.stock = Number(stock);
    if (specifications) product.specifications = JSON.parse(specifications);

    const keptImages = existingImages ? JSON.parse(existingImages) : product.images;
    const newImages = parseImages(req);
    product.images = [...keptImages, ...newImages];

    await product.save();
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/admin/products/:id
const adminDeleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts, suggestProducts, getRecommended, getProductById, trackView,
  getRelated, getFrequentlyBoughtTogether,
  adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
};
