import Notice from "../models/Notice.js";
import Student from "../models/Student.js";

// @desc    Create a new notice
// @route   POST /api/notices
export const createNotice = async (req, res) => {
  try {
    const { title, message, studentId } = req.body; 
    
    const notice = await Notice.create({
      teacher: req.user._id,
      student: studentId || null, 
      title,
      message,
    });
    res.status(201).json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all notices (For Teacher)
// @route   GET /api/notices
export const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ teacher: req.user._id })
      .populate("student", "name class")
      .sort({ createdAt: -1 });
    res.json({ success: true, notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice || notice.teacher.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: "Notice not found" });
    }
    await notice.deleteOne();
    res.json({ success: true, message: "Notice deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all notices for logged in student
// @route   GET /api/notices/student
export const getStudentNotices = async (req, res) => {
  try {
    const studentProfile = await Student.findOne({ user: req.user._id });
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    const notices = await Notice.find({ 
      teacher: studentProfile.teacher,
      $or: [
        { student: null }, 
        { student: studentProfile._id } 
      ]
    }).sort({ createdAt: -1 });

    res.json({ success: true, notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};