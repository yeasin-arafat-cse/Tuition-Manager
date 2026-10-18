import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Dashboard.css';
import './Students.css';

const GuardianDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useApp();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/guardian/dashboard');
        setData(res.data);
      } catch (error) {
        if (error.response?.status === 404) {
          setData({ error: error.response.data.message });
        } else {
          toast.error('Failed to load dashboard');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
  
  if (data?.error) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h2 style={{ color: 'var(--danger)' }}>⚠️ {data.error}</h2>
        <p style={{ color: 'var(--text-muted)' }}>Please ask the teacher to update your phone number in the student profile.</p>
      </div>
    );
  }

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
            {t("Guardian Dashboard", "অভিভাবক ড্যাশবোর্ড")}
          </h1>
        </div>
      </div>

      {/* Student Info Card */}
      <div className="dashboard-section" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title">👤 {t("Student Info", "শিক্ষার্থীর তথ্য")}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t("Name", "নাম")}</p>
            <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{data.student.name}</p>
          </div>
          <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t("Class", "ক্লাস")}</p>
            <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{data.student.class}</p>
          </div>
          <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t("Monthly Fee", "মাসিক বেতন")}</p>
            <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>৳ {data.student.monthlyFee}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Attendance Summary */}
        <div className="stat-card">
          <div className="stat-icon success">✅</div>
          <div className="stat-info">
            <h3>{t("Attendance Record", "হাজিরার রেকর্ড")}</h3>
            <h2>{data.attendanceSummary.present} <span style={{fontSize: '1rem', color: 'var(--text-muted)'}}>Days Present</span></h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--danger)', marginTop: '0.2rem' }}>
              {data.attendanceSummary.absent} {t("Days Absent", "দিন অনুপস্থিত")}
            </p>
          </div>
        </div>

        {/* Payment Status */}
        <div className="stat-card">
          <div className="stat-icon primary">💰</div>
          <div className="stat-info">
            <h3>{t("Last Payment", "সর্বশেষ পেমেন্ট")}</h3>
            {data.payments.length > 0 ? (
              <>
                <h2 style={{ fontSize: '1.5rem' }}>
                  {data.payments[0].month} {data.payments[0].year}
                </h2>
                <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  <span className={`badge ${data.payments[0].status === 'paid' ? 'paid' : 'due'}`}>
                    {data.payments[0].status.toUpperCase()}
                  </span>
                </p>
              </>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No payments yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '2rem' }}>
        {/* Recent Attendance List (নতুন) */}
        <div className="dashboard-section">
          <h2 className="section-title">📅 {t("Recent Attendance", "সাম্প্রতিক হাজিরা")}</h2>
          {data.recentAttendance?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No records found.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {data.recentAttendance?.map((att) => (
                <li key={att._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span>{new Date(att.date).toLocaleDateString()}</span>
                  <span className={`badge ${att.status === 'present' ? 'paid' : 'due'}`}>
                    {att.status.toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Payment History Table */}
        <div className="dashboard-section">
          <h2 className="section-title">💳 {t("Payment History", "পেমেন্টের ইতিহাস")}</h2>
          <div style={{ marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', paddingBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t("Month", "মাস")}</th>
                  <th style={{ textAlign: 'left', paddingBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t("Amount", "টাকা")}</th>
                  <th style={{ textAlign: 'left', paddingBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t("Status", "স্ট্যাটাস")}</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', paddingTop: '1rem' }}>No records</td></tr>
                ) : (
                  data.payments.map(pay => (
                    <tr key={pay._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.8rem 0' }}>{pay.month} {pay.year}</td>
                      <td style={{ padding: '0.8rem 0' }}>৳ {pay.amount}</td>
                      <td style={{ padding: '0.8rem 0' }}>
                        <span className={`badge ${pay.status === 'paid' ? 'paid' : 'due'}`}>
                          {pay.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuardianDashboard;