// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    transactionId: { type: String, required: true },
    amount: { type: Number, required: true }, // in dollars, e.g. 5
    currency: { type: String, default: "usd" },
    status: { type: String, enum: ["succeeded", "failed"], default: "succeeded" },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
