import User from "../models/User.js";
import AdminSettings from "../models/AdminSettings.js";
import Exam from "../models/Exam.js";
import Material from "../models/Material.js";
import Notice from "../models/Notice.js";

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    const totalTeachers = await User.countDocuments({ role: "teacher" });
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalGuardians = await User.countDocuments({ role: "guardian" });
    const totalExams = await Exam.countDocuments();
    const totalMaterials = await Material.countDocuments();

    res.json({
      success: true,
      data: {
        totalTeachers,
        totalStudents,
        totalGuardians,
        totalExams,
        totalMaterials
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user status (Approve/Block)
// @route   PUT /api/admin/users/:id/status
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body; 
    
    if (!["approved", "blocked", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: `User status updated to ${status}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Admin Settings
// @route   GET /api/admin/settings
export const getSettings = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = await AdminSettings.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Admin Settings
// @route   PUT /api/admin/settings
export const updateSettings = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    
    if (!settings) {
      settings = await AdminSettings.create(req.body);
    } else {
      settings = await AdminSettings.findByIdAndUpdate(settings._id, req.body, { new: true });
    }
    
    res.json({ success: true, message: "Settings updated", settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send Global Notice
// @route   POST /api/admin/global-notice
export const sendGlobalNotice = async (req, res) => {
  try {
    const { title, message } = req.body; 

    const notice = await Notice.create({
      teacher: null, 
      student: null,
      title,
      message,
    });

    res.status(201).json({ success: true, message: "Global notice sent successfully", notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};