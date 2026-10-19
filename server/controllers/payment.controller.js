import Payment from "../models/Payment.js";
import Student from "../models/Student.js";

// @desc    Create or Update Payment (Supports Multiple Months)
// @route   POST /api/payments
export const createPayment = async (req, res) => {
  try {
    const { studentId, months, year, amount, method } = req.body; 
    const teacherId = req.user._id;

    if (!Array.isArray(months) || months.length === 0) {
      return res.status(400).json({ success: false, message: "No months selected" });
    }

    for (const m of months) {
      let payment = await Payment.findOne({ teacher: teacherId, student: studentId, month: m, year });

      if (payment) {
        payment.amount = amount || payment.amount;
        payment.status = "paid"; 
        payment.method = method || payment.method;
        payment.paidDate = Date.now();
        await payment.save();
      } else {
        await Payment.create({
          teacher: teacherId,
          student: studentId,
          month: m,
          year,
          amount: amount,
          status: "paid",
          method: method || "cash",
          paidDate: Date.now(),
        });
      }
    }

    res.status(201).json({ success: true, message: "Payments collected successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all payments of a student
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

// @desc    Calculate and Get All Dues (Based on 30-day cycles)
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
    currentDate.setHours(0, 0, 0, 0);
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    students.forEach(student => {
      const joinDate = new Date(student.joinDate);
      joinDate.setHours(0, 0, 0, 0);

      // কত দিন পার হয়েছে
      const diffTime = Math.abs(currentDate - joinDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // ৩০ দিন পর পর কতগুলো সাইকেল পার হয়েছে
      let cyclesPassed = 0;
      if (diffDays >= 30) {
        cyclesPassed = Math.floor(diffDays / 30);
      }

      // প্রতিটি ৩০ দিনের জন্য Due চেক করা
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
          dueList.push({
            _id: `${student._id}-${monthName}-${year}-${i}`, 
            student: {
              _id: student._id,
              name: student.name,
              class: student.class,
              guardianPhone: student.guardianPhone
            },
            month: monthName,
            year: year,
            amount: student.monthlyFee,
            status: "due"
          });
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

// @desc    Delete a payment
// @route   DELETE /api/payments/:id
export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.teacher.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    await payment.deleteOne();
    res.json({ success: true, message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};