import express from "express";
import { 
  getAllUsers, 
  updateUserStatus, 
  getSettings, 
  updateSettings,
  getAdminStats,
  sendGlobalNotice,
  deleteUser // 👈 নতুন ইমপোর্ট
} from "../controllers/admin.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("admin"));

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.put("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser); // 👈 নতুন রাউট
router.get("/settings", getSettings);
router.put("/settings", updateSettings);
router.post("/global-notice", sendGlobalNotice);

export default router;