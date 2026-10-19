import express from "express";
import { createNotice, getNotices, deleteNotice } from "../controllers/notice.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("teacher"));

router.route("/")
  .post(createNotice)
  .get(getNotices);

router.route("/:id")
  .delete(deleteNotice);

export default router;