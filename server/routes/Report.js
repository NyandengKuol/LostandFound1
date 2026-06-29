const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
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

// ── CLAIM ITEM (sets status → pending) ──────────────────
router.patch("/:id/claim", async (req, res) => {
  try {
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
    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status: "resolved",
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
