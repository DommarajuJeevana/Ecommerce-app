const PDFDocument = require("pdfkit");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

// @route POST /api/orders
const placeOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, totals } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cannot place an order with no items" });
    }

    // Validate stock and compute price server-side for integrity
    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: "One or more products were not found" });
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      const linePrice = product.discount > 0 ? product.price - (product.price * product.discount) / 100 : product.price;
      subtotal += linePrice * item.quantity;
    }

    const discount = totals?.discount || 0;
    const tax = totals?.tax ?? subtotal * 0.08;
    const shipping = totals?.shipping ?? (subtotal > 50 ? 0 : 5.99);
    const total = subtotal - discount + tax + shipping;

    const order = await Order.create({
      user: req.user._id,
      items: items.map((i) => ({ product: i.product, quantity: i.quantity, price: i.price })),
      shippingAddress,
      paymentMethod,
      couponCode,
      subtotal, discount, tax, shipping, total,
      status: "Pending",
    });

    // Decrement stock and bump unitsSold
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, unitsSold: item.quantity },
      });
    }

    // Clear the user's cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: undefined });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/orders/my-orders
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("items.product").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/orders/:id/invoice
const getInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product").populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this invoice" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${order._id}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(20).text("NexoraStore", { align: "left" });
    doc.fontSize(10).fillColor("#666").text("Invoice", { align: "left" });
    doc.moveDown();
    doc.fillColor("#000").fontSize(11).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Customer: ${order.user.name} (${order.user.email})`);
    doc.moveDown();

    doc.fontSize(12).text("Items", { underline: true });
    doc.moveDown(0.5);
    order.items.forEach((item) => {
      doc.fontSize(10).text(
        `${item.product?.name || "Product"}  x${item.quantity}   $${(item.price * item.quantity).toFixed(2)}`
      );
    });

    doc.moveDown();
    doc.fontSize(11).text(`Subtotal: $${order.subtotal.toFixed(2)}`);
    doc.text(`Discount: -$${order.discount.toFixed(2)}`);
    doc.text(`Tax: $${order.tax.toFixed(2)}`);
    doc.text(`Shipping: $${order.shipping.toFixed(2)}`);
    doc.fontSize(13).text(`Total: $${order.total.toFixed(2)}`, { underline: true });

    doc.end();
  } catch (err) {
    next(err);
  }
};

// ---------- Admin ----------

// @route GET /api/admin/orders
const adminGetOrders = async (req, res, next) => {
  try {
    const { search = "", status = "", page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    let query = Order.find(filter).populate("user", "name email").sort({ createdAt: -1 });

    let orders = await query;
    if (search) {
      const s = search.toLowerCase();
      orders = orders.filter(
        (o) => o._id.toString().toLowerCase().includes(s) || o.user?.name?.toLowerCase().includes(s) || o.user?.email?.toLowerCase().includes(s)
      );
    }

    const total = orders.length;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const paginated = orders.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({ orders: paginated, total });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/admin/orders/:id/status
const adminUpdateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!valid.includes(status)) return res.status(400).json({ message: "Invalid status value" });

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

module.exports = { placeOrder, getMyOrders, getInvoice, adminGetOrders, adminUpdateStatus };
