import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import api from './services/api';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Students from './pages/Students';
import Schedule from './pages/Schedule';
import Attendance from './pages/Attendance';
import Payment from './pages/Payment';
import AIMCQ from './pages/AIMCQ';
import QuestionBank from './pages/QuestionBank';
import TeacherExam from './pages/TeacherExam';
import StudentExam from './pages/StudentExam';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentExamsList from './pages/StudentExamsList';
import StudentSchedule from './pages/StudentSchedule';
import StudentAttendance from './pages/StudentAttendance';
import StudentPayment from './pages/StudentPayment';
import AdminDashboard from './pages/AdminDashboard';
import GuardianDashboard from './pages/GuardianDashboard';
import ProfileSettings from './pages/ProfileSettings';
import StudentProfile from './pages/StudentProfile';
import NoticeBoard from './pages/NoticeBoard';
import { useAuth } from './context/AuthContext';
import './pages/Loader.css';

function App() {
  const { user, loading } = useAuth();
  const [serverReady, setServerReady] = useState(false);

  // সার্ভার ওয়েক-আপ লজিক
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        await api.get('/health'); 
      } catch (error) {
        // এরর হলেও সমস্যা নেই
      } finally {
        setServerReady(true);
      }
    };
    wakeUpServer();
  }, []);

  // 👈 নতুন: দিন পরিবর্তন (Date Change) ডিটেক্ট করে পেজ রিফ্রেশ
  useEffect(() => {
    // শুরুতে বর্তমান তারিখ সেভ করে রাখি
    let lastKnownDate = new Date().toDateString();

    const interval = setInterval(() => {
      const currentDate = new Date().toDateString(); // যেমন: "Tue Oct 20 2026"
      
      // যদি আজকের তারিখ আগের তারিখের সাথে না মেলে (অর্থাৎ দিন পরিবর্তন হয়েছে)
      if (currentDate !== lastKnownDate) {
        lastKnownDate = currentDate; 
        // পেজটি রিফ্রেশ করে দিবে, যাতে সব ডেটা নতুন করে লোড হয়
        window.location.reload(); 
      }
    }, 5000); // প্রতি ৫ সেকেন্ড পর পর চেক করবে

    return () => clearInterval(interval);
  }, []);

  if (!serverReady || loading) {
    return (
      <div className="loader-container">
        <div className="loader-content">
          <h1 className="loader-title">Welcome to our personal system</h1>
          <div className="loader-text">
            Waking up the server... Please wait ⏳
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role}/dashboard`} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={`/${user.role}/dashboard`} />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        
        {/* Teacher Routes */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/students" element={<Students />} />
        <Route path="/teacher/students/:id" element={<StudentProfile />} />
        <Route path="/teacher/schedule" element={<Schedule />} />
        <Route path="/teacher/attendance" element={<Attendance />} />
        <Route path="/teacher/payments" element={<Payment />} />
        <Route path="/teacher/ai-mcq" element={<AIMCQ />} />
        <Route path="/teacher/question-bank" element={<QuestionBank />} />
        <Route path="/teacher/exams" element={<TeacherExam />} />
        <Route path="/teacher/notices" element={<NoticeBoard />} />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/schedule" element={<StudentSchedule />} />
        <Route path="/student/exams" element={<StudentExamsList />} />
        <Route path="/student/exam/:id" element={<StudentExam />} />
        <Route path="/student/attendance" element={<StudentAttendance />} />
        <Route path="/student/payments" element={<StudentPayment />} />

        {/* Guardian Routes */}
        <Route path="/guardian/dashboard" element={<GuardianDashboard />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Common Routes */}
        <Route path="/settings" element={<ProfileSettings />} />

      </Route>

      <Route path="/" element={
        user ? <Navigate to={`/${user.role}/dashboard`} /> : <Navigate to="/login" />
      } />
      
      <Route path="*" element={
        <div style={{textAlign: 'center', marginTop: '50px'}}>
          <h2>404 Not Found</h2>
          <button onClick={() => window.location.href = '/'} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', borderRadius: '5px' }}>
            Go Home
          </button>
        </div>
      } />
    </Routes>
  );
}

export default App;