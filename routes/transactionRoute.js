const express = require("express");
const { auth } = require("../middlewares/auth");
const {
  getTransactions,
  getSingleTransaction,
} = require("../controllers/transactionController");

const router = express.Router();

router.get("/get-transactions", auth, getTransactions);
router.get("/get-transaction/:id", auth, getSingleTransaction);

module.exports = router;