import express from "express";
import { createNotice, getNotices, deleteNotice, getStudentNotices } from "../controllers/notice.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect);

// Student Route
router.get("/student", allowRoles("student"), getStudentNotices);

// Teacher Routes
router.use(allowRoles("teacher"));
router.route("/").post(createNotice).get(getNotices);
router.route("/:id").delete(deleteNotice);

export default router;