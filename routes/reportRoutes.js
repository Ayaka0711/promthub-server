// routes/reportRoutes.js
import express from "express";
import { createReport, getAllReports, resolveReport } from "../controllers/reportController.js";
import verifyAuth from "../middleware/verifyAuth.js";
import verifyRole from "../middleware/verifyRole.js";

const router = express.Router();

router.post("/reports", verifyAuth, createReport);
router.get("/admin/reports", verifyAuth, verifyRole("admin"), getAllReports);
router.patch("/admin/reports/:id", verifyAuth, verifyRole("admin"), resolveReport);

export default router;
