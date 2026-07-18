// index.js
// Entry point for the PromptHub API server.

import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import connectDB from "./config/db.js";
import promptRoutes from "./routes/promptRoutes.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

// ---- CORS ----
// credentials: true is required so the browser sends/receives BetterAuth's
// session cookie. origin must be the exact client URL (not "*").
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// ---- BetterAuth ----
// IMPORTANT: this must be mounted BEFORE express.json(). BetterAuth's
// handler parses the request body itself; running express.json() first
// would consume the stream and break sign-up/sign-in requests.
app.all("/api/auth/*", toNodeHandler(auth));

// ---- Regular JSON body parsing for everything else ----
app.use(express.json());

// ---- Marketplace routes ----
app.use("/", promptRoutes);
app.use("/", bookmarkRoutes);
app.use("/", reportRoutes);
app.use("/", paymentRoutes);
app.use("/", userRoutes);
app.use("/", analyticsRoutes);

app.get("/", (req, res) => {
  res.send("🚀 PromptHub API is running");
});

// ---- 404 fallback for unknown API routes ----
app.use((req, res) => {
  res.status(404).send({ message: "Route not found" });
});

// ---- Start server only after Mongoose connects ----
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
});
