import Student from "../models/Student.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Attendance from "../models/Attendance.js";

// @desc    Add new student
// @route   POST /api/students
export const addStudent = async (req, res) => {
  try {
    const { name, email, class: studentClass, subject, guardianName, guardianPhone, monthlyFee, joinDate } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "This email is already registered" });
    }
    
    const studentExists = await Student.findOne({ email });
    if (studentExists) {
      return res.status(400).json({ success: false, message: "Student with this email already exists" });
    }

    const student = await Student.create({
      teacher: req.user._id,
      name,
      email,
      class: studentClass,
      subject,
      guardianName,
      guardianPhone,
      monthlyFee,
      joinDate: joinDate || Date.now(),
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
    
    if (student.user) {
      await User.findByIdAndDelete(student.user);
    }

    await student.deleteOne();
    res.json({ success: true, message: "Student removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student full profile (For Teacher)
// @route   GET /api/students/:id/profile
export const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student || student.teacher.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const payments = await Payment.find({ student: student._id }).sort({ year: -1, month: -1 });
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const currentMonthAttendance = await Attendance.find({
      student: student._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const present = currentMonthAttendance.filter(a => a.status === 'present').length;
    const absent = currentMonthAttendance.filter(a => a.status === 'absent').length;
    const offDay = currentMonthAttendance.filter(a => a.status === 'off_day').length;

    res.json({
      success: true,
      student,
      payments,
      attendance: { 
        present, 
        absent,
        offDay,
        monthName: now.toLocaleString('default', { month: 'long' }), 
        year: now.getFullYear()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in student's full profile
// @route   GET /api/students/my-profile
export const getMyProfile = async (req, res) => { // 👈 এই ফাংশনটি নিশ্চিত করুন এখানে আছে
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    const payments = await Payment.find({ student: student._id, status: "paid" });
    const totalPaid = payments.reduce((acc, curr) => acc + curr.amount, 0);

    const totalPresent = await Attendance.countDocuments({ student: student._id, status: "present" });
    const totalAbsent = await Attendance.countDocuments({ student: student._id, status: "absent" });

    res.json({
      success: true,
      student,
      totalPaid,
      attendance: { present: totalPresent, absent: totalAbsent }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};