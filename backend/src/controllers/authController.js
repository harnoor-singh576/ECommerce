const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");
const crypto = require("crypto");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1hr",
  });
};

// Signup logic
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

// Login logic
exports.login = async (req, res) => {
  const { email, password, mfaToken } = req.body;
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

    // --- MFA logic ---
    if (user.mfaEnabled) {
      if (!mfaToken) {
        return res.status(401).json({
          message: "MFA is enabled. Please provide an MFA token.",
        });
      }
      // Verify the MFA token
      const isMfaValid = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: "base32",
        token: mfaToken,
        window: 1,
      });
      if (!isMfaValid) {
        return res.status(400).json({
          message: "Invalid MFA token. Please try again...",
        });
      }
      //MFA token is valid, proceed with login
      // Generate token and send response
    }
    // User does not have MFA enabled, proceed with normal login
    const token = generateToken(user._id);
    res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mfaEnabled: user.mfaEnabled,
      },
    });
  } catch (error) {
    console.log("Server Login error: ", error);
    res.status(500).json({
      message: "Internal Server error during login",
    });
  }
};

// Logic to initiate MFA setup : GENERATE SECRET AND QR CODE
exports.initiateMfaSetup = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.mfaEnabled) {
      return res.status(400).json({
        message: "MFA is already enabled for this account",
      });
    }

    // Generate a new secret for the user
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `Stylo (${user.email})`,
      symbols: false,
    });

    user.mfaSecret = secret.base32;
    await user.save(); //save the secret

    // Generate QR Code URL for the authenticator app
    const qrCodeURL = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      secret: secret.base32,
      qrCodeURL: qrCodeURL,
      message: "Scan this QR code with your authenticator app.",
    });
  } catch (error) {
    console.error("MFA setup initiation error: ", error);
    res.status(500).json({
      message: "Server error during MFA setup initiation.",
    });
  }
};

// Logic to Complete MFA Setup: VERIFY CODE AND ENABLE MFA
exports.completeMFASetup = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body; //The 6-digit code from an authenticator app

    if (!token) {
      return res.status(400).json({
        message: "Please provide the MFA token.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }
    if (user.mfaEnabled) {
      return res.status(400).json({
        message: "MFA is already enabled for this account.",
      });
    }
    if (!user.mfaSecret) {
      return res.status(400).json({
        message: "MFA setup is not initiated. Please do it first...",
      });
    }

    // Verify the provided token against the stored token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token,
      window: 1, //Allow for small time skew
    });

    if (verified) {
      user.mfaEnabled = true;
      await user.save();
      res.status(200).json({
        message: "MFA Successfully enabled!",
      });
    } else {
      // If the verification fails
      res.status(400).json({
        mfaSecret: null,
        message: "Invalid MFA token. Please try again...",
      });
    }
  } catch (error) {
    console.error("MFA setup completion error: ", error);
    res.status(500).json({
      message: "Server error during MFA setup completion error.",
    });
  }
};

// Logic to disable MFA for a user
exports.disableMFA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found!",
      });
    }
    if (!user.mfaEnabled) {
      return res.status(400).json({
        message: "MFA is not enabled for this account.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect password. Cannot disable MFA.",
      });
    }

    user.mfaEnabled = false;
    user.mfaSecret = null;
    await user.save();
    res.status(200).json({
      message: "MFA Successfully disabled!",
    });
  } catch (error) {
    console.error("MFA disable error: ", error);
    res.status(500).json({
      message: "Internal server error during MFA disable...",
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

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

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


// Update user profile logic
exports.updateProfile = async (req,res) => {
  try {
    const userId = req.user.id;
    const {username, email}  = req.body;
    let profilePicturePath = req.file ? req.file.path : null; //Path of the uploaded file

    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({
        message: "User not found..."
      })
    }

    // Update username if provided and changed
    if(username && username !== user.username){
      const existingUsername = await User.findOne({username});
      if(existingUsername && existingUsername._id.toString() !== userId){
        return res.status(400).json({
          message: "Username already taken. Please try a different one!"
        })
      }

      user.username = username;
    }

    // Update email if provided and changed
    if(email && email !== user.email){
      const existingEmail = await User.findOne({email});
      if(existingEmail && existingEmail._id.toString() !==userId){
        return res.status(400).json({
          message: "Email already exists. Please try a different one!"
        })
      }
      user.email = email;
    }

    // Update profile picture if a new one is uploaded
    if(profilePicturePath){
      user.profilePicture = profilePicturePath.replace(/\\/g, '/');
    }

    await user.save();
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mfaEnabled: user.mfaEnabled,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error("Update profile error: ", error);
    res.status(500).json({
      message: "Internal server error during update profile...."
    })
    
  }
}