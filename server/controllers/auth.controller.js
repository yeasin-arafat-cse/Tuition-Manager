import User from "../models/User.js";
import Student from "../models/Student.js";
import AdminSettings from "../models/AdminSettings.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    let settings = await AdminSettings.findOne();
    if (settings && !settings.registrationOpen && role !== 'admin') {
      return res.status(403).json({ success: false, message: "Registration is currently closed by the Admin." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    let studentProfile = null;
    if (role === "student") {
      studentProfile = await Student.findOne({ email: email });
      if (!studentProfile) {
        return res.status(403).json({ 
          success: false, 
          message: "Access Denied! Your email is not registered by any teacher." 
        });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "student",
      phone,
    });

    if (role === "student" && studentProfile) {
      studentProfile.user = user._id;
      await studentProfile.save();
    }

    if (user) {
      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.status === "blocked") {
        return res.status(403).json({ success: false, message: "Your account is blocked." });
      }

      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });

      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      
      const updatedUser = await user.save();

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
        },
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user password
// @route   PUT /api/auth/password
export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // পুরনো পাসওয়ার্ড চেক করা
      if (await user.matchPassword(req.body.oldPassword)) {
        user.password = req.body.newPassword;
        await user.save();
        res.json({ success: true, message: "Password updated successfully" });
      } else {
        res.status(401).json({ success: false, message: "Incorrect old password" });
      }
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};