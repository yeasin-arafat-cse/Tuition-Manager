import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    month: {
      type: String,
      required: true, // যেমন: "January", "February"
    },
    year: {
      type: Number,
      required: true, // যেমন: 2026
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["paid", "due"],
      default: "due",
    },
    paidDate: {
      type: Date,
    },
    method: {
      type: String,
      enum: ["cash", "bkash", "nagad", "bank", "other"],
      default: "cash",
    },
  },
  { timestamps: true }
);

// একই মাসে একই স্টুডেন্টের জন্য একবারই পেমেন্ট রেকর্ড থাকবে
paymentSchema.index({ student: 1, month: 1, year: 1 }, { unique: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;