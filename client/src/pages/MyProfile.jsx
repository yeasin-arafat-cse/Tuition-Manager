import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Students.css';

const MyProfile = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useApp();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/students/my-profile');
        setData(res.data);
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
  if (!data) return <div>No data</div>;

  const { student, totalPaid, attendance } = data;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t("My Profile", "আমার প্রোফাইল")}</h1>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2 className="section-title">👤 {t("Personal Info", "ব্যক্তিগত তথ্য")}</h2>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <p><strong>{t("Name", "নাম")}:</strong> {student.name}</p>
            <p><strong>{t("Class", "ক্লাস")}:</strong> {student.class}</p>
            <p><strong>{t("Subject", "বিষয়")}:</strong> {student.subject}</p>
            <p><strong>{t("Guardian", "অভিভাবক")}:</strong> {student.guardianName} ({student.guardianPhone})</p>
            <p><strong>{t("Monthly Fee", "মাসিক বেতন")}:</strong> Tk {student.monthlyFee}</p>
            <p><strong>{t("Join Date", "শুরুর তারিখ")}:</strong> {new Date(student.joinDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>{t("Total Paid", "মোট পরিশোধিত")}</h3>
          <h2 style={{ color: 'var(--primary)', fontSize: '2rem', marginTop: '0.5rem' }}>Tk {totalPaid}</h2>
        </div>

        <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>{t("Total Attendance", "মোট হাজিরা")}</h3>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: 'var(--secondary)', margin: 0 }}>{attendance.present}</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t("Present", "উপস্থিত")}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: 'var(--danger)', margin: 0 }}>{attendance.absent}</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t("Absent", "অনুপস্থিত")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;