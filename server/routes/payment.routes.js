import express from "express";
import { createPayment, getStudentPayments, getDuePayments, getMyPayments } from "../controllers/payment.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

// 👈 স্টুডেন্ট রাউট (সবার আগে)
router.get("/my-payments", allowRoles("student"), getMyPayments);

// টিচার রাউট
router.use(allowRoles("teacher"));
router.post("/", createPayment);
router.get("/due", getDuePayments);
router.get("/student/:studentId", getStudentPayments);

export default router;