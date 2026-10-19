import Student from "../models/Student.js";
import Payment from "../models/Payment.js";
import Schedule from "../models/Schedule.js";
import Exam from "../models/Exam.js";
import Attendance from "../models/Attendance.js";
import Notice from "../models/Notice.js";

// @desc    Get Teacher Dashboard Stats
// @route   GET /api/dashboard/teacher
export const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const range = req.query.range || '6months';

    const totalStudents = await Student.countDocuments({ teacher: teacherId, active: true });

    // 👈 নতুন: Due হিসাব করার সঠিক পদ্ধতি
    const students = await Student.find({ teacher: teacherId, active: true });
    const paidPayments = await Payment.find({ teacher: teacherId, status: "paid" });

    let totalDue = 0;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); 
    const currentYear = currentDate.getFullYear();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    students.forEach(student => {
      const joinDate = new Date(student.joinDate);
      let joinMonth = joinDate.getMonth();
      let joinYear = joinDate.getFullYear();

      while (joinYear < currentYear || (joinYear === currentYear && joinMonth <= currentMonth)) {
        const monthName = monthNames[joinMonth];
        
        const isPaid = paidPayments.find(p => 
          p.student.toString() === student._id.toString() && 
          p.month === monthName && 
          p.year === joinYear
        );

        if (!isPaid) {
          totalDue += student.monthlyFee;
        }

        joinMonth++;
        if (joinMonth > 11) {
          joinMonth = 0;
          joinYear++;
        }
      }
    });

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = days[new Date().getDay()];
    const todaySchedules = await Schedule.find({ teacher: teacherId, day: today })
      .populate("student", "name class")
      .sort({ time: 1 });

    const totalExams = await Exam.countDocuments({ teacher: teacherId });

    let monthsToFetch = 6;
    if (range === '1year') monthsToFetch = 12;
    if (range === '1month') monthsToFetch = 1;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - (monthsToFetch - 1)); 

    const paidPaymentsForChart = await Payment.find({ 
      teacher: teacherId, 
      status: "paid",
      paidDate: { $gte: startDate } 
    });

    const incomeChartData = [];
    
    for (let i = monthsToFetch - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = monthNames[d.getMonth()];
      const y = d.getFullYear();
      
      const monthlyIncome = paidPaymentsForChart
        .filter(p => {
          const pDate = new Date(p.paidDate);
          return pDate.getMonth() === d.getMonth() && pDate.getFullYear() === y;
        })
        .reduce((acc, curr) => acc + curr.amount, 0);

      incomeChartData.push({
        name: `${mName.slice(0, 3)} ${y.toString().slice(-2)}`,
        income: monthlyIncome
      });
    }

    res.json({
      success: true,
      data: {
        totalStudents,
        totalDue,
        todaySchedules,
        totalExams,
        incomeChartData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Student Dashboard Stats
// @route   GET /api/dashboard/student
export const getStudentDashboard = async (req, res) => {
  try {
    const studentProfile = await Student.findOne({ user: req.user._id });
    
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: "Student profile not linked" });
    }

    const totalPresent = await Attendance.countDocuments({ student: studentProfile._id, status: "present" });
    const totalAbsent = await Attendance.countDocuments({ student: studentProfile._id, status: "absent" });

    const recentPayments = await Payment.find({ student: studentProfile._id }).sort({ createdAt: -1 }).limit(5);

    const pendingExams = await Exam.countDocuments({ student: studentProfile._id, status: "pending" });
    const completedExams = await Exam.countDocuments({ student: studentProfile._id, status: "submitted" });

    let totalDue = 0;
    const paidPayments = await Payment.find({ student: studentProfile._id, status: "paid" });
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); 
    const currentYear = currentDate.getFullYear();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const joinDate = new Date(studentProfile.joinDate);
    let joinMonth = joinDate.getMonth();
    let joinYear = joinDate.getFullYear();

    while (joinYear < currentYear || (joinYear === currentYear && joinMonth <= currentMonth)) {
      const monthName = monthNames[joinMonth];
      const isPaid = paidPayments.find(p => p.month === monthName && p.year === joinYear);

      if (!isPaid) {
        totalDue += studentProfile.monthlyFee;
      }

      joinMonth++;
      if (joinMonth > 11) {
        joinMonth = 0;
        joinYear++;
      }
    }

    const notices = await Notice.find({ teacher: studentProfile.teacher })
      .sort({ createdAt: -1 })
      .limit(3);

    res.json({
      success: true,
      data: {
        studentInfo: {
          name: studentProfile.name,
          class: studentProfile.class,
          subject: studentProfile.subject,
        },
        attendance: {
          present: totalPresent,
          absent: totalAbsent
        },
        recentPayments,
        totalDue,
        exams: {
          pending: pendingExams,
          completed: completedExams
        },
        notices
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};