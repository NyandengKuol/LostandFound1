const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const User = require("../models/user");
const Notification = require("../models/Notification");
const adminAuth = require("../middleware/adminAuth");
const { SUPPORT_EMAIL, sendEmail } = require("../utils/mailer");
require("dotenv").config();

// ── GET ALL (with optional filters) ──────────────────────
router.get("/", async (req, res) => {
  try {
    const { type, search, status } = req.query;
    let query = {};

    if (type && type !== "all") query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const data = await Report.find(query).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET SINGLE ──
router.get("/:id", async (req, res) => {
  try {
    const item = await Report.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── CREATE REPORT ──
router.post("/", async (req, res) => {
  try {
    const report = new Report(req.body);
    const saved = await report.save();

    sendEmail({
      to: SUPPORT_EMAIL,
      replyTo: saved.owner?.email,
      subject: `New ${saved.type || "item"} report: ${saved.title}`,
      text: [
        `A new ${saved.type || "item"} report was submitted.`,
        "",
        `Title: ${saved.title}`,
        `Category: ${saved.category || "Other"}`,
        `Location: ${saved.location}`,
        `Date: ${saved.dateOccurred ? new Date(saved.dateOccurred).toLocaleDateString() : "Not provided"}`,
        `Reported by: ${saved.owner?.name || "Anonymous"}`,
        `Reporter email: ${saved.owner?.email || "Not provided"}`,
        "",
        "Description:",
        saved.description,
        "",
        saved.adminDescription ? `Private admin details:\n${saved.adminDescription}` : "",
      ].filter(Boolean).join("\n"),
    }).catch((emailError) => {
      console.error("Report notification email error:", emailError);
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

const jwt = require("jsonwebtoken");

function getUserFromAuthHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
  } catch (err) {
    return null;
  }
}

// ── USER: EDIT REPORT (within 10 minutes of creation) ──
router.patch("/:id/edit", async (req, res) => {
  try {
    const user = getUserFromAuthHeader(req);
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Enforce 10-minute edit window
    const EDIT_WINDOW_MS = 10 * 60 * 1000;
    const age = Date.now() - new Date(report.createdAt).getTime();
    if (age > EDIT_WINDOW_MS) {
      return res.status(403).json({
        message: "Editing period has expired. This report can no longer be edited."
      });
    }

    // Only allow safe user-facing fields to be updated
    const allowed = ["title", "description", "location", "dateOccurred", "category", "image", "adminDescription"];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updated = await Report.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("Edit report error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ── CLAIM ITEM (sets status → pending) ──────────────────
router.patch("/:id/claim", async (req, res) => {
  try {
    const user = getUserFromAuthHeader(req);
    if (!user) {
      return res.status(401).json({ message: "Authentication required to claim an item" });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.type !== "found") {
      return res.status(400).json({
        message: "Only found items can be claimed",
      });
    }

    if (report.status !== "available") {
      return res.status(400).json({
        message: "Item is not available to claim",
      });
    }

    // Check if the authenticated user is the reporter of this FOUND item
    const isReporter = 
      (report.owner?.id && report.owner.id === user.id) ||
      (report.owner?.email && report.owner.email === user.email) ||
      (report.owner?.name && report.owner.name === user.username);

    if (isReporter) {
      return res.status(403).json({
        message: "You cannot claim an item that you reported.",
      });
    }

    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status: "pending",
        claimed: false,
        claimer: req.body.claimer,
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ADMIN: APPROVE CLAIM ──
router.patch("/:id/approve", adminAuth, async (req, res) => {
  try {
    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status: "claimed",
        claimed: true,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ADMIN: REJECT CLAIM ──
router.patch("/:id/reject", adminAuth, async (req, res) => {
  try {
    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status: "available",
        claimed: false,
        claimer: { name: "", phone: "" },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ADMIN: RESOLVE ──
router.patch("/:id/resolve", adminAuth, async (req, res) => {
  try {
    const { pickupLocation, pickupInstructions } = req.body || {};

    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      { 
        status: "resolved",
        pickupLocation: pickupLocation || "",
        pickupInstructions: pickupInstructions || ""
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Report not found" });
    }

    // ── Look up claimer's registered email ──
    const claimerName = updated.claimer?.name || "";
    let claimerEmail = updated.claimer?.email || null;

    if (!claimerEmail && claimerName) {
      try {
        const claimerUser = await User.findOne({
          username: { $regex: `^${claimerName}$`, $options: "i" },
        });
        if (claimerUser?.email) claimerEmail = claimerUser.email;
      } catch (lookupErr) {
        console.error("Claimer lookup error:", lookupErr);
      }
    }

    // ── Build notification message ──
    const notifParts = [
      `✅ Your claim for "${updated.title}" has been resolved!`,
      pickupLocation ? `📍 Pickup location: ${pickupLocation}` : "",
      pickupInstructions ? `💬 ${pickupInstructions}` : "",
    ].filter(Boolean);
    const notifMessage = notifParts.join(" — ");

    // ── Create server-side notification in DB ──
    if (claimerEmail || claimerName) {
      try {
        await Notification.create({
          recipientEmail: claimerEmail || `${claimerName.toLowerCase().replace(/\s+/g, "")}@unknown.local`,
          recipientName: claimerName,
          message: notifMessage,
          type: "resolve",
          meta: {
            itemId: updated._id.toString(),
            itemTitle: updated.title,
            pickupLocation: pickupLocation || "",
            pickupInstructions: pickupInstructions || "",
          },
        });
      } catch (notifErr) {
        console.error("Failed to create notification:", notifErr);
      }
    }

    // ── Send email to claimer ──
    const emailTo = claimerEmail || SUPPORT_EMAIL;
    const emailSubject = `Your item "${updated.title}" is ready for pickup!`;
    const emailText = [
      `Hi ${claimerName || "there"},`,
      "",
      `Great news! Your claim for the item "${updated.title}" has been resolved.`,
      "",
      pickupLocation ? `📍 Pickup Location: ${pickupLocation}` : "",
      pickupInstructions ? `💬 Collection Instructions: ${pickupInstructions}` : "",
      "",
      `Item Details:`,
      `  Title: ${updated.title}`,
      `  Category: ${updated.category || "Other"}`,
      `  Original location reported: ${updated.location}`,
      "",
      "Please visit the pickup location at your earliest convenience.",
      "",
      "— Lost & Found Team",
    ].filter(line => line !== undefined).join("\n");

    sendEmail({
      to: emailTo,
      subject: emailSubject,
      text: emailText,
    }).then(info => {
      console.log(`Resolution email successfully sent to ${emailTo}`, info?.messageId || "");
    }).catch((emailError) => {
      console.error("Resolve notification email error:", emailError);
    });

    // Also CC support with a summary
    if (claimerEmail && claimerEmail !== SUPPORT_EMAIL) {
      sendEmail({
        to: SUPPORT_EMAIL,
        subject: `[Admin Copy] Resolved: "${updated.title}" — pickup sent to ${claimerEmail}`,
        text: emailText,
      }).catch(() => {});
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ADMIN: DELETE ──
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const deleted = await Report.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
