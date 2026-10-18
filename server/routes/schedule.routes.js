import express from "express";
import { 
  addSchedule, 
  getSchedules, 
  getStudentSchedule, // 👈 নতুন ইমপোর্ট
  deleteSchedule 
} from "../controllers/schedule.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

// Student Route
router.get("/student/my-routine", allowRoles("student"), getStudentSchedule);

// Teacher Routes
router.use(allowRoles("teacher"));
router.route("/").post(addSchedule).get(getSchedules);
router.route("/:id").delete(deleteSchedule);

export default router;