// models/Bookmark.js
import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    promptId: { type: mongoose.Schema.Types.ObjectId, ref: "Prompt", required: true },
  },
  { timestamps: true }
);

// One bookmark per user per prompt — the DB itself enforces "prevent duplicate bookmarks".
bookmarkSchema.index({ userEmail: 1, promptId: 1 }, { unique: true });

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
export default Bookmark;
