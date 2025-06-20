const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");
const crypto = require("crypto");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1hr",
  });
};

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "Please enter all fields",
    });
  }
  if (password.length < 8) {
    return res.status(400).json({
      message: "Please enter password with atleast 8 characters",
    });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User with that email already exists",
      });
    }
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({
        message: "Username already taken. Please try different one",
      });
    }

    user = new User({ username, email, password });
    await user.save();
    return res.status(201).json({
      message: "Signup successful! You can login now.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error: ", error);
    res.status(500).json({
      message: "Internal server error while signup",
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "Please enter all fields",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials ",
      });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect password",
      });
    }
    const token = generateToken(user._id);
    res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Server Login error: ", error);
    res.status(500).json({
      message: "Internal Server error during login",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res
      .status(400)
      .json({ message: "Please enter your email address." });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        message: "User with that email does not exist",
      });
    }
    const resetToken = user.getResetPasswordToken();
    console.log(resetToken);
    await user.save({ validateBeforeSave: false });

    // Create reset URL that will be sent to the user
    const resetURL = `${process.env.CLIENT_ORIGIN}/resetPassword/${resetToken}`;
    const message = `
            <h1>You have requested a password reset</h1>
            <p>Please go to this link to reset your password:</p>
            <a href="${resetURL}" clicktracking=off>${resetURL}</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request this, please ignore this email.</p>
        `;
    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Token",
        message,
      });
      res.status(200).json({
        success: true,
        data: "Email sent",
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      console.error("Error while sending email: ", error);
      res.status(500).json({
        success: false,
        message: "Email could not be sent. Please try again later...",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      message: "Internal Server error",
    });
  }
};

exports.resetToken = async (req, res) => {
  const { token } = req.params; 
  const { newPassword } = req.body;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  console.log(resetPasswordToken);

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    console.log(user);

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset  token",
      });
    }

    // set new password
    user.password = req.body.newPassword;

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("Reset Password error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
