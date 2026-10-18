import express from "express";
import { getGuardianDashboard } from "../controllers/guardian.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("guardian"));

router.get("/dashboard", getGuardianDashboard);

export default router;