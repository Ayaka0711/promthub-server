// config/db.js
// Mongoose connection — used for OUR OWN domain models in later phases
// (Prompt, Review, Report, Payment, etc). BetterAuth manages its own
// user/session/account collections separately via lib/mongoClient.js —
// both simply point at the same MongoDB database.

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Mongoose connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Mongoose connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
