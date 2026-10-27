import express from "express";
import multer from "multer";
import { generateMCQ, saveMCQ, getQuestionBanks, deleteQuestionBank } from "../controllers/ai.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

// ফাইল মেমোরিতে রাখার জন্য (ডিস্কে সেভ হবে না)
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.use(protect);
router.use(allowRoles("teacher"));

// 👈 এখানে "file" নামটি ফ্রন্টএন্ডের FormData এর সাথে মিলতে হবে
router.post("/generate", upload.single("file"), generateMCQ); 
router.post("/save", saveMCQ);
router.get("/question-bank", getQuestionBanks);
router.delete("/question-bank/:id", deleteQuestionBank);

export default router;