const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    adminDescription: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "Other",
    },
    type: {
      type: String,
      enum: ["lost", "found"],
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "pending", "claimed", "resolved"],
      default: "available",
    },
    location: {
      type: String,
      required: true,
    },
    dateOccurred: {
      type: Date,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    owner: {
      name: {
        type: String,
        default: "",
      },
      email: {
        type: String,
        default: "",
      },
    },
    claimed: {
      type: Boolean,
      default: false,
    },
    claimer: {
      name: {
        type: String,
        default: "",
      },
      phone: {
        type: String,
        default: "",
      },
      description: {
        type: String,
        default: "",
      },
    },
  },
  { timestamps: true }
);


module.exports = mongoose.models.Report || mongoose.model("Report", reportSchema);
