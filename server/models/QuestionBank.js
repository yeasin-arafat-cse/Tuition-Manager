import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String },
  stem: { type: String },
  options: [{ type: String }],
  correctAnswer: { type: String },
  questionA: { type: String },
  answerA: { type: String },
  questionB: { type: String },
  answerB: { type: String },
  questionC: { type: String },
  answerC: { type: String },
  questionD: { type: String },
  answerD: { type: String },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
});

const questionBankSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    class: { type: String, required: true }, // 👈 নতুন: ক্লাস
    subject: { type: String, required: true },
    source: { type: String, enum: ["pdf", "text", "image"], required: true },
    questions: [questionSchema],
  },
  { timestamps: true }
);

const QuestionBank = mongoose.model("QuestionBank", questionBankSchema);
export default QuestionBank;