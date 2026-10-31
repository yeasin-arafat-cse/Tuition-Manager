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

    const students = await Student.find({ teacher: teacherId, active: true });
    const paidPayments = await Payment.find({ teacher: teacherId, status: "paid" });

    // Due হিসাব (৩০ দিনের সাইকেল)
    let totalDue = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    students.forEach(student => {
      const joinDate = new Date(student.joinDate);
      joinDate.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(currentDate - joinDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let cyclesPassed = 0;
      if (diffDays >= 30) {
        cyclesPassed = Math.floor(diffDays / 30);
      }

      for (let i = 1; i <= cyclesPassed; i++) {
        const cycleDate = new Date(joinDate);
        cycleDate.setDate(cycleDate.getDate() + (i * 30)); 

        const monthName = monthNames[cycleDate.getMonth()];
        const year = cycleDate.getFullYear();

        const isPaid = paidPayments.find(p => 
          p.student.toString() === student._id.toString() && 
          p.month === monthName && 
          p.year === year
        );

        if (!isPaid) {
          totalDue += student.monthlyFee;
        }
      }
    });

    const allSchedules = await Schedule.find({ teacher: teacherId })
      .populate("student", "name class")
      .sort({ time: 1 });

    const totalExams = await Exam.countDocuments({ teacher: teacherId });

    // 👈 আয়ের চার্ট ডেটা (Daily, Monthly, Yearly) — ডাবল লাইন ফিক্স সহ
    let incomeChartData = [];
    const allPaidPayments = await Payment.find({ teacher: teacherId, status: "paid" });

    if (range === 'daily') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
        
        const dailyIncome = allPaidPayments
          .filter(p => p.paidDate && new Date(p.paidDate).toDateString() === d.toDateString())
          .reduce((acc, curr) => acc + curr.amount, 0);
          
        incomeChartData.push({ name: dateString, income: dailyIncome });
      }
    } else if (range === 'yearly') {
      const currentYear = new Date().getFullYear();
      for (let i = 4; i >= 0; i--) {
        const year = currentYear - i;
        const yearlyIncome = allPaidPayments
          .filter(p => p.paidDate && new Date(p.paidDate).getFullYear() === year)
          .reduce((acc, curr) => acc + curr.amount, 0);
        incomeChartData.push({ name: year.toString(), income: yearlyIncome });
      }
    } else {
      // ডিফল্ট: গত ৬ মাসের আয় (monthly)
      const monthsToFetch = 6;
      for (let i = monthsToFetch - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const mName = monthNames[d.getMonth()].slice(0, 3);
        const y = d.getFullYear();
        
        // 👈 এখানে ফিক্স করা হলো: নির্দিষ্ট মাসের সব পেমেন্ট যোগ হবে
        const monthlyIncome = allPaidPayments
          .filter(p => {
            if (!p.paidDate) return false;
            const pDate = new Date(p.paidDate);
            return pDate.getMonth() === d.getMonth() && pDate.getFullYear() === y;
          })
          .reduce((acc, curr) => acc + curr.amount, 0);

        incomeChartData.push({ name: `${mName} ${y.toString().slice(-2)}`, income: monthlyIncome });
      }
    }

    // আজকের আয় ও এই মাসের আয়
    const todayStr = new Date().toDateString();
    const todayIncome = allPaidPayments.filter(p => p.paidDate && new Date(p.paidDate).toDateString() === todayStr).reduce((a, b) => a + b.amount, 0);
    
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const thisMonthIncome = allPaidPayments.filter(p => {
      if (!p.paidDate) return false;
      const pDate = new Date(p.paidDate);
      return pDate.getMonth() === thisMonth && pDate.getFullYear() === thisYear;
    }).reduce((a, b) => a + b.amount, 0);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalDue,
        allSchedules,
        totalExams,
        incomeChartData,
        todayIncome,
        thisMonthIncome
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
    
    const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
    const currentYearNum = new Date().getFullYear();

    const recentPayments = await Payment.find({ student: studentProfile._id }).sort({ createdAt: -1 }).limit(5);

    const pendingExams = await Exam.countDocuments({ student: studentProfile._id, status: "pending" });
    const completedExams = await Exam.countDocuments({ student: studentProfile._id, status: "submitted" });

    let totalDue = 0;
    const paidPayments = await Payment.find({ student: studentProfile._id, status: "paid" });
    
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const joinDate = new Date(studentProfile.joinDate);
    joinDate.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(currentDate - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let cyclesPassed = 0;
    if (diffDays >= 30) {
        cyclesPassed = Math.floor(diffDays / 30);
    }

    for (let i = 1; i <= cyclesPassed; i++) {
      const cycleDate = new Date(joinDate);
      cycleDate.setDate(cycleDate.getDate() + (i * 30)); 

      const monthName = monthNames[cycleDate.getMonth()];
      const year = cycleDate.getFullYear();

      const isPaid = paidPayments.find(p => p.month === monthName && p.year === year);

      if (!isPaid) {
        totalDue += studentProfile.monthlyFee;
      }
    }

    const studentSchedules = await Schedule.find({ student: studentProfile._id });

    const notices = await Notice.find({ 
      teacher: studentProfile.teacher,
      $or: [
        { student: null }, 
        { student: studentProfile._id } 
      ]
    })
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
          absent: totalAbsent,
          monthName: currentMonthName,
          year: currentYearNum
        },
        recentPayments,
        totalDue,
        exams: {
          pending: pendingExams,
          completed: completedExams
        },
        notices,
        studentSchedules
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};