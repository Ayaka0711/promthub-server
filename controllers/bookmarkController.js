// controllers/bookmarkController.js
import Bookmark from "../models/Bookmark.js";
import Prompt from "../models/Prompt.js";

// POST /bookmarks/toggle — private. Body: { promptId }
// Toggles bookmark status: removes it if it already exists, creates it if not.
export const toggleBookmark = async (req, res) => {
  try {
    const { promptId } = req.body;
    const userEmail = req.user.email;

    const existing = await Bookmark.findOne({ userEmail, promptId });

    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      return res.send({ bookmarked: false, message: "Bookmark removed" });
    }

    // The unique index on (userEmail, promptId) is the real duplicate guard;
    // this findOne check above is what lets us return a clean toggle result
    // instead of a duplicate-key error.
    await Bookmark.create({ userEmail, promptId });
    res.send({ bookmarked: true, message: "Prompt bookmarked" });
  } catch (error) {
    res.status(500).send({ message: "Failed to update bookmark", error: error.message });
  }
};

// GET /bookmarks/check/:promptId — private. Tells the Prompt Details page
// whether the current user has already bookmarked this prompt.
export const checkBookmark = async (req, res) => {
  try {
    const existing = await Bookmark.findOne({
      userEmail: req.user.email,
      promptId: req.params.promptId,
    });
    res.send({ bookmarked: !!existing });
  } catch (error) {
    res.status(500).send({ message: "Failed to check bookmark" });
  }
};

// GET /bookmarks/mine — private. "Saved Prompts" dashboard page.
export const getMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userEmail: req.user.email }).sort({ createdAt: -1 });
    const promptIds = bookmarks.map((b) => b.promptId);
    const prompts = await Prompt.find({ _id: { $in: promptIds } });

    // Preserve bookmark order (most recently saved first) and attach the bookmarkId
    // so the "Remove Bookmark" button can act directly without a second lookup.
    const merged = bookmarks
      .map((b) => {
        const prompt = prompts.find((p) => p._id.toString() === b.promptId.toString());
        return prompt ? { ...prompt.toObject(), bookmarkId: b._id } : null;
      })
      .filter(Boolean);

    res.send(merged);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch saved prompts" });
  }
};

// DELETE /bookmarks/:id — private. Removes a bookmark by its own id (used from Saved Prompts table).
export const removeBookmark = async (req, res) => {
  try {
    await Bookmark.deleteOne({ _id: req.params.id, userEmail: req.user.email });
    res.send({ message: "Bookmark removed" });
  } catch (error) {
    res.status(500).send({ message: "Failed to remove bookmark" });
  }
};
