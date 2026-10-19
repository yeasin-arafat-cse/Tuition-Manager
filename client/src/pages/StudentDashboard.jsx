import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Dashboard.css';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/student');
        setData(res.data.data);
      } catch (error) {
        toast.error('Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
  if (!data) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>No data found</div>;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>
            {greeting}, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <h1 className="page-title" style={{ fontSize: '2rem', marginTop: '0.2rem' }}>
            {t("Student Dashboard", "স্টুডেন্ট ড্যাশবোর্ড")}
          </h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-grid">
        <div className="stat-card" onClick={() => navigate('/student/attendance')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon success">✅</div>
          <div className="stat-info">
            <h3>{t("Attendance", "উপস্থিতি")}</h3>
            <h2>{data.attendance.present} <span style={{fontSize: '1rem', color: 'var(--text-muted)'}}>/ {data.attendance.present + data.attendance.absent}</span></h2>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/student/payments')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon danger">💸</div>
          <div className="stat-info">
            <h3>{t("Total Due", "মোট বাকি")}</h3>
            <h2 style={{ color: data.totalDue > 0 ? 'var(--danger)' : 'var(--secondary)' }}>
              ৳ {data.totalDue}
            </h2>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/student/exams')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon primary">📝</div>
          <div className="stat-info">
            <h3>{t("Exams Done", "সম্পন্ন এক্সাম")}</h3>
            <h2>{data.exams.completed}</h2>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/student/schedule')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon warning" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>📅</div>
          <div className="stat-info">
            <h3>{t("Class Routine", "ক্লাস রুটিন")}</h3>
            <h2 style={{ fontSize: '1.2rem', marginTop: '0.4rem' }}>View Now</h2>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="dashboard-section">
          <h2 className="section-title">📅 {t("Recent Payments", "সাম্প্রতিক পেমেন্ট")}</h2>
          {data.recentPayments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No payments yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {data.recentPayments.map((pay) => (
                <li key={pay._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <strong>{pay.month} {pay.year}</strong>
                  </div>
                  <span className={`badge ${pay.status === 'paid' ? 'paid' : 'due'}`}>
                    {pay.status.toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dashboard-section">
          <h2 className="section-title">👤 {t("My Profile", "আমার প্রোফাইল")}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div><strong>{t("Name:", "নাম:")}</strong> {data.studentInfo.name}</div>
            <div><strong>{t("Class:", "ক্লাস:")}</strong> {data.studentInfo.class}</div>
            <div><strong>{t("Subject:", "বিষয়:")}</strong> {data.studentInfo.subject}</div>
          </div>
        </div>
      </div>

      {/* 👈 নতুন নোটিশ সেকশন */}
      {data.notices && data.notices.length > 0 && (
        <div className="dashboard-section" style={{ marginTop: '2rem' }}>
          <h2 className="section-title">📢 {t("Notice Board", "নোটিশ বোর্ড")}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {data.notices.map(notice => (
              <div key={notice._id} style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '0.3rem' }}>{notice.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  {new Date(notice.createdAt).toLocaleDateString()}
                </p>
                <p style={{ fontSize: '0.95rem' }}>{notice.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;