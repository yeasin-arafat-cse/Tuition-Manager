import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";

// @desc    Mark attendance
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

// @desc    Get attendance by Month (Card System)
// @route   GET /api/attendance?month=YYYY-MM
export const getMonthlyAttendance = async (req, res) => {
  try {
    const { month } = req.query; 
    let startDate, endDate;

    if (month) {
      const [year, monthNum] = month.split('-');
      startDate = new Date(year, monthNum - 1, 1);
      endDate = new Date(year, monthNum, 0); 
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const attendances = await Attendance.find({
      teacher: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const students = await Student.find({ teacher: req.user._id, active: true });

    const studentCards = students.map(student => {
      const studentAtt = attendances.filter(a => a.student.toString() === student._id.toString());
      
      const present = studentAtt.filter(a => a.status === 'present').length;
      const absent = studentAtt.filter(a => a.status === 'absent').length;
      const offDay = studentAtt.filter(a => a.status === 'off_day').length;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayRecord = studentAtt.find(a => new Date(a.date).getTime() === today.getTime());

      return {
        _id: student._id,
        name: student.name,
        class: student.class,
        present,
        absent,
        offDay,
        todayStatus: todayRecord ? todayRecord.status : null
      };
    });

    res.json({ success: true, studentCards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete attendance for a specific student in a specific month
// @route   DELETE /api/attendance/student/:studentId/month/:month
export const deleteMonthlyAttendance = async (req, res) => {
  try {
    const { studentId, month } = req.params; 
    const [year, monthNum] = month.split('-');
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);

    await Attendance.deleteMany({
      teacher: req.user._id,
      student: studentId,
      date: { $gte: startDate, $lte: endDate }
    });

    res.json({ success: true, message: "Attendance deleted for this month" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete specific day attendance for a student
// @route   DELETE /api/attendance/student/:studentId/date/:date
export const deleteSpecificAttendance = async (req, res) => {
  try {
    const { studentId, date } = req.params;
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const result = await Attendance.findOneAndDelete({
      teacher: req.user._id,
      student: studentId,
      date: attendanceDate
    });

    if (!result) {
      return res.status(404).json({ success: false, message: "No attendance found for this date" });
    }

    res.json({ success: true, message: "Attendance deleted for this day" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get specific student's attendance details for a month
// @route   GET /api/attendance/student/:studentId/details?month=YYYY-MM
export const getStudentAttendanceDetails = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month } = req.query;
    
    const [year, monthNum] = month.split('-');
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);

    const attendances = await Attendance.find({
      teacher: req.user._id,
      student: studentId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    res.json({ success: true, attendances });
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

    const totalOffDays = await Attendance.countDocuments({ student: studentProfile._id, status: "off_day" });

    res.json({ success: true, attendance, totalOffDays });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};