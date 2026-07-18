// routes/bookmarkRoutes.js
import express from "express";
import { toggleBookmark, checkBookmark, getMyBookmarks, removeBookmark } from "../controllers/bookmarkController.js";
import verifyAuth from "../middleware/verifyAuth.js";

const router = express.Router();

// All bookmark routes require login.
router.post("/bookmarks/toggle", verifyAuth, toggleBookmark);
router.get("/bookmarks/check/:promptId", verifyAuth, checkBookmark);
router.get("/bookmarks/mine", verifyAuth, getMyBookmarks);
router.delete("/bookmarks/:id", verifyAuth, removeBookmark);

export default router;
