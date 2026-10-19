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
      // 👈 এখানে required: true একদম থাকবে না
    },
    year: {
      type: Number,
      required: true,
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

// ⚠️ এই লাইনটি সাময়িকভাবে মুছে ফেলুন বা কমেন্ট করে দিন
// paymentSchema.index({ student: 1, month: 1, year: 1 }, { unique: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;