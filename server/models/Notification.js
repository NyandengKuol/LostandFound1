const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Who this notification is for (matched by email)
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    // Optional: also match by username as fallback
    recipientName: {
      type: String,
      default: "",
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["resolve", "general"],
      default: "general",
    },
    // Extra data for the notification
    meta: {
      itemId: { type: String, default: "" },
      itemTitle: { type: String, default: "" },
      pickupLocation: { type: String, default: "" },
      adminMessage: { type: String, default: "" },
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
