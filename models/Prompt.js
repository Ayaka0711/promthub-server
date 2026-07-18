// models/Prompt.js
// A single AI prompt listed on the marketplace. Uses Mongoose (unlike
// the user/session/account collections, which BetterAuth manages itself
// via the native driver in lib/mongoClient.js).

import mongoose from "mongoose";

const promptSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    content: { type: String, required: true }, // the actual prompt text
    usageInstructions: { type: String, default: "" }, // how to use the prompt (e.g. what to replace, tips)
    category: { type: String, required: true },
    aiTool: { type: String, required: true }, // ChatGPT, Gemini, Claude, Midjourney, etc.
    tags: [{ type: String }],
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Pro"],
      default: "Beginner",
    },
    thumbnail: { type: String, default: "" },
    visibility: {
      type: String,
      enum: ["Public", "Private"],
      default: "Public",
    },
    copyCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending", // hidden from the marketplace until an admin approves it
    },
    rejectionFeedback: { type: String, default: "" },
    featured: { type: Boolean, default: false },

    // Who made it — stored as plain fields rather than a ref, since we
    // display creator name/email directly on cards without needing a
    // populate() on every list query.
    creatorEmail: { type: String, required: true },
    creatorName: { type: String, required: true },
    creatorImage: { type: String, default: "" },

    // Denormalized rating summary, updated whenever a review is added —
    // avoids recalculating an average from all reviews on every prompt list.
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Supports the "Search by Prompt Title, Tags, AI Tool" requirement.
promptSchema.index({ title: "text", tags: "text", aiTool: "text" });

const Prompt = mongoose.model("Prompt", promptSchema);
export default Prompt;
