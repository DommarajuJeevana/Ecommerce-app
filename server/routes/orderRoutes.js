const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { placeOrder, getMyOrders, getInvoice } = require("../controllers/orderController");

router.use(protect);

router.post("/", placeOrder);
router.get("/my-orders", getMyOrders);
router.get("/:id/invoice", getInvoice);

module.exports = router;
