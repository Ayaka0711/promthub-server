// controllers/paymentController.js
import Stripe from "stripe";
import Payment from "../models/Payment.js";
import { authDb } from "../lib/mongoClient.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PREMIUM_PRICE_CENTS = 500; // $5.00 one-time, per the requirement

// POST /create-payment-intent — private. Client calls this to get a clientSecret for Stripe Elements.
export const createPaymentIntent = async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: PREMIUM_PRICE_CENTS,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: { userEmail: req.user.email },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).send({ message: "Failed to start payment", error: error.message });
  }
};

// POST /payments/confirm — private. Body: { transactionId }
// Called after Stripe confirms the payment client-side. Verifies the
// PaymentIntent actually succeeded before trusting it (never trust the
// client alone to say "payment succeeded").
export const confirmPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const email = req.user.email;

    const intent = await stripe.paymentIntents.retrieve(transactionId);
    if (intent.status !== "succeeded") {
      return res.status(400).send({ message: "Payment not completed" });
    }

    const existing = await Payment.findOne({ transactionId });
    if (existing) {
      return res.send({ message: "Already recorded", payment: existing });
    }

    const payment = await Payment.create({
      userEmail: email,
      transactionId,
      amount: intent.amount / 100,
      currency: intent.currency,
      status: "succeeded",
    });

    await authDb.collection("user").updateOne({ email }, { $set: { subscription: "premium" } });

    res.status(201).send({ message: "Premium unlocked", payment });
  } catch (error) {
    res.status(500).send({ message: "Failed to confirm payment", error: error.message });
  }
};

// GET /admin/payments — admin only. "All Payments" table.
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.send(payments);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch payments" });
  }
};
