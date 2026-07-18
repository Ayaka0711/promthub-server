// controllers/promptController.js

import Prompt from "../models/Prompt.js";

// GET /prompts
// Query params: search, category, aiTool, difficulty, sort, page, limit
// This is the ONE endpoint that powers the All Prompts page — search,
// filter, sort, and pagination are all handled server-side here, per
// the "Server side filtering implementation required" requirement.
export const getAllPrompts = async (req, res) => {
  try {
    const {
      search = "",
      category,
      aiTool,
      difficulty,
      sort = "latest",
      page = 1,
      limit = 9,
    } = req.query;

    // Only ever show prompts an admin has approved AND that are public —
    // private/premium prompts are handled separately on the Details page.
    const query = { status: "approved", visibility: "Public" };

    if (search) {
      // Matches the "Search by Prompt Title, Tags, AI Tool" requirement.
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { aiTool: { $regex: search, $options: "i" } },
      ];
    }
    if (category) query.category = category;
    if (aiTool) query.aiTool = aiTool;
    if (difficulty) query.difficulty = difficulty;

    // Sort options match the requirement: Most Popular (rating), Most Copied, Latest.
    const sortMap = {
      popular: { ratingAvg: -1 },
      copied: { copyCount: -1 },
      latest: { createdAt: -1 },
    };
    const sortBy = sortMap[sort] || sortMap.latest;

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.max(parseInt(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    const [prompts, total] = await Promise.all([
      Prompt.find(query).sort(sortBy).skip(skip).limit(limitNum),
      Prompt.countDocuments(query),
    ]);

    res.send({
      prompts,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch prompts", error: error.message });
  }
};

// GET /prompts/featured
// Top 6 prompts for the home page banner section, using a Mongo limit
// as specified in the requirement.
export const getFeaturedPrompts = async (req, res) => {
  try {
    const prompts = await Prompt.find({ status: "approved", visibility: "Public" })
      .sort({ ratingAvg: -1, copyCount: -1 })
      .limit(6);

    res.send(prompts);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch featured prompts" });
  }
};

// GET /prompts/:id
// Single prompt details — full record used by the Prompt Details page (Phase 3).
export const getPromptById = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) {
      return res.status(404).send({ message: "Prompt not found" });
    }
    res.send(prompt);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch prompt" });
  }
};

// GET /creators/top
// Aggregates prompts by creator to find the most active/popular ones —
// satisfies the "Implement MongoDB aggregation in at least one feature" requirement.
export const getTopCreators = async (req, res) => {
  try {
    const creators = await Prompt.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: "$creatorEmail",
          name: { $first: "$creatorName" },
          image: { $first: "$creatorImage" },
          totalPrompts: { $sum: 1 },
          totalCopies: { $sum: "$copyCount" },
          avgRating: { $avg: "$ratingAvg" },
        },
      },
      { $sort: { totalCopies: -1, totalPrompts: -1 } },
      { $limit: 6 },
    ]);

    res.send(creators);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch top creators" });
  }
};

// GET /prompts/meta/filters
// Returns the distinct categories/aiTools currently in the database, so
// the All Prompts page's filter dropdowns reflect real data instead of
// a hardcoded list that could drift out of sync.
export const getFilterOptions = async (req, res) => {
  try {
    const [categories, aiTools] = await Promise.all([
      Prompt.distinct("category", { status: "approved" }),
      Prompt.distinct("aiTool", { status: "approved" }),
    ]);
    res.send({ categories, aiTools, difficulties: ["Beginner", "Intermediate", "Pro"] });
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch filter options" });
  }
};

// ---- Private: creator/user prompt management ----

// POST /prompts — private (user or creator). Free users capped at 3 prompts.
export const createPrompt = async (req, res) => {
  try {
    const { email, name, image, role, subscription, promptCount } = req.user;

    if (subscription !== "premium" && promptCount >= 3) {
      return res.status(403).send({ message: "Free users can add up to 3 prompts. Upgrade to Premium for more." });
    }

    const prompt = await Prompt.create({
      ...req.body,
      copyCount: 0,
      status: "pending",
      creatorEmail: email,
      creatorName: name,
      creatorImage: image || "",
    });

    // Keep the user's promptCount in sync — read via BetterAuth's own user collection.
    const { authDb } = await import("../lib/mongoClient.js");
    await authDb.collection("user").updateOne({ email }, { $inc: { promptCount: 1 } });

    res.status(201).send(prompt);
  } catch (error) {
    res.status(500).send({ message: "Failed to create prompt", error: error.message });
  }
};

// GET /prompts/mine — private. "My Prompts" dashboard table (any status, own prompts only).
export const getMyPrompts = async (req, res) => {
  try {
    const prompts = await Prompt.find({ creatorEmail: req.user.email }).sort({ createdAt: -1 });
    res.send(prompts);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch your prompts" });
  }
};

// PATCH /prompts/:id — private. Only the prompt's own creator can edit it.
export const updatePrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) return res.status(404).send({ message: "Prompt not found" });
    if (prompt.creatorEmail !== req.user.email) {
      return res.status(403).send({ message: "You can only edit your own prompts" });
    }

    // Editing resets it to pending — an admin should re-review changed content.
    Object.assign(prompt, req.body, { status: "pending", rejectionFeedback: "" });
    await prompt.save();

    res.send(prompt);
  } catch (error) {
    res.status(500).send({ message: "Failed to update prompt", error: error.message });
  }
};

// DELETE /prompts/:id — private. Only the prompt's own creator (or an admin, via the admin route) can delete it.
export const deletePrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) return res.status(404).send({ message: "Prompt not found" });
    if (prompt.creatorEmail !== req.user.email) {
      return res.status(403).send({ message: "You can only delete your own prompts" });
    }

    await Prompt.findByIdAndDelete(req.params.id);

    const { authDb } = await import("../lib/mongoClient.js");
    await authDb.collection("user").updateOne({ email: req.user.email }, { $inc: { promptCount: -1 } });

    res.send({ message: "Prompt deleted" });
  } catch (error) {
    res.status(500).send({ message: "Failed to delete prompt" });
  }
};

// PATCH /prompts/:id/copy — private. Increments copy count when a user copies the prompt content.
export const incrementCopyCount = async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndUpdate(
      req.params.id,
      { $inc: { copyCount: 1 } },
      { new: true }
    );
    if (!prompt) return res.status(404).send({ message: "Prompt not found" });
    res.send({ copyCount: prompt.copyCount });
  } catch (error) {
    res.status(500).send({ message: "Failed to update copy count" });
  }
};

// GET /prompts/:id/analytics — private, creator only. "View Analytics" action on My Prompts.
export const getPromptAnalytics = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) return res.status(404).send({ message: "Prompt not found" });
    if (prompt.creatorEmail !== req.user.email) {
      return res.status(403).send({ message: "Not your prompt" });
    }

    const Bookmark = (await import("../models/Bookmark.js")).default;
    const bookmarkCount = await Bookmark.countDocuments({ promptId: prompt._id });

    res.send({
      title: prompt.title,
      copyCount: prompt.copyCount,
      ratingAvg: prompt.ratingAvg,
      ratingCount: prompt.ratingCount,
      bookmarkCount,
      status: prompt.status,
      createdAt: prompt.createdAt,
    });
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch analytics" });
  }
};

// ---- Admin only ----

// GET /admin/prompts — admin only. All prompts regardless of status, for moderation.
export const getAllPromptsAdmin = async (req, res) => {
  try {
    const prompts = await Prompt.find().sort({ createdAt: -1 });
    res.send(prompts);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch prompts" });
  }
};

// PATCH /admin/prompts/:id/approve — admin only.
export const approvePrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndUpdate(
      req.params.id,
      { status: "approved", rejectionFeedback: "" },
      { new: true }
    );
    res.send(prompt);
  } catch (error) {
    res.status(500).send({ message: "Failed to approve prompt" });
  }
};

// PATCH /admin/prompts/:id/reject — admin only. Body: { feedback }
export const rejectPrompt = async (req, res) => {
  try {
    const { feedback } = req.body;
    const prompt = await Prompt.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", rejectionFeedback: feedback || "Did not meet platform guidelines." },
      { new: true }
    );
    res.send(prompt);
  } catch (error) {
    res.status(500).send({ message: "Failed to reject prompt" });
  }
};

// PATCH /admin/prompts/:id/feature — admin only. Toggles a "featured" flag independent of the rating-based featured query.
export const toggleFeaturePrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) return res.status(404).send({ message: "Prompt not found" });
    prompt.featured = !prompt.featured;
    await prompt.save();
    res.send(prompt);
  } catch (error) {
    res.status(500).send({ message: "Failed to update feature status" });
  }
};

// DELETE /admin/prompts/:id — admin only.
export const deletePromptAdmin = async (req, res) => {
  try {
    await Prompt.findByIdAndDelete(req.params.id);
    res.send({ message: "Prompt deleted" });
  } catch (error) {
    res.status(500).send({ message: "Failed to delete prompt" });
  }
};
