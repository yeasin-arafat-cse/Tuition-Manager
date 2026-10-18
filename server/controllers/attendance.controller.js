import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js"; // 👈 নতুন ইমপোর্ট

// @desc    Mark attendance (Present/Absent)
// @route   POST /api/attendance
export const markAttendance = async (req, res) => {
  try {
    const { studentId, date, status } = req.body;
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      { teacher: req.user._id, student: studentId, date: attendanceDate },
      { status },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance by date (Teacher)
// @route   GET /api/attendance/date/:date
export const getAttendanceByDate = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      teacher: req.user._id,
      date: date,
    }).populate("student", "name class");

    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in student's attendance
// @route   GET /api/attendance/my-attendance
export const getMyAttendance = async (req, res) => {
  try {
    const studentProfile = await Student.findOne({ user: req.user._id });
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    const attendance = await Attendance.find({ student: studentProfile._id })
      .sort({ date: -1 });

    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};