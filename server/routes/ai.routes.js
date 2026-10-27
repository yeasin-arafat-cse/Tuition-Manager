import express from "express";
import multer from "multer";
import { generateMCQ, saveMCQ, getQuestionBanks, deleteQuestionBank } from "../controllers/ai.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

// ফাইল মেমোরিতে রাখার জন্য (ডিস্কে সেভ হবে না)
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.use(protect);
router.use(allowRoles("teacher"));

// 👈 upload.array("files", 5) দিলাম, যাতে একসাথে সর্বোচ্চ ৫টি ফাইল পাঠানো যায়
router.post("/generate", upload.array("files", 5), generateMCQ); 
router.post("/save", saveMCQ);
router.get("/question-bank", getQuestionBanks);
router.delete("/question-bank/:id", deleteQuestionBank);

export default router;