import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import connectDB from "./config/db.js";

// Routes Import
import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import examRoutes from "./routes/exam.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import guardianRoutes from "./routes/guardian.routes.js";
import noticeRoutes from "./routes/notice.routes.js";
import materialRoutes from "./routes/material.routes.js";

dotenv.config();
connectDB();

const app = express();

// 🛡️ 1. Security Headers (Helmet)
app.use(helmet());

// 🛡️ 2. CORS Setup (শুধুমাত্র আপনার ফ্রন্টএন্ড লিংক)
const allowedOrigins = [
  "http://localhost:5173", 
  "https://yeasin-tuition-manager.vercel.app" // 👈 আপনার Vercel লাইভ লিংকটি এখানে বসান
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🛡️ 3. Rate Limiting (DDoS এবং ব্রুট-ফোর্স ঠেকাতে)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 মিনিট
  max: 100, // প্রতি ১৫ মিনিটে সর্বোচ্চ ১০০টি রিকোয়েস্ট
  message: { success: false, message: "Too many requests, please try again later." }
});
app.use("/api", apiLimiter);

// 🛡️ 4. Data Sanitization (NoSQL Injection ঠেকাতে)
app.use(mongoSanitize());

// Middleware
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Test & Health route
app.get("/", (req, res) => {
  res.json({ success: true, message: "🚀 Tuition Manager API running securely" });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/guardian", guardianRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/materials", materialRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || "Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running securely on port ${PORT}`);
});