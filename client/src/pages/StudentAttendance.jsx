import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Students.css';

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useApp();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get('/attendance/my-attendance');
        setAttendance(res.data.attendance);
      } catch (error) {
        toast.error('Failed to load attendance');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t("My Attendance", "আমার উপস্থিতি")}</h1>
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
                    <span className={`badge ${att.status === 'present' ? 'paid' : 'due'}`}>
                      {att.status === 'present' ? t("Present", "উপস্থিত") : t("Absent", "অনুপস্থিত")}
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