require("dotenv").config();

const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized: No admin token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = Buffer.from(token, "base64").toString();
    const [username, password] = decoded.split(":");

    if (
      username !== process.env.ADMIN_USERNAME ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(403).json({
        message: "Forbidden: Invalid admin credentials",
      });
    }
  } catch (err) {
    return res.status(403).json({
      message: "Forbidden: Invalid token format",
    });
  }

  next();
};

module.exports = adminAuth;