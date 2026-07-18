// routes/paymentRoutes.js
import express from "express";
import { createPaymentIntent, confirmPayment, getAllPayments } from "../controllers/paymentController.js";
import verifyAuth from "../middleware/verifyAuth.js";
import verifyRole from "../middleware/verifyRole.js";

const router = express.Router();

router.post("/create-payment-intent", verifyAuth, createPaymentIntent);
router.post("/payments/confirm", verifyAuth, confirmPayment);
router.get("/admin/payments", verifyAuth, verifyRole("admin"), getAllPayments);

export default router;
