const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const signupRoute = require("./routes/signup");
const loginRoute = require("./routes/login");
const reportRoute = require("./routes/Report");
const contactRoute = require("./routes/contact");

const app = express();

// ── MIDDLEWARE ──
app.use(cors());

// Important: 10mb limit needed for base64 image uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ── DATABASE ──
connectDB();

// ── ROUTES ──
app.use("/api/signup", signupRoute);
app.use("/api/login", loginRoute);
app.use("/api/reports", reportRoute);
app.use("/api/contact", contactRoute);

// ── HEALTH CHECK ──
app.get("/", (req, res) => {
  res.send("🔍 Lost & Found API is running");
});

// ── START SERVER ──
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Admin credentials: ${process.env.ADMIN_USERNAME} / ${process.env.ADMIN_PASSWORD}`);
  console.log(` API URL: http://localhost:${PORT}/api`);
});
