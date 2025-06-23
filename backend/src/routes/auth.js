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
  initiateMfaSetup,
  completeMFASetup,
  disableMFA,
} = require("../controllers/authController");
const {protect} = require("../middlewares/authMiddleware")

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.put("/resetPassword/:token", resetToken);

router.post("/mfa/setup-init", protect, initiateMfaSetup);
router.post("/mfa/setup-complete", protect, completeMFASetup);
router.post("/mfa/disable", protect, disableMFA)


module.exports = router;
