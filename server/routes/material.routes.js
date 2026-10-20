import express from "express";
import { 
  createMaterial, 
  getTeacherMaterials, 
  getStudentMaterials, 
  updateMaterial, 
  deleteMaterial 
} from "../controllers/material.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect);

// স্টুডেন্ট রাউট
router.get("/student", allowRoles("student"), getStudentMaterials);

// টিচার রাউট
router.use(allowRoles("teacher"));
router.post("/", createMaterial);
router.get("/teacher", getTeacherMaterials);
router.put("/:id", updateMaterial);
router.delete("/:id", deleteMaterial);

export default router;