const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const { getDashboard } = require("../controllers/adminController");
const {
  adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
} = require("../controllers/productController");
const { adminGetOrders, adminUpdateStatus } = require("../controllers/orderController");
const {
  adminGetUsers, adminUpdateRole, adminDeleteUser, adminGetUserOrders,
} = require("../controllers/userController");

router.use(protect, adminOnly);

// Dashboard
router.get("/dashboard", getDashboard);

// Products
router.get("/products", adminGetProducts);
router.post("/products", upload.array("images", 6), adminCreateProduct);
router.put("/products/:id", upload.array("images", 6), adminUpdateProduct);
router.delete("/products/:id", adminDeleteProduct);

// Orders
router.get("/orders", adminGetOrders);
router.put("/orders/:id/status", adminUpdateStatus);

// Users
router.get("/users", adminGetUsers);
router.put("/users/:id/role", adminUpdateRole);
router.delete("/users/:id", adminDeleteUser);
router.get("/users/:id/orders", adminGetUserOrders);

module.exports = router;
