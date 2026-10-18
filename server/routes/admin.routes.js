import express from "express";
import { 
  getAllUsers, 
  updateUserStatus, 
  getSettings, 
  updateSettings 
} from "../controllers/admin.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// সব রাউটে লগইন এবং Admin রোল বাধ্যতামূলক
router.use(protect);
router.use(allowRoles("admin"));

router.get("/users", getAllUsers);
router.put("/users/:id/status", updateUserStatus);

router.get("/settings", getSettings);
router.put("/settings", updateSettings);

export default router;