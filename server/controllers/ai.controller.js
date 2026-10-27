import QuestionBank from "../models/QuestionBank.js";
import { generateMCQFromText, generateMCQFromImage } from "../services/gemini.service.js";
import { PdfReader } from "pdfreader";

const extractTextFromPdf = (buffer) => {
  return new Promise((resolve, reject) => {
    let text = "";
    new PdfReader({}).parseBuffer(buffer, (err, item) => {
      if (err) reject(err);
      else if (!item) resolve(text);
      else if (item.text) text += item.text + " ";
    });
  });
};

// @desc    Generate MCQ/Short/Creative (Supports Multiple Files)
// @route   POST /api/ai/generate
export const generateMCQ = async (req, res) => {
  try {
    const { text, numQuestions, difficulty, subject, sourceType, questionType } = req.body;
    let source = sourceType || "text";
    let questions = [];
    let extractedText = text || "";

    // 👈 req.files চেক করা হচ্ছে (একাধিক ফাইলের জন্য)
    if (req.files && req.files.length > 0) {
      const pdfFiles = req.files.filter(f => f.mimetype === "application/pdf");
      const imageFiles = req.files.filter(f => f.mimetype.startsWith("image/"));

      // ১. যদি PDF থাকে
      if (pdfFiles.length > 0) {
        source = "pdf";
        for (const file of pdfFiles) {
          extractedText += await extractTextFromPdf(file.buffer);
        }
        if (!extractedText || extractedText.trim() === "") {
          return res.status(400).json({ success: false, message: "Could not extract text from this PDF." });
        }
        questions = await generateMCQFromText(extractedText, numQuestions || 10, difficulty || "medium", questionType || "mcq");
      } 
      // ২. যদি Image থাকে (এক বা একাধিক)
      else if (imageFiles.length > 0) {
        source = "image";
        const base64Images = imageFiles.map(f => f.buffer.toString("base64"));
        questions = await generateMCQFromImage(base64Images, "image/jpeg", numQuestions || 10, difficulty || "medium", questionType || "mcq");
      }
    } 
    // ৩. যদি শুধু টেক্সট থাকে
    else if (extractedText) {
      source = "text";
      questions = await generateMCQFromText(extractedText, numQuestions || 10, difficulty || "medium", questionType || "mcq");
    } 
    else {
      return res.status(400).json({ success: false, message: "No text or file provided." });
    }

    res.status(200).json({ success: true, source, questions });
  } catch (error) {
    console.error("AI Controller Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save Generated Questions
// @route   POST /api/ai/save
export const saveMCQ = async (req, res) => {
  try {
    const { subject, source, questions } = req.body;
    const bank = await QuestionBank.create({
      teacher: req.user._id,
      subject,
      source,
      questions,
    });
    res.status(201).json({ success: true, bank });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all Question Banks
// @route   GET /api/ai/question-bank
export const getQuestionBanks = async (req, res) => {
  try {
    const banks = await QuestionBank.find({ teacher: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, banks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a question bank
// @route   DELETE /api/ai/question-bank/:id
export const deleteQuestionBank = async (req, res) => {
  try {
    const bank = await QuestionBank.findById(req.params.id);
    if (!bank || bank.teacher.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: "Question Bank not found" });
    }
    await bank.deleteOne();
    res.json({ success: true, message: "Question Bank deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};