// routes/analyticsRoutes.js
import express from "express";
import { getCreatorAnalytics, getAdminAnalytics } from "../controllers/analyticsController.js";
import verifyAuth from "../middleware/verifyAuth.js";
import verifyRole from "../middleware/verifyRole.js";

const router = express.Router();

router.get("/creator/analytics", verifyAuth, verifyRole("creator", "admin"), getCreatorAnalytics);
router.get("/admin/analytics", verifyAuth, verifyRole("admin"), getAdminAnalytics);

export default router;
