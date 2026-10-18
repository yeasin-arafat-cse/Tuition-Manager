import express from "express";
import { getTeacherDashboard, getStudentDashboard } from "../controllers/dashboard.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

// টিচার ড্যাশবোর্ড
router.get("/teacher", allowRoles("teacher"), getTeacherDashboard);

// স্টুডেন্ট ড্যাশবোর্ড
router.get("/student", allowRoles("student"), getStudentDashboard);

export default router;