import User from "../models/User.js";
import AdminSettings from "../models/AdminSettings.js";
import Exam from "../models/Exam.js";
import Material from "../models/Material.js";
import Notice from "../models/Notice.js";
import Student from "../models/Student.js";
import Payment from "../models/Payment.js";
import Attendance from "../models/Attendance.js";
import Schedule from "../models/Schedule.js";

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
      data: { totalTeachers, totalStudents, totalGuardians, totalExams, totalMaterials }
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

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body; 
    if (!["approved", "blocked", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
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
    if (!settings) settings = await AdminSettings.create({});
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
    const notice = await Notice.create({ teacher: null, student: null, title, message });
    res.status(201).json({ success: true, message: "Global notice sent successfully", notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete User (And their associated data)
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (userToDelete.role === "admin") {
      return res.status(400).json({ success: false, message: "Cannot delete an admin account" });
    }

    // 👈 যদি ইউজার টিচার হয়, তার সব স্টুডেন্ট এবং রিলেটেড ডেটা ডিলিট করা
    if (userToDelete.role === "teacher") {
      const students = await Student.find({ teacher: userToDelete._id });
      const studentIds = students.map(s => s._id);

      // স্টুডেন্টদের ডেটা ডিলিট
      await Payment.deleteMany({ student: { $in: studentIds } });
      await Attendance.deleteMany({ student: { $in: studentIds } });
      await Exam.deleteMany({ student: { $in: studentIds } });
      
      // স্টুডেন্টদের ইউজার অ্যাকাউন্ট ডিলিট
      const studentUsers = students.map(s => s.user).filter(id => id);
      await User.deleteMany({ _id: { $in: studentUsers } });

      // স্টুডেন্ট প্রোফাইল ডিলিট
      await Student.deleteMany({ teacher: userToDelete._id });

      // টিচারের অন্যান্য ডেটা ডিলিট
      await Schedule.deleteMany({ teacher: userToDelete._id });
      await Notice.deleteMany({ teacher: userToDelete._id });
      await Material.deleteMany({ teacher: userToDelete._id });
      await Exam.deleteMany({ teacher: userToDelete._id });
    } 
    // 👈 যদি ইউজার স্টুডেন্ট হয়
    else if (userToDelete.role === "student") {
      const studentProfile = await Student.findOne({ user: userToDelete._id });
      if (studentProfile) {
        await Payment.deleteMany({ student: studentProfile._id });
        await Attendance.deleteMany({ student: studentProfile._id });
        await Exam.deleteMany({ student: studentProfile._id });
        await Material.deleteMany({ student: studentProfile._id });
        await Student.findByIdAndDelete(studentProfile._id);
      }
    }

    // সবশেষে মূল ইউজার অ্যাকাউন্ট ডিলিট
    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "User and all associated data deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};