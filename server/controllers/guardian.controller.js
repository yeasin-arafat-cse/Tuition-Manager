import Student from "../models/Student.js";
import Payment from "../models/Payment.js";
import Attendance from "../models/Attendance.js";

// @desc    Get Guardian's child data
// @route   GET /api/guardian/dashboard
export const getGuardianDashboard = async (req, res) => {
  try {
    const guardianPhone = req.user.phone; 

    if (!guardianPhone) {
      return res.status(400).json({ success: false, message: "Guardian phone number not set in profile" });
    }

    const student = await Student.findOne({ guardianPhone: guardianPhone });

    if (!student) {
      return res.status(404).json({ success: false, message: "No student found linked to this phone number" });
    }

    // হাজিরার সামারি
    const totalPresent = await Attendance.countDocuments({ student: student._id, status: "present" });
    const totalAbsent = await Attendance.countDocuments({ student: student._id, status: "absent" });

    // 👈 নতুন: সাম্প্রতিক ১০ দিনের হাজিরার লিস্ট
    const recentAttendance = await Attendance.find({ student: student._id })
      .sort({ date: -1 })
      .limit(10);

    // সাম্প্রতিক পেমেন্ট
    const payments = await Payment.find({ student: student._id }).sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      student,
      attendanceSummary: { present: totalPresent, absent: totalAbsent },
      recentAttendance, // 👈 লিস্ট পাঠানো হলো
      payments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};