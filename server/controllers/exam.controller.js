import Exam from "../models/Exam.js";
import QuestionBank from "../models/QuestionBank.js";
import Student from "../models/Student.js";

// @desc    Create Exam from Question Bank
// @route   POST /api/exams/create
export const createExam = async (req, res) => {
  try {
    const { studentId, questionBankId, title, duration } = req.body;
    const teacherId = req.user._id;

    const bank = await QuestionBank.findById(questionBankId);
    if (!bank) {
      return res.status(404).json({ success: false, message: "Question Bank not found" });
    }

    const exam = await Exam.create({
      teacher: teacherId,
      student: studentId,
      title,
      duration: duration || 10,
      questions: bank.questions,
      total: bank.questions.length,
    });

    res.status(201).json({ success: true, exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get exam by ID (For Student to take exam or view result)
// @route   GET /api/exams/:id
export const getExamById = async (req, res) => {
  try {
    let exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }

    // 👈 যদি স্টুডেন্ট এবং এক্সামটি সাবমিট হয়ে থাকে, তবে সঠিক উত্তরসহ সব দেখাবে
    if (req.user.role === 'student' && exam.status === 'submitted') {
      return res.json({ success: true, exam, isResultView: true });
    }

    // 👈 যদি এক্সাম এখনো সাবমিট না হয়, তবে সঠিক উত্তর লুকিয়ে রাখব
    exam = await Exam.findById(req.params.id).select("-questions.correctAnswer");
    res.json({ success: true, exam, isResultView: false });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit Exam
// @route   POST /api/exams/:id/submit
export const submitExam = async (req, res) => {
  try {
    const { answers } = req.body;
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }

    // 👈 চেক করা এটি আগেই সাবমিট হয়েছে কিনা
    if (exam.status === 'submitted') {
      return res.status(400).json({ success: false, message: "You have already submitted this exam" });
    }

    let score = 0;
    const studentAnswers = [];

    exam.questions.forEach((q) => {
      const studentAns = answers.find((a) => a.questionId === q._id.toString());
      if (studentAns) {
        studentAnswers.push(studentAns);
        if (studentAns.selectedOption === q.correctAnswer) {
          score++;
        }
      }
    });

    exam.studentAnswers = studentAnswers;
    exam.score = score;
    exam.status = "submitted";
    await exam.save();

    res.json({ success: true, message: "Exam submitted successfully", score, total: exam.total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all exams for a student
// @route   GET /api/exams/student/my-exams
export const getStudentExams = async (req, res) => {
  try {
    const studentProfile = await Student.findOne({ user: req.user._id });
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: "Student profile not found for this user" });
    }

    const exams = await Exam.find({ student: studentProfile._id })
      .select("-questions.correctAnswer")
      .sort({ createdAt: -1 });
      
    res.json({ success: true, exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all exams created by teacher (with results)
// @route   GET /api/exams/teacher/all
export const getTeacherExams = async (req, res) => {
  try {
    const exams = await Exam.find({ teacher: req.user._id })
      .populate("student", "name class")
      .sort({ createdAt: -1 });

    res.json({ success: true, exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an exam
// @route   PUT /api/exams/:id
export const updateExam = async (req, res) => {
  try {
    const { title, duration } = req.body;
    let exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }

    if (exam.teacher.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    exam.title = title || exam.title;
    exam.duration = duration || exam.duration;
    
    await exam.save();
    res.json({ success: true, message: "Exam updated", exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an exam
// @route   DELETE /api/exams/:id
export const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }

    if (exam.teacher.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    await exam.deleteOne();
    res.json({ success: true, message: "Exam deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};