const express = require("express");
const router = express.Router();
const User = require("../models/User");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const {
  signup,
  login,
  forgotPassword,
  resetToken,
} = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.put("/resetPassword/:token", resetToken);

module.exports = router;
