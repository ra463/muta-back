const User = require("../models/User");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const Razorpay = require("razorpay");
const dotenv = require("dotenv");
const crypto = require("crypto");
const { sendInvoice } = require("../utils/sendEmail");

dotenv.config({ path: "../config/config.env" });

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user) return next(new ErrorHandler("User not found", 404));

  const { name, quantity, price, img_url } = req.body;
  if (!name || !quantity || !price || !img_url)
    return next(new ErrorHandler("Please enter all the fields", 400));

  const options = {
    amount: Number(price * 100).toFixed(0), // amount is in paisa (lowest currency unit)
    currency: "INR",
  };

  const order = await instance.orders.create(options);

  const newOrder = new Order({
    user: user._id,
    order_id: order.id,
    product_details: {
      p_name: name,
      p_quantity: quantity,
      p_price: price,
      p_image: img_url,
    },
  });

  await newOrder.save();

  res.status(200).json({
    success: true,
    orderId: order.id,
  });
});

exports.getAPIKey = catchAsyncError(async (req, res, next) => {
  res.status(200).json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

exports.verifyPayment = catchAsyncError(async (req, res, next) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const isAuthentic = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (isAuthentic !== razorpay_signature) {
    const failed_order = await Order.findOne({ order_id: razorpay_order_id });
    const failed_transaction = new Transaction({
      user: failed_order.user,
      order: failed_order._id,
      payment_id: razorpay_payment_id,
      status: "Failed",
    });
    await failed_transaction.save();
    await failed_order.deleteOne();
    return next(new ErrorHandler("Invalid Signature: Payment Failed", 400));
  }

  const order = await Order.findOne({ order_id: razorpay_order_id });
  const user = await User.findById(order.user);

  const transaction = new Transaction({
    user: order.user,
    order: order._id,
    payment_id: razorpay_payment_id,
    status: "Completed",
  });

  order.status = "completed";
  order.razorpay_signature = razorpay_signature;

  await order.save();
  await transaction.save();

  const product = [order.product_details];
  await sendInvoice(product, user.email, user.name);

  res.status(200).json({
    success: true,
  });
});
