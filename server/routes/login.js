const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../utils/mailer");
const axios = require("axios");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// POST /api/login
router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    // 🔥 Check for ADMIN credentials from .env
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Generate a simple token (base64 encoded)
      const token = Buffer.from(`${username}:${password}`).toString("base64");

      return res.status(200).json({
        role: "admin",
        token: token,
        username: username,
        message: "Admin login successful",
      });
    }

    // Regular user login
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (user.isGoogleUser && !user.password) {
      return res.status(400).json({
        message: "This account is registered via Google. Please log in using 'Continue with Google'."
      });
    }

    // Check password & migrate if legacy plain text password
    let isMatch = false;
    const isBcrypt = user.password.startsWith("$2a$") || user.password.startsWith("$2b$");
    if (isBcrypt) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (user.password === password);
      if (isMatch) {
        // Upgrade legacy user password to secure bcrypt hash
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        console.log(`🔒 Upgraded legacy plain-text password for user: ${user.username}`);
      }
    }

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || "user",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

// POST /api/login/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Security practice: do not leak if email exists or not
      return res.status(200).json({ message: "If an account exists with this email, a reset PIN has been sent." });
    }

    // Generate 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration

    user.resetPin = pin;
    user.resetPinExpires = expiry;
    await user.save();

    // Console logging for easy developer copy-paste
    console.log(`\n🔑 [PASSWORD RESET PIN]`);
    console.log(`   Email: ${email}`);
    console.log(`   PIN: ${pin}`);
    console.log(`   Expires: ${expiry.toLocaleTimeString()}\n`);

    const subject = "Lost & Found - Password Reset Verification PIN";
    const text = `Hello,\n\nYou requested a password reset for your Lost & Found account.\n\nYour 6-digit verification PIN is: ${pin}\n\nThis PIN will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`;
    
    await sendEmail({ to: email, subject, text });

    res.status(200).json({ message: "If an account exists with this email, a reset PIN has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/login/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, pin, password } = req.body;
    if (!email || !pin || !password) {
      return res.status(400).json({ message: "Email, PIN, and new password are required" });
    }

    const user = await User.findOne({
      email,
      resetPin: pin,
      resetPinExpires: { $gt: new Date() } // not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset PIN" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPin = null;
    user.resetPinExpires = null;
    user.isGoogleUser = false; // Reset Google status if they set a password
    await user.save();

    res.status(200).json({ message: "Password reset successful. Please log in with your new password." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/login/google
router.post("/google", async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token) {
      return res.status(400).json({ message: "Google access_token is required" });
    }

    // Verify token with Google
    const googleRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    
    const { email, name, picture, sub } = googleRes.data;

    if (!email) {
      return res.status(400).json({ message: "Google email not found" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      // Generate unique username from email split
      const baseUsername = name ? name.replace(/\s+/g, "_").toLowerCase() : email.split("@")[0];
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      user = new User({
        username,
        email,
        isGoogleUser: true,
        googleId: sub,
        avatar: picture,
        role: "user"
      });
      await user.save();
      console.log(`🌐 Registered new Google User: ${username} (${email})`);
    } else if (!user.googleId) {
      // Link existing account with Google if not already linked
      user.isGoogleUser = true;
      user.googleId = sub;
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }

    // Generate our app's JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Google authentication successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role || "user",
      }
    });
  } catch (error) {
    console.error("Google login error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to authenticate with Google" });
  }
});

module.exports = router;
