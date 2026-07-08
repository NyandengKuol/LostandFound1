const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.isGoogleUser;
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    resetPin: {
      type: String,
      default: null,
    },
    resetPinExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);


module.exports = mongoose.models.User || mongoose.model("User", userSchema);