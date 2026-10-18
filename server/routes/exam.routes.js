import express from "express";
import { 
  createExam, 
  getExamById, 
  submitExam, 
  getStudentExams,
  getTeacherExams,
  updateExam,
  deleteExam
} from "../controllers/exam.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

// Teacher Routes
router.post("/create", allowRoles("teacher"), createExam);
router.get("/teacher/all", allowRoles("teacher"), getTeacherExams);
router.put("/:id", allowRoles("teacher"), updateExam);
router.delete("/:id", allowRoles("teacher"), deleteExam);

// Student & Teacher Routes
router.get("/:id", getExamById);

// Student Routes
router.post("/:id/submit", allowRoles("student"), submitExam);
router.get("/student/my-exams", allowRoles("student"), getStudentExams);

export default router;