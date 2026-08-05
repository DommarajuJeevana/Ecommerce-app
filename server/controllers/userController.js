const User = require("../models/User");
const Order = require("../models/Order");

// @route PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };

    await user.save();
    res.json({
      _id: user._id, name: user.name, email: user.email, phone: user.phone,
      role: user.role, avatar: user.avatar, address: user.address,
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/users/avatar
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image file provided" });
    const user = await User.findById(req.user._id);
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();
    res.json({ avatar: user.avatar });
  } catch (err) {
    next(err);
  }
};

// ---------- Admin ----------

// @route GET /api/admin/users
const adminGetUsers = async (req, res, next) => {
  try {
    const { search = "" } = req.query;
    const filter = search
      ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
      : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/admin/users/:id/role
const adminUpdateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'user' or 'admin'" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/admin/users/:id
const adminDeleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/admin/users/:id/orders
const adminGetUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

module.exports = { updateProfile, uploadAvatar, adminGetUsers, adminUpdateRole, adminDeleteUser, adminGetUserOrders };
