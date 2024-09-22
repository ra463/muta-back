const express = require("express");
const {
  registerUser,
  loginUser,
  googleLogin,
  sendForgotPasswordCode,
  validateCode,
  resetPassword,
} = require("../controllers/userController");
const upload = require("../middlewares/multer");

const router = express.Router();

router.post("/register", upload, registerUser);
router.post("/login", loginUser);
router.get("/google-login", googleLogin);
router.post("/send-code", sendForgotPasswordCode);
router.post("/validate-code", validateCode);
router.post("/reset-password", resetPassword);

module.exports = router;
