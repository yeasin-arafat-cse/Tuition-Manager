import QuestionBank from "../models/QuestionBank.js";
import { generateMCQFromText, generateMCQFromImage } from "../services/gemini.service.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

// @desc    Generate MCQ from Text/PDF/Image
// @route   POST /api/ai/generate
export const generateMCQ = async (req, res) => {
  try {
    const { text, numQuestions, difficulty, subject, sourceType } = req.body;
    let source = sourceType || "text";
    let questions = [];

    // ১. PDF আপলোড
    if (req.file && req.file.mimetype === "application/pdf") {
      const pdfData = await pdfParse(req.file.buffer);
      source = "pdf";
      questions = await generateMCQFromText(pdfData.text, numQuestions || 10, difficulty || "medium");
    } 
    // ২. Image আপলোড
    else if (req.file && req.file.mimetype.startsWith("image/")) {
      source = "image";
      const base64Image = req.file.buffer.toString("base64");
      questions = await generateMCQFromImage(base64Image, req.file.mimetype, numQuestions || 10, difficulty || "medium");
    }
    // ৩. সাধারণ টেক্সট
    else if (text) {
      source = "text";
      questions = await generateMCQFromText(text, numQuestions || 10, difficulty || "medium");
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

// @desc    Save Generated MCQs to Question Bank
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

    // চেক করা এই ব্যাংকটি এই টিচারের কিনা
    if (bank.teacher.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    await bank.deleteOne();
    res.json({ success: true, message: "Question Bank deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};