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

// @desc    Generate MCQ/Short/Creative
// @route   POST /api/ai/generate
export const generateMCQ = async (req, res) => {
  try {
    const { text, numQuestions, difficulty, subject, sourceType, questionType } = req.body;
    let source = sourceType || "text";
    let questions = [];
    let extractedText = text || "";

    if (req.files && req.files.length > 0) {
      const pdfFiles = req.files.filter(f => f.mimetype === "application/pdf");
      const imageFiles = req.files.filter(f => f.mimetype.startsWith("image/"));

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
      else if (imageFiles.length > 0) {
        source = "image";
        const base64Images = imageFiles.map(f => f.buffer.toString("base64"));
        questions = await generateMCQFromImage(base64Images, "image/jpeg", numQuestions || 10, difficulty || "medium", questionType || "mcq");
      }
    } 
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
    const { class: studentClass, subject, source, questions } = req.body;
    
    if (!studentClass) {
      return res.status(400).json({ success: false, message: "Class is required" });
    }

    const bank = await QuestionBank.create({
      teacher: req.user._id,
      class: studentClass,
      subject,
      source,
      questions,
    });
    res.status(201).json({ success: true, bank });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all Question Banks (With Filters)
// @route   GET /api/ai/question-bank
export const getQuestionBanks = async (req, res) => {
  try {
    const { class: filterClass, subject: filterSubject } = req.query;
    
    let query = { teacher: req.user._id };
    
    // 👈 কেস-ইনসেনসিটিভ (Case-insensitive) সার্চ
    if (filterClass) {
      query.class = { $regex: filterClass, $options: "i" };
    }
    if (filterSubject) {
      query.subject = { $regex: filterSubject, $options: "i" }; 
    }

    const banks = await QuestionBank.find(query).sort({ createdAt: -1 });
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