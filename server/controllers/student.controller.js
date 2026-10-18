import Student from "../models/Student.js";
import User from "../models/User.js";

// @desc    Add new student
// @route   POST /api/students
export const addStudent = async (req, res) => {
  try {
    const { name, email, class: studentClass, subject, guardianName, guardianPhone, monthlyFee, joinDate } = req.body;

    // চেক করা এই ইমেইল দিয়ে আগে কোনো ইউজার (বা স্টুডেন্ট) আছে কিনা
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "This email is already registered" });
    }
    
    const studentExists = await Student.findOne({ email });
    if (studentExists) {
      return res.status(400).json({ success: false, message: "Student with this email already exists" });
    }

    // স্টুডেন্ট প্রোফাইল তৈরি করা (joinDate সহ)
    const student = await Student.create({
      teacher: req.user._id,
      name,
      email,
      class: studentClass,
      subject,
      guardianName,
      guardianPhone,
      monthlyFee,
      joinDate: joinDate || Date.now(), // 👈 নতুন: জয়েন ডেট সেভ হবে
    });

    res.status(201).json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all students of logged in teacher
// @route   GET /api/students
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find({ teacher: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: students.length, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    if (student.teacher.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
export const updateStudent = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    if (student.teacher.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    if (student.teacher.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    
    // স্টুডেন্ট ডিলিট করার সময় তার ইউজার অ্যাকাউন্টও ডিলিট করা
    if (student.user) {
      await User.findByIdAndDelete(student.user);
    }

    await student.deleteOne();
    res.json({ success: true, message: "Student removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};