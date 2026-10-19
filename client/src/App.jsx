import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import api from './services/api'; // 👈 সার্ভার পিং করার জন্য
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
import { useAuth } from './context/AuthContext';
import './pages/Loader.css'; // 👈 নতুন CSS

function App() {
  const { user, loading } = useAuth();
  const [serverReady, setServerReady] = useState(false);

  // 👈 সার্ভার ওয়েক-আপ লজিক
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        // সার্ভার ঘুমিয়ে থাকলে এটি তাকে জাগিয়ে দিবে
        await api.get('/health'); 
      } catch (error) {
        // এরর হলেও সমস্যা নেই, সার্ভার জেগে উঠবে
      } finally {
        setServerReady(true);
      }
    };
    wakeUpServer();
  }, []);

  // 👈 সার্ভার জাগা পর্যন্ত বা ইউজার লোড হওয়া পর্যন্ত অ্যানিমেশন দেখাবে
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
        <Route path="/teacher/schedule" element={<Schedule />} />
        <Route path="/teacher/attendance" element={<Attendance />} />
        <Route path="/teacher/payments" element={<Payment />} />
        <Route path="/teacher/ai-mcq" element={<AIMCQ />} />
        <Route path="/teacher/question-bank" element={<QuestionBank />} />
        <Route path="/teacher/exams" element={<TeacherExam />} />

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