const express = require("express");
const router = express.Router();
const { SUPPORT_EMAIL, sendEmail } = require("../utils/mailer");

router.post("/", async (req, res) => {
  try {
    const { name, email, channel, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "Name, email, subject, and message are required",
      });
    }

    const cleanSubject = String(subject).trim();
    const cleanMessage = String(message).trim();

    await sendEmail({
      to: SUPPORT_EMAIL,
      replyTo: email,
      subject: `Website contact: ${cleanSubject}`,
      text: [
        "New message from the Lost & Found website.",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Preferred channel: ${channel || "Not selected"}`,
        `Subject: ${cleanSubject}`,
        "",
        "Message:",
        cleanMessage,
      ].join("\n"),
    });

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Contact email error:", error);
    res.status(500).json({ message: "Could not send your message. Please try again." });
  }
});

module.exports = router;
