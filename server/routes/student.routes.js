import express from "express";
import { 
  addStudent, 
  getStudents, 
  getStudentById, 
  updateStudent, 
  deleteStudent, 
  getStudentProfile,
  getMyProfile
} from "../controllers/student.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect);

// Student Route
router.get("/my-profile", allowRoles("student"), getMyProfile);

// Teacher Routes
router.use(allowRoles("teacher"));
router.route("/").post(addStudent).get(getStudents);
router.route("/:id").get(getStudentById).put(updateStudent).delete(deleteStudent);
router.get("/:id/profile", getStudentProfile);

export default router;