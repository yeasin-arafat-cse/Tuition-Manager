import Student from "../models/Student.js";
import Payment from "../models/Payment.js";
import Attendance from "../models/Attendance.js";
import Notice from "../models/Notice.js"; // 👈 নতুন ইমপোর্ট

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

    const totalPresent = await Attendance.countDocuments({ student: student._id, status: "present" });
    const totalAbsent = await Attendance.countDocuments({ student: student._id, status: "absent" });

    const recentAttendance = await Attendance.find({ student: student._id })
      .sort({ date: -1 })
      .limit(10);

    const payments = await Payment.find({ student: student._id }).sort({ createdAt: -1 }).limit(5);

    // 👈 নতুন: টিচারের নোটিশ আনা
    const notices = await Notice.find({ teacher: student.teacher })
      .sort({ createdAt: -1 })
      .limit(3);

    res.json({
      success: true,
      student,
      attendanceSummary: { present: totalPresent, absent: totalAbsent },
      recentAttendance,
      payments,
      notices // 👈 নোটিশ পাঠানো হলো
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};