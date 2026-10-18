import express from "express";
import { markAttendance, getAttendanceByDate, getMyAttendance } from "../controllers/attendance.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

// 👈 স্টুডেন্ট রাউট (সবার আগে থাকতে হবে)
router.get("/my-attendance", allowRoles("student"), getMyAttendance);

// টিচার রাউট
router.use(allowRoles("teacher"));
router.post("/", markAttendance);
router.get("/date/:date", getAttendanceByDate);

export default router;