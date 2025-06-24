const express = require("express");
const router = express.Router();
const User = require("../models/User");
const multer = require("multer"); 
const path = require("path");
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
  updateProfile,
} = require("../controllers/authController");
const {protect} = require("../middlewares/authMiddleware");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null, "uploads/")
  },
  filename: (req, file, cb)=>{
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
  }
});

const upload = multer({
  storage: storage
});

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.put("/resetPassword/:token", resetToken);

router.post("/mfa/setup-init", protect, initiateMfaSetup);
router.post("/mfa/setup-complete", protect, completeMFASetup);
router.post("/mfa/disable", protect, disableMFA);

router.put("/profile", protect, upload.single("profilePicture"), updateProfile)


module.exports = router;
