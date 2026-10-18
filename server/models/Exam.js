import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
    },
    duration: { // 👈 নতুন: মিনিটে সময়
      type: Number,
      required: true,
      default: 10,
    },
    questions: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: String, required: true },
      },
    ],
    studentAnswers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        selectedOption: String,
      },
    ],
    score: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "submitted", "checked"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Exam = mongoose.model("Exam", examSchema);
export default Exam;