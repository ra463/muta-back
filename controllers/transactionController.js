const User = require("../models/User");
const Transaction = require("../models/Transaction");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

exports.getTransactions = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user) return next(new ErrorHandler("User not found", 404));

  const transactions = await Transaction.find({ user: user._id });

  res.status(200).json({
    success: true,
    transactions,
  });
});

exports.getSingleTransaction = catchAsyncError(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id);

  res.status(200).json({
    success: true,
    transaction,
  });
});
