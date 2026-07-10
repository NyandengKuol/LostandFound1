const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not configured");
  }

  connectionPromise = mongoose
    .connect(mongoUri)
    .then(() => {
      console.log("MongoDB connected successfully");
      return mongoose.connection;
    })
    .catch((err) => {
      connectionPromise = null;
      console.error("MongoDB connection error:", err.message);
      throw err;
    });

  return connectionPromise;
};

module.exports = connectDB;
