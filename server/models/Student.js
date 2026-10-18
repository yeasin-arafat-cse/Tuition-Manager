import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: [true, "Student name is required"], trim: true },
    email: { type: String, required: true, lowercase: true, trim: true }, // 👈 নতুন: স্টুডেন্টের ইমেইল
    class: { type: String, required: true },
    subject: { type: String, required: true },
    guardianName: { type: String, required: true },
    guardianPhone: { type: String, required: true },
    monthlyFee: { type: Number, required: true, default: 0 },
    joinDate: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);
export default Student;