import QuestionBank from "../models/QuestionBank.js";
import { generateMCQFromText, generateMCQFromImage } from "../services/gemini.service.js";
import { PdfReader } from "pdfreader"; // 👈 pdfreader ব্যবহার করা হলো

// PDF থেকে টেক্সট বের করার ফাংশন
const extractTextFromPdf = (buffer) => {
  return new Promise((resolve, reject) => {
    let text = "";
    new PdfReader({}).parseBuffer(buffer, (err, item) => {
      if (err) {
        return reject(err);
      } else if (!item) {
        return resolve(text); 
      } else if (item.text) {
        text += item.text + " ";
      }
    });
  });
};

// @desc    Generate MCQ/Short/Creative from Text/PDF/Image
// @route   POST /api/ai/generate
export const generateMCQ = async (req, res) => {
  try {
    const { text, numQuestions, difficulty, subject, sourceType, questionType } = req.body;
    let source = sourceType || "text";
    let questions = [];
    let extractedText = text;

    // PDF আপলোড হলে
    if (req.file && req.file.mimetype === "application/pdf") {
      extractedText = await extractTextFromPdf(req.file.buffer);
      source = "pdf";
    } 
    
    // ইমেজ আপলোড হলে (আপাতত ইমেজের জন্য শুধু MCQ)
    if (req.file && req.file.mimetype.startsWith("image/")) {
      source = "image";
      const base64Image = req.file.buffer.toString("base64");
      questions = await generateMCQFromImage(base64Image, req.file.mimetype, numQuestions || 10, difficulty || "medium");
    } 
    // টেক্সট বা PDF থেকে প্রশ্ন তৈরি
    else if (extractedText) {
      questions = await generateMCQFromText(extractedText, numQuestions || 10, difficulty || "medium", questionType || "mcq");
    } 
    else {
      return res.status(400).json({ success: false, message: "No text or file provided" });
    }

    res.status(200).json({
      success: true,
      source,
      questions,
    });

  } catch (error) {
    console.error("AI Controller Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save Generated Questions to Question Bank
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

    if (!bank) {
      return res.status(404).json({ success: false, message: "Question Bank not found" });
    }

    if (bank.teacher.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    await bank.deleteOne();
    res.json({ success: true, message: "Question Bank deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};