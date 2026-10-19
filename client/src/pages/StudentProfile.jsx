import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Students.css';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useApp();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/students/${id}/profile`);
      setData(res.data);
    } catch (error) {
      toast.error('Failed to load profile');
      navigate('/teacher/students');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id, navigate]);

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm(t("Are you sure you want to delete this payment?", "আপনি কি নিশ্চিত এই পেমেন্টটি ডিলিট করতে চান?"))) return;
    try {
      await api.delete(`/payments/${paymentId}`);
      toast.success(t("Payment deleted!", "পেমেন্ট ডিলিট হয়েছে!"));
      fetchProfile();
    } catch (error) {
      toast.error('Failed to delete payment');
    }
  };

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading Profile...</div>;
  if (!data) return <div>No data</div>;

  const { student, payments, attendance } = data;
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn-cancel" onClick={() => navigate('/teacher/students')} style={{ padding: '0.5rem 1rem' }}>
          ← {t("Back", "ফিরে যান")}
        </button>
        <h1 className="page-title">{t("Student Profile", "স্টুডেন্ট প্রোফাইল")}</h1>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        {/* Personal Info */}
        <div className="dashboard-section">
          <h2 className="section-title">👤 {t("Personal Info", "ব্যক্তিগত তথ্য")}</h2>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <p><strong>{t("Name", "নাম")}:</strong> {student.name}</p>
            <p><strong>{t("Class", "ক্লাস")}:</strong> {student.class}</p>
            <p><strong>{t("Subject", "বিষয়")}:</strong> {student.subject}</p>
            <p><strong>{t("Guardian", "অভিভাবক")}:</strong> {student.guardianName} ({student.guardianPhone})</p>
            <p><strong>{t("Monthly Fee", "মাসিক বেতন")}:</strong> ৳ {student.monthlyFee}</p>
          </div>
        </div>

        {/* Attendance Summary (আপডেট করা) */}
        <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '1rem' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            {t("Attendance", "হাজিরা")} ({attendance.monthName} {attendance.year})
          </h3>
          
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: 'var(--secondary)', margin: 0 }}>{attendance.present}</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t("Present", "উপস্থিত")}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: 'var(--danger)', margin: 0 }}>{attendance.absent}</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t("Absent", "অনুপস্থিত")}</p>
            </div>
            {/* 👈 নতুন Off Day সেকশন */}
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: 'var(--warning)', margin: 0 }}>{attendance.offDay}</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t("Off Day", "ছুটি")}</p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>{t("Total Paid", "মোট পরিশোধিত")}</h3>
          <h2 style={{ color: 'var(--primary)', fontSize: '2rem', marginTop: '0.5rem' }}>৳ {totalPaid}</h2>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="dashboard-section">
        <h2 className="section-title">💳 {t("Payment History", "পেমেন্টের ইতিহাস")}</h2>
        <div className="table-container" style={{ marginTop: '1rem', boxShadow: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>{t("Month/Year", "মাস/বছর")}</th>
                <th>{t("Amount", "টাকা")}</th>
                <th>{t("Date", "তারিখ")}</th>
                <th>{t("Method", "মাধ্যম")}</th>
                <th>{t("Status", "স্ট্যাটাস")}</th>
                <th>{t("Action", "অ্যাকশন")}</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>No payments yet.</td></tr>
              ) : (
                payments.map(p => (
                  <tr key={p._id}>
                    <td>{p.month} {p.year}</td>
                    <td>৳ {p.amount}</td>
                    <td>{p.paidDate ? new Date(p.paidDate).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{p.method}</td>
                    <td><span className={`badge ${p.status === 'paid' ? 'paid' : 'due'}`}>{p.status}</span></td>
                    <td>
                      <button 
                        onClick={() => handleDeletePayment(p._id)}
                        style={{ color: 'var(--danger)', background: 'none', fontWeight: 'bold' }}
                      >
                        {t("Delete", "ডিলিট")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;