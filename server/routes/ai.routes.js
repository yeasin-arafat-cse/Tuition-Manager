import express from "express";
import multer from "multer";
import { generateMCQ, saveMCQ, getQuestionBanks, deleteQuestionBank } from "../controllers/ai.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.use(protect);
router.use(allowRoles("teacher"));

router.post("/generate", upload.single("file"), generateMCQ); 
router.post("/save", saveMCQ);
router.get("/question-bank", getQuestionBanks);
router.delete("/question-bank/:id", deleteQuestionBank);

export default router;