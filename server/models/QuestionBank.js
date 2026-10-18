import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
});

const questionBankSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: { type: String, required: true },
    source: { type: String, enum: ["pdf", "text", "image"], required: true },
    questions: [questionSchema],
  },
  { timestamps: true }
);

const QuestionBank = mongoose.model("QuestionBank", questionBankSchema);
export default QuestionBank;