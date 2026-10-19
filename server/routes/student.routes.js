import express from "express";
import { 
  addStudent, 
  getStudents, 
  getStudentById, 
  updateStudent, 
  deleteStudent, 
  getStudentProfile 
} from "../controllers/student.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect);
router.use(allowRoles("teacher"));

router.route("/").post(addStudent).get(getStudents);
router.route("/:id").get(getStudentById).put(updateStudent).delete(deleteStudent);
router.get("/:id/profile", getStudentProfile); // 👈 নতুন রাউট

export default router;