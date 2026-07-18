// scripts/seed.js
// Dev-only helper: fills the database with sample APPROVED prompts and
// reviews so the Home page and All Prompts page have real content to
// show before the Add Prompt / Admin Approval flow exists (Phase 4+).
// Run with: node scripts/seed.js
// Safe to re-run — it clears old seed data first.

import "dotenv/config";
import mongoose from "mongoose";
import Prompt from "../models/Prompt.js";
import Review from "../models/Review.js";

const samplePrompts = [
  {
    title: "Cinematic Product Photography Prompt",
    description: "Generates dramatic, studio-lit product shots with reflective surfaces.",
    content: "Ultra-detailed product photography of {product}, dramatic studio lighting, reflective black surface, shallow depth of field, 85mm lens, cinematic color grade --ar 4:5",
    category: "Photography",
    aiTool: "Midjourney",
    tags: ["product", "photography", "studio"],
    difficulty: "Intermediate",
    creatorEmail: "seed@prompthub.dev",
    creatorName: "Nadia Chowdhury",
    ratingAvg: 4.8,
    ratingCount: 34,
    copyCount: 512,
  },
  {
    title: "SQL Query Explainer",
    description: "Breaks down any SQL query into a plain-English step-by-step explanation.",
    content: "Explain the following SQL query step-by-step in plain English, including what each clause does and why: {query}",
    category: "Development",
    aiTool: "ChatGPT",
    tags: ["sql", "database", "learning"],
    difficulty: "Beginner",
    creatorEmail: "seed@prompthub.dev",
    creatorName: "Rafi Islam",
    ratingAvg: 4.6,
    ratingCount: 21,
    copyCount: 340,
  },
  {
    title: "Cold Outreach Email Generator",
    description: "Writes a concise, non-pushy cold email for B2B outreach.",
    content: "Write a 3-sentence cold outreach email to {role} at {company}, referencing {pain_point}, ending with a low-pressure call to action.",
    category: "Marketing",
    aiTool: "Claude",
    tags: ["email", "sales", "outreach"],
    difficulty: "Beginner",
    creatorEmail: "seed@prompthub.dev",
    creatorName: "Meherun Nesa",
    ratingAvg: 4.4,
    ratingCount: 18,
    copyCount: 275,
  },
  {
    title: "Fantasy Character Concept Art",
    description: "Detailed fantasy character portraits with consistent art direction.",
    content: "Fantasy character concept art of {character description}, intricate armor details, dramatic rim lighting, digital painting, trending on ArtStation --ar 2:3",
    category: "Art",
    aiTool: "Midjourney",
    tags: ["fantasy", "character", "concept-art"],
    difficulty: "Intermediate",
    creatorEmail: "seed@prompthub.dev",
    creatorName: "Tanvir Ahmed",
    ratingAvg: 4.9,
    ratingCount: 47,
    copyCount: 689,
  },
  {
    title: "Code Review Feedback Generator",
    description: "Gives structured, constructive feedback on a pull request diff.",
    content: "Review the following code diff and give structured feedback under three headings: Bugs, Readability, Suggestions. Diff:\n{diff}",
    category: "Development",
    aiTool: "ChatGPT",
    tags: ["code-review", "engineering"],
    difficulty: "Pro",
    creatorEmail: "seed@prompthub.dev",
    creatorName: "Rafi Islam",
    ratingAvg: 4.7,
    ratingCount: 29,
    copyCount: 401,
  },
  {
    title: "Weekly Newsletter Outline",
    description: "Structures a newsletter around one big idea plus three quick links.",
    content: "Create a newsletter outline about {topic}: one lead story (150 words), three quick-link summaries (30 words each), and a one-line sign-off.",
    category: "Writing",
    aiTool: "Gemini",
    tags: ["newsletter", "content", "writing"],
    difficulty: "Beginner",
    creatorEmail: "seed@prompthub.dev",
    creatorName: "Meherun Nesa",
    ratingAvg: 4.3,
    ratingCount: 15,
    copyCount: 198,
  },
  {
    title: "Isometric App Icon Set",
    description: "Consistent isometric-style icon sets for app UI kits.",
    content: "Isometric app icon of {object}, soft gradient colors, subtle drop shadow, consistent 3D perspective, clean vector style --ar 1:1",
    category: "Design",
    aiTool: "Midjourney",
    tags: ["icon", "isometric", "ui"],
    difficulty: "Beginner",
    creatorEmail: "seed@prompthub.dev",
    creatorName: "Nadia Chowdhury",
    ratingAvg: 4.5,
    ratingCount: 22,
    copyCount: 310,
  },
  {
    title: "Interview Prep Question Bank",
    description: "Generates role-specific behavioral interview questions with what a strong answer covers.",
    content: "Generate 5 behavioral interview questions for a {role} position, and for each one note the 2-3 things a strong answer should cover.",
    category: "Career",
    aiTool: "Claude",
    tags: ["interview", "career", "prep"],
    difficulty: "Intermediate",
    creatorEmail: "seed@prompthub.dev",
    creatorName: "Tanvir Ahmed",
    ratingAvg: 4.6,
    ratingCount: 19,
    copyCount: 254,
  },
];

const sampleReviews = [
  { reviewerName: "Farhana Akter", rating: 5, comment: "This saved me hours of trial and error — output was almost exactly what I needed." },
  { reviewerName: "Imran Kabir", rating: 4, comment: "Really solid starting point, tweaked the wording slightly for my use case." },
  { reviewerName: "Sabrina Hoque", rating: 5, comment: "Consistently good results every time I use it. Bookmarked immediately." },
  { reviewerName: "Zahid Hasan", rating: 4, comment: "Clear instructions and the output structure is exactly what I was after." },
];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected — seeding...");

  await Prompt.deleteMany({ creatorEmail: "seed@prompthub.dev" });
  await Review.deleteMany({ reviewerEmail: "seed@prompthub.dev" });

  const inserted = await Prompt.insertMany(
    samplePrompts.map((p) => ({ ...p, status: "approved", visibility: "Public" }))
  );

  const reviewDocs = sampleReviews.map((r, i) => ({
    ...r,
    promptId: inserted[i % inserted.length]._id,
    promptTitle: inserted[i % inserted.length].title,
    reviewerEmail: "seed@prompthub.dev",
  }));
  await Review.insertMany(reviewDocs);

  console.log(`Seeded ${inserted.length} prompts and ${reviewDocs.length} reviews.`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
