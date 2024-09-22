const express = require("express");
const {
  createOrder,
  getAPIKey,
  verifyPayment,
} = require("../controllers/orderController");
const { auth } = require("../middlewares/auth");

const router = express.Router();

router.post("/create-order", auth, createOrder);
router.get("/get-key", auth, getAPIKey);
router.post("/verify-payment", verifyPayment);

module.exports = router;
