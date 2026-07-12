const express = require("express");
const router = express.Router();
const User = require("../models/user");

const bcrypt = require("bcryptjs");

// SIGNUP
router.post("/", async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    // validation
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    return res.status(201).json({
      message: "Signup successful"
    });

  } catch (error) {
    console.log("Signup error:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router;
