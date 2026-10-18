import User from "../models/User.js";
import AdminSettings from "../models/AdminSettings.js";

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
    const { status } = req.body; // "approved" or "blocked" or "pending"
    
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
    
    // যদি ডেটাবেসে সেটিংস না থাকে, তবে ডিফল্ট সেটিংস তৈরি করে নিবে
    if (!settings) {
      settings = await AdminSettings.create({});
    }
    
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Admin Settings (Registration On/Off)
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