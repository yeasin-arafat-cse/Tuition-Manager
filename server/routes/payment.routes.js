import express from "express";
import { 
  createPayment, 
  getStudentPayments, 
  getDuePayments, 
  getMyPayments, 
  deletePayment // 👈 নতুন ইমপোর্ট
} from "../controllers/payment.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

// Student Route
router.get("/my-payments", allowRoles("student"), getMyPayments);

// Teacher Routes
router.use(allowRoles("teacher"));
router.post("/", createPayment);
router.get("/due", getDuePayments);
router.get("/student/:studentId", getStudentPayments);
router.delete("/:id", deletePayment); // 👈 নতুন রাউট

export default router;