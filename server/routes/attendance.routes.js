import express from "express";
import { 
  markAttendance, 
  getMonthlyAttendance, 
  deleteMonthlyAttendance,
  deleteSpecificAttendance,
  getStudentAttendanceDetails, // 👈 নতুন
  getMyAttendance 
} from "../controllers/attendance.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect);

// স্টুডেন্ট রাউট
router.get("/my-attendance", allowRoles("student"), getMyAttendance);

// টিচার রাউট
router.use(allowRoles("teacher"));
router.post("/", markAttendance);
router.get("/", getMonthlyAttendance); 
router.delete("/student/:studentId/month/:month", deleteMonthlyAttendance); 
router.delete("/student/:studentId/date/:date", deleteSpecificAttendance);
router.get("/student/:studentId/details", getStudentAttendanceDetails); // 👈 নতুন

export default router;