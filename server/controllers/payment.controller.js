import Payment from "../models/Payment.js";
import Student from "../models/Student.js";

// @desc    Create or Update Payment
// @route   POST /api/payments
export const createPayment = async (req, res) => {
  try {
    const { studentId, month, year, amount, status, method } = req.body;
    const teacherId = req.user._id;

    let payment = await Payment.findOne({ teacher: teacherId, student: studentId, month, year });

    if (payment) {
      payment.amount = amount || payment.amount;
      payment.status = status || payment.status;
      payment.method = method || payment.method;
      if (status === "paid") payment.paidDate = Date.now();
      
      await payment.save();
      return res.status(200).json({ success: true, message: "Payment updated", payment });
    }

    payment = await Payment.create({
      teacher: teacherId,
      student: studentId,
      month,
      year,
      amount,
      status: status || "due",
      method: method || "cash",
      paidDate: status === "paid" ? Date.now() : null,
    });

    res.status(201).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all payments of a student (Teacher)
// @route   GET /api/payments/student/:studentId
export const getStudentPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ teacher: req.user._id, student: req.params.studentId })
      .sort({ year: -1, month: -1 }); 
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Calculate and Get All Dues (Teacher)
// @route   GET /api/payments/due
export const getDuePayments = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { studentId } = req.query; 

    const query = { teacher: teacherId, active: true };
    if (studentId) query._id = studentId;

    const students = await Student.find(query);
    const paidPayments = await Payment.find({ teacher: teacherId, status: "paid" });

    const dueList = [];
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
          dueList.push({
            _id: `${student._id}-${monthName}-${joinYear}`, 
            student: {
              _id: student._id,
              name: student.name,
              class: student.class,
              guardianPhone: student.guardianPhone
            },
            month: monthName,
            year: joinYear,
            amount: student.monthlyFee,
            status: "due"
          });
        }

        joinMonth++;
        if (joinMonth > 11) {
          joinMonth = 0;
          joinYear++;
        }
      }
    });

    res.json({ success: true, count: dueList.length, duePayments: dueList.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in student's payments
// @route   GET /api/payments/my-payments
export const getMyPayments = async (req, res) => {
  try {
    const studentProfile = await Student.findOne({ user: req.user._id });
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    const payments = await Payment.find({ student: studentProfile._id })
      .sort({ year: -1, month: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};