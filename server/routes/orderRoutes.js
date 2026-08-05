const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { placeOrder, getMyOrders, getInvoice } = require("../controllers/orderController");

console.log("protect:", protect);
console.log("placeOrder:", placeOrder);
console.log("getMyOrders:", getMyOrders);
console.log("getInvoice:", getInvoice);

router.use(protect);

router.post("/", placeOrder);
router.get("/my-orders", getMyOrders);
router.get("/:id/invoice", getInvoice);

module.exports = router;
