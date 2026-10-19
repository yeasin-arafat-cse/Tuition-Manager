import Notice from "../models/Notice.js";

// @desc    Create a new notice
// @route   POST /api/notices
export const createNotice = async (req, res) => {
  try {
    const { title, message } = req.body;
    const notice = await Notice.create({
      teacher: req.user._id,
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
    const notices = await Notice.find({ teacher: req.user._id }).sort({ createdAt: -1 });
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