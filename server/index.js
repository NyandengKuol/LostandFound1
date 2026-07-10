const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const signupRoute = require("./routes/signup");
const loginRoute = require("./routes/login");
const reportRoute = require("./routes/Report");
const contactRoute = require("./routes/contact");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.get("/", (req, res) => {
  res.send("Lost & Found API is running");
});

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database startup error:", error.message);
    res.status(500).json({
      message: "Database connection failed. Check MONGO_URI in Vercel.",
    });
  }
});

app.use("/api/signup", signupRoute);
app.use("/api/login", loginRoute);
app.use("/api/reports", reportRoute);
app.use("/api/contact", contactRoute);

app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

const PORT = process.env.PORT || 4000;

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Admin credentials: ${process.env.ADMIN_USERNAME} / ${process.env.ADMIN_PASSWORD}`);
    console.log(`API URL: http://localhost:${PORT}/api`);
  });
}

module.exports = app;
