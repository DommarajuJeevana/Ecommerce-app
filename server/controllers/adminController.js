const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");

// @route GET /api/admin/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);

    const [totalUsers, totalOrders, totalProducts, revenueAgg, recentOrders, lowStock, topProductsAgg] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([{ $match: { status: { $ne: "Cancelled" } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(5),
      Product.find({ stock: { $lt: 10 } }).sort({ stock: 1 }).limit(5),
      Product.find().sort({ unitsSold: -1 }).limit(4),
    ]);

    // Trends: compare last 30 days vs prior 30 days
    const [usersRecent, usersPrior, ordersRecent, ordersPrior, revRecentAgg, revPriorAgg] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
      Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Order.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
      Order.aggregate([{ $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: "Cancelled" } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }, status: { $ne: "Cancelled" } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
    ]);

    const pctChange = (curr, prev) => (prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100));

    // Sales graph — last 14 days
    const salesRaw = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(now - 14 * 24 * 60 * 60 * 1000) }, status: { $ne: "Cancelled" } } },
      {
        $group: {
          _id: { $dateToString: { format: "%b %d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const salesGraph = salesRaw.map((d) => ({ date: d._id, revenue: Math.round(d.revenue * 100) / 100 }));

    res.json({
      stats: {
        totalUsers, totalOrders, totalProducts,
        totalRevenue: revenueAgg[0]?.total || 0,
        userTrend: pctChange(usersRecent, usersPrior),
        orderTrend: pctChange(ordersRecent, ordersPrior),
        revenueTrend: pctChange(revRecentAgg[0]?.total || 0, revPriorAgg[0]?.total || 0),
      },
      salesGraph,
      recentOrders,
      lowStock,
      topProducts: topProductsAgg,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
