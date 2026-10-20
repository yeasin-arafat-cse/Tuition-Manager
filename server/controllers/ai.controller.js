import QuestionBank from "../models/QuestionBank.js";
import { generateMCQFromText, generateMCQFromImage } from "../services/gemini.service.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const extractTextFromPdf = (buffer) => {
  return new Promise((resolve, reject) => {
    let text = "";
    new pdfParse.PdfReader({}).parseBuffer(buffer, (err, item) => {
      if (err) reject(err);
      else if (!item) resolve(text);
      else if (item.text) text += item.text + " ";
    });
  });
};

export const generateMCQ = async (req, res) => {
  try {
    const { text, numQuestions, difficulty, subject, sourceType, questionType } = req.body; 
    let source = sourceType || "text";
    let questions = [];
    let extractedText = text;

    if (req.file && req.file.mimetype === "application/pdf") {
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = pdfData.text;
      source = "pdf";
    } 
    
    if (!extractedText && req.file && req.file.mimetype.startsWith("image/")) {
      source = "image";
      const base64Image = req.file.buffer.toString("base64");
      questions = await generateMCQFromImage(base64Image, req.file.mimetype, numQuestions || 10, difficulty || "medium");
    } else if (extractedText) {
      questions = await generateMCQFromText(extractedText, numQuestions || 10, difficulty || "medium", questionType || "mcq");
    } else {
      return res.status(400).json({ success: false, message: "No text or file provided" });
    }

    res.status(200).json({ success: true, source, questions });
  } catch (error) {
    console.error("AI Controller Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

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

export const getQuestionBanks = async (req, res) => {
  try {
    const banks = await QuestionBank.find({ teacher: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, banks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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