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

// @desc    Generate MCQ/Short/Creative
// @route   POST /api/ai/generate
export const generateMCQ = async (req, res) => {
  try {
    const { text, numQuestions, difficulty, subject, sourceType, questionType } = req.body;
    
    // 👈 টার্মিনালে চেক করার জন্য (যদি এরর আসে)
    console.log("File received:", req.file ? req.file.mimetype : "No file");
    console.log("Text received:", text ? "Yes" : "No");

    let source = sourceType || "text";
    let questions = [];
    let extractedText = text;

    // ১. যদি PDF ফাইল আপলোড করা হয়
    if (req.file && req.file.mimetype === "application/pdf") {
      extractedText = await extractTextFromPdf(req.file.buffer);
      source = "pdf";
      
      if (!extractedText || extractedText.trim() === "") {
        return res.status(400).json({ success: false, message: "Could not extract text from this PDF. It might be an image-based PDF." });
      }
    } 
    // ২. যদি Image ফাইল আপলোড করা হয়
    else if (req.file && req.file.mimetype.startsWith("image/")) {
      source = "image";
      const base64Image = req.file.buffer.toString("base64");
      questions = await generateMCQFromImage(base64Image, req.file.mimetype, numQuestions || 10, difficulty || "medium", questionType || "mcq");
    } 
    // ৩. যদি টেক্সট দেওয়া হয়
    else if (extractedText) {
      source = "text";
      questions = await generateMCQFromText(extractedText, numQuestions || 10, difficulty || "medium", questionType || "mcq");
    } 
    else {
      return res.status(400).json({ success: false, message: "No text or file provided. Please check the file type." });
    }

    // যদি PDF বা Text থেকে প্রশ্ন তৈরি করা লাগে (Image এর ক্ষেত্রে আগেই করা হয়ে গেছে)
    if (source === "pdf" || source === "text") {
       questions = await generateMCQFromText(extractedText, numQuestions || 10, difficulty || "medium", questionType || "mcq");
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