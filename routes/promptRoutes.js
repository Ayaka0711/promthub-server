// routes/promptRoutes.js
import express from "express";
import {
  getAllPrompts,
  getFeaturedPrompts,
  getPromptById,
  getTopCreators,
  getFilterOptions,
  createPrompt,
  getMyPrompts,
  updatePrompt,
  deletePrompt,
  incrementCopyCount,
  getPromptAnalytics,
  getAllPromptsAdmin,
  approvePrompt,
  rejectPrompt,
  toggleFeaturePrompt,
  deletePromptAdmin,
} from "../controllers/promptController.js";
import { getRecentReviews, getPromptReviews, createReview, getMyReviews } from "../controllers/reviewController.js";
import verifyAuth from "../middleware/verifyAuth.js";
import verifyRole from "../middleware/verifyRole.js";

const router = express.Router();

// ---- Public — no login required. Specific paths before the "/:id" catch-all. ----
router.get("/prompts/featured", getFeaturedPrompts);
router.get("/prompts/meta/filters", getFilterOptions);
router.get("/creators/top", getTopCreators);
router.get("/reviews/recent", getRecentReviews);

// ---- Private — logged-in user/creator/admin ----
router.get("/prompts/mine", verifyAuth, getMyPrompts);
router.post("/prompts", verifyAuth, verifyRole("user", "creator", "admin"), createPrompt);
router.get("/reviews/mine", verifyAuth, getMyReviews);
router.post("/reviews", verifyAuth, createReview);

// ---- Admin only — specific admin paths before "/prompts/:id" ----
router.get("/admin/prompts", verifyAuth, verifyRole("admin"), getAllPromptsAdmin);
router.patch("/admin/prompts/:id/approve", verifyAuth, verifyRole("admin"), approvePrompt);
router.patch("/admin/prompts/:id/reject", verifyAuth, verifyRole("admin"), rejectPrompt);
router.patch("/admin/prompts/:id/feature", verifyAuth, verifyRole("admin"), toggleFeaturePrompt);
router.delete("/admin/prompts/:id", verifyAuth, verifyRole("admin"), deletePromptAdmin);

// ---- Prompt-specific routes (mix of public/private, id-based) ----
router.get("/prompts/:id/reviews", getPromptReviews); // public
router.get("/prompts/:id/analytics", verifyAuth, getPromptAnalytics); // private, creator only (checked in controller)
router.patch("/prompts/:id/copy", verifyAuth, incrementCopyCount); // private
router.patch("/prompts/:id", verifyAuth, updatePrompt); // private, owner only (checked in controller)
router.delete("/prompts/:id", verifyAuth, deletePrompt); // private, owner only (checked in controller)
router.get("/prompts", getAllPrompts); // public
router.get("/prompts/:id", getPromptById); // public — MUST stay after /prompts/mine, /prompts/meta/*, etc.

export default router;
