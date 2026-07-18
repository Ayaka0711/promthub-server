// controllers/analyticsController.js
import Prompt from "../models/Prompt.js";
import Review from "../models/Review.js";
import Bookmark from "../models/Bookmark.js";
import { authDb } from "../lib/mongoClient.js";

// GET /creator/analytics — private, creator/admin. Summary cards + chart data
// for the Creator Dashboard Home.
export const getCreatorAnalytics = async (req, res) => {
  try {
    const creatorEmail = req.user.email;

    const prompts = await Prompt.find({ creatorEmail });
    const promptIds = prompts.map((p) => p._id);

    const totalPrompts = prompts.length;
    const totalCopies = prompts.reduce((sum, p) => sum + p.copyCount, 0);
    const totalBookmarks = await Bookmark.countDocuments({ promptId: { $in: promptIds } });

    // Prompt growth over time — aggregation grouping by creation month.
    const growth = await Prompt.aggregate([
      { $match: { creatorEmail } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Copies per prompt — feeds the "Total Copies" chart.
    const copiesByPrompt = prompts
      .map((p) => ({ title: p.title, copies: p.copyCount }))
      .sort((a, b) => b.copies - a.copies)
      .slice(0, 8);

    res.send({
      totalPrompts,
      totalCopies,
      totalBookmarks,
      growth: growth.map((g) => ({ month: g._id, count: g.count })),
      copiesByPrompt,
    });
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch analytics", error: error.message });
  }
};

// GET /admin/analytics — admin only. Platform-wide totals for the Admin Dashboard.
export const getAdminAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalPrompts, totalReviews, copyAgg] = await Promise.all([
      authDb.collection("user").countDocuments(),
      Prompt.countDocuments(),
      Review.countDocuments(),
      Prompt.aggregate([{ $group: { _id: null, total: { $sum: "$copyCount" } } }]),
    ]);

    res.send({
      totalUsers,
      totalPrompts,
      totalReviews,
      totalCopies: copyAgg[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch analytics" });
  }
};
