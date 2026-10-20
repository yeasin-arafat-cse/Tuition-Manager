import express from "express";
import dotenv from "dotenv";
import cors from "cors";
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

// Load env
dotenv.config();

// Connect DB
connectDB();

// App init
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
  res.json({ success: true, message: "🚀 Tuition Manager API running" });
});

// 👈 নতুন: Health Check Route (সার্ভার জাগিয়ে রাখার জন্য)
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});