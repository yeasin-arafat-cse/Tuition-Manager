import express from "express";
import {
  addStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "../controllers/student.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// সব রাউটে লগইন বাধ্যতামূলক (protect) এবং শুধুমাত্র Teacher রোল অ্যাক্সেস করতে পারবে (allowRoles)
router.use(protect);
router.use(allowRoles("teacher"));

router.route("/")
  .post(addStudent)
  .get(getStudents);

router.route("/:id")
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

export default router;