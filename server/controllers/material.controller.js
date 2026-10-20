import Material from "../models/Material.js";
import Student from "../models/Student.js";

// @desc    Create a new material
// @route   POST /api/materials
export const createMaterial = async (req, res) => {
  try {
    const body = req.body || {}; 
    const { studentId, title, description } = body;
    
    if (!studentId) {
      return res.status(400).json({ success: false, message: "Student ID is required" });
    }

    const imageUrl = req.file ? req.file.path : null; 

    const material = await Material.create({
      teacher: req.user._id,
      student: studentId,
      title,
      description,
      imageUrl,
    });
    res.status(201).json({ success: true, material });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all materials (For Teacher)
// @route   GET /api/materials/teacher
export const getTeacherMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ teacher: req.user._id })
      .populate("student", "name class")
      .sort({ createdAt: -1 });
    res.json({ success: true, materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get materials for logged-in student
// @route   GET /api/materials/student
export const getStudentMaterials = async (req, res) => {
  try {
    const studentProfile = await Student.findOne({ user: req.user._id });
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    const materials = await Material.find({ student: studentProfile._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a material
// @route   PUT /api/materials/:id
export const updateMaterial = async (req, res) => {
  try {
    const body = req.body || {}; 
    const { title, description } = body;
    
    let material = await Material.findById(req.params.id);

    if (!material || material.teacher.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: "Material not found" });
    }

    material.title = title || material.title;
    material.description = description || material.description;
    
    if (req.file) {
      material.imageUrl = req.file.path;
    }

    await material.save();
    res.json({ success: true, material });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a material
// @route   DELETE /api/materials/:id
export const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material || material.teacher.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: "Material not found" });
    }
    await material.deleteOne();
    res.json({ success: true, message: "Material deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};