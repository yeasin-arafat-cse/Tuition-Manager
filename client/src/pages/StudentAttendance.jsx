import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Students.css';

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [totalOffDays, setTotalOffDays] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; 
  });
  const { t } = useApp();

  useEffect(() => {
    const fetchAttendance = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/attendance/my-attendance?month=${selectedMonth}`);
        setAttendance(res.data.attendance);
        setTotalOffDays(res.data.totalOffDays || 0); 
      } catch (error) {
        toast.error('Failed to load attendance');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendance();
  }, [selectedMonth]);

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title">{t("My Attendance", "আমার উপস্থিতি")}</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: '600' }}>{t("Select Month:", "মাস সিলেক্ট করুন:")}</label>
          <input 
            type="month" 
            className="date-input" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)} 
            style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: 'var(--warning)', fontWeight: 'bold' }}>
          {t("Total Off Days:", "মোট ছুটি:")} {totalOffDays}
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{t("Date", "তারিখ")}</th>
              <th>{t("Status", "স্ট্যাটাস")}</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length === 0 ? (
              <tr>
                <td colSpan="2" style={{ textAlign: 'center', padding: '2rem' }}>
                  {t("No attendance records found", "কোনো হাজিরার রেকর্ড নেই")}
                </td>
              </tr>
            ) : (
              attendance.map((att) => (
                <tr key={att._id}>
                  <td>{new Date(att.date).toLocaleDateString()}</td>
                  <td>
                    <span 
                      className={`badge ${
                        att.status === 'present' ? 'paid' : 
                        att.status === 'absent' ? 'due' : 'off-day'
                      }`}
                    >
                      {att.status === 'present' ? t("Present", "উপস্থিত") : 
                       att.status === 'absent' ? t("Absent", "অনুপস্থিত") : 
                       t("Off Day", "ছুটি")}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentAttendance;