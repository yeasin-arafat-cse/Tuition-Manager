import Schedule from "../models/Schedule.js";
import Student from "../models/Student.js";

// @desc    Add/Update Weekly Schedule
// @route   POST /api/schedules
export const addSchedule = async (req, res) => { // 👈 এই ফাংশনটি নিশ্চিত করুন
  try {
    const { studentId, routine } = req.body; 

    if (!studentId || !routine || !Array.isArray(routine)) {
      return res.status(400).json({ success: false, message: "Invalid data format" });
    }

    // ১. চেক করা এই স্টুডেন্টের আগে থেকেই রুটিন আছে কিনা
    const existingSchedules = await Schedule.find({ teacher: req.user._id, student: studentId });

    // ২. নতুন ডেটাগুলোর জন্য একটি ম্যাপ তৈরি করা
    const routineMap = {};
    routine.forEach(item => {
      routineMap[item.day] = item;
    });

    // ৩. পুরাতন ডেটাগুলো আপডেট বা ডিলিট করা
    for (const existing of existingSchedules) {
      if (routineMap[existing.day]) {
        existing.subject = routineMap[existing.day].subject;
        existing.time = routineMap[existing.day].time;
        existing.duration = routineMap[existing.day].duration || 60;
        await existing.save();
        delete routineMap[existing.day]; 
      } else {
        await existing.deleteOne(); 
      }
    }

    // ৪. বাকি নতুন দিনগুলোর জন্য নতুন রুটিন তৈরি করা
    const newSchedules = Object.values(routineMap).map(item => ({
      teacher: req.user._id,
      student: studentId,
      day: item.day,
      time: item.time,
      duration: item.duration || 60,
      subject: item.subject
    }));

    if (newSchedules.length > 0) {
      await Schedule.insertMany(newSchedules);
    }

    res.status(201).json({ success: true, message: "Routine saved successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get teacher's schedules
// @route   GET /api/schedules
export const getSchedules = async (req, res) => {
  try {
    const { studentId } = req.query;
    
    const query = { teacher: req.user._id };
    if (studentId) query.student = studentId; 

    const schedules = await Schedule.find(query)
      .populate("student", "name class")
      .sort({ day: 1, time: 1 });
      
    res.json({ success: true, schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in student's schedule
// @route   GET /api/schedules/student/my-routine
export const getStudentSchedule = async (req, res) => {
  try {
    const studentProfile = await Student.findOne({ user: req.user._id });
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    const schedules = await Schedule.find({ student: studentProfile._id }).sort({ time: 1 });
    res.json({ success: true, schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
export const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule || schedule.teacher.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: "Schedule not found" });
    }
    await schedule.deleteOne();
    res.json({ success: true, message: "Schedule deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};