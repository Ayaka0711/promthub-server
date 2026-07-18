// controllers/reviewController.js
import Review from "../models/Review.js";
import Prompt from "../models/Prompt.js";

// GET /reviews/recent — public, powers the Home page reviews section.
export const getRecentReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(6);
    res.send(reviews);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch reviews" });
  }
};

// GET /prompts/:id/reviews — public, all reviews for one prompt (shown on Prompt Details).
export const getPromptReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ promptId: req.params.id }).sort({ createdAt: -1 });
    res.send(reviews);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch reviews" });
  }
};

// POST /reviews — private. Creates a review and recalculates the prompt's
// denormalized ratingAvg/ratingCount so prompt cards don't need to
// re-aggregate reviews on every list fetch.
export const createReview = async (req, res) => {
  try {
    const { promptId, rating, comment } = req.body;
    const { email, name, image } = req.user;

    const prompt = await Prompt.findById(promptId);
    if (!prompt) return res.status(404).send({ message: "Prompt not found" });

    const existing = await Review.findOne({ promptId, reviewerEmail: email });
    if (existing) {
      return res.status(409).send({ message: "You've already reviewed this prompt" });
    }

    const review = await Review.create({
      promptId,
      promptTitle: prompt.title,
      reviewerEmail: email,
      reviewerName: name,
      reviewerImage: image || "",
      rating,
      comment,
    });

    // Recalculate the running average.
    const newCount = prompt.ratingCount + 1;
    const newAvg = (prompt.ratingAvg * prompt.ratingCount + rating) / newCount;
    prompt.ratingCount = newCount;
    prompt.ratingAvg = Math.round(newAvg * 10) / 10;
    await prompt.save();

    res.status(201).send(review);
  } catch (error) {
    res.status(500).send({ message: "Failed to submit review", error: error.message });
  }
};

// GET /reviews/mine — private, "My Reviews" dashboard page.
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewerEmail: req.user.email }).sort({ createdAt: -1 });
    res.send(reviews);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch your reviews" });
  }
};
