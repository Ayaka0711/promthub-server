// models/Review.js
// A single rating + comment a user leaves on a prompt. Used both on
// individual Prompt Details pages (Phase 3) and for the Home page's
// "Customer Reviews" section (a general sample of recent reviews).

import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    promptId: { type: mongoose.Schema.Types.ObjectId, ref: "Prompt", required: true },
    promptTitle: { type: String, required: true }, // denormalized for easy display without populate()
    reviewerEmail: { type: String, required: true },
    reviewerName: { type: String, required: true },
    reviewerImage: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
