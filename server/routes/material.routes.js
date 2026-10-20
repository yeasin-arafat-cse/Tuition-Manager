import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { 
  createMaterial, 
  getTeacherMaterials, 
  getStudentMaterials, 
  updateMaterial, 
  deleteMaterial 
} from "../controllers/material.controller.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

// 👈 Cloudinary স্টোরেজ সেটআপ
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "tuition_materials",
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
    transformation: [{ width: 1000, crop: "limit" }],
  },
});

const upload = multer({ storage });

const router = express.Router();
router.use(protect);

// স্টুডেন্ট রাউট
router.get("/student", allowRoles("student"), getStudentMaterials);

// টিচার রাউট
router.use(allowRoles("teacher"));
router.post("/", upload.single("imageFile"), createMaterial); // 👈 imageFile ফিল্ড
router.get("/teacher", getTeacherMaterials);
router.put("/:id", upload.single("imageFile"), updateMaterial);
router.delete("/:id", deleteMaterial);

export default router;