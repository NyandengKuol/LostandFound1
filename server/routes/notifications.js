const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// ── GET notifications for a user (by email or name) ──
router.get("/", async (req, res) => {
  try {
    const { email, name } = req.query;
    if (!email && !name) {
      return res.status(400).json({ message: "email or name query param required" });
    }

    const query = {};
    if (email) query.recipientEmail = email.toLowerCase().trim();
    else if (name) query.recipientName = { $regex: `^${name}$`, $options: "i" };

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(30);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── MARK a notification as seen ──
router.patch("/:id/seen", async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { seen: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Notification not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── MARK ALL as seen for a user ──
router.patch("/mark-all-seen", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "email required" });
    await Notification.updateMany(
      { recipientEmail: email.toLowerCase().trim(), seen: false },
      { seen: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
