// models/Report.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    promptId: { type: mongoose.Schema.Types.ObjectId, ref: "Prompt", required: true },
    promptTitle: { type: String, required: true },
    reporterEmail: { type: String, required: true },
    reason: {
      type: String,
      enum: ["Inappropriate Content", "Spam", "Copyright Violation", "Other"],
      required: true,
    },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "removed", "warned", "dismissed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
export default Report;
