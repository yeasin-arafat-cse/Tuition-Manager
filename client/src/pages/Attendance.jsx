import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Attendance.css';

const Attendance = () => {
  const [studentCards, setStudentCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; 
  });
  const { t } = useApp();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/attendance?month=${selectedMonth}`);
      setStudentCards(res.data.studentCards);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const handleAttendance = async (studentId, status) => {
    const today = new Date().toISOString().split('T')[0];

    setStudentCards(prev => prev.map(card => {
      if (card._id === studentId) {
        let newPresent = card.present;
        let newAbsent = card.absent;
        let newOffDay = card.offDay || 0;

        // আগের স্ট্যাটাস বাদ দেওয়া
        if (card.todayStatus === 'present') newPresent--;
        if (card.todayStatus === 'absent') newAbsent--;
        if (card.todayStatus === 'off_day') newOffDay--;

        // নতুন স্ট্যাটাস যোগ করা
        if (status === 'present') newPresent++;
        else if (status === 'absent') newAbsent++;
        else if (status === 'off_day') newOffDay++;

        return { ...card, todayStatus: status, present: newPresent, absent: newAbsent, offDay: newOffDay };
      }
      return card;
    }));

    try {
      await api.post('/attendance', {
        studentId,
        date: today,
        status
      });
      toast.success(t("Attendance marked", "হাজিরা সেভ হয়েছে"));
    } catch (error) {
      toast.error('Failed to save attendance');
      fetchData(); 
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm(t("Delete this month's attendance for this student?", "এই স্টুডেন্টের এই মাসের হাজিরা ডিলিট করবেন?"))) return;
    try {
      await api.delete(`/attendance/student/${studentId}/month/${selectedMonth}`);
      toast.success(t("Deleted!", "ডিলিট হয়েছে!"));
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title">{t("Attendance", "হাজিরা")}</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: '600' }}>{t("Select Month:", "মাস সিলেক্ট করুন:")}</label>
          <input 
            type="month" 
            className="date-input" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)} 
          />
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      ) : studentCards.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          {t("No students found.", "কোনো স্টুডেন্ট পাওয়া যায়নি।")}
        </div>
      ) : (
        <div className="attendance-cards-grid">
          {studentCards.map((card) => (
            <div key={card._id} className="attendance-card">
              <div className="att-card-header">
                <div>
                  <h3>{card.name}</h3>
                  <p>{card.class}</p>
                </div>
                <button 
                  onClick={() => handleDelete(card._id)}
                  style={{ background: 'none', color: 'var(--danger)', fontSize: '1.2rem', cursor: 'pointer' }}
                  title="Delete Month Data"
                >
                  🗑️
                </button>
              </div>

              <div className="att-card-stats">
                <div className="stat-box present">
                  <h4>{card.present}</h4>
                  <p>{t("Present", "উপস্থিত")}</p>
                </div>
                <div className="stat-box absent">
                  <h4>{card.absent}</h4>
                  <p>{t("Absent", "অনুপস্থিত")}</p>
                </div>
                <div className="stat-box off-day">
                  <h4>{card.offDay || 0}</h4>
                  <p>{t("Off Day", "ছুটি")}</p>
                </div>
              </div>

              <div className="att-card-actions">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>
                  {t("Mark Today's Attendance", "আজকের হাজিরা দিন")}
                </p>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button 
                    className={`att-btn present ${card.todayStatus === 'present' ? 'active' : ''}`}
                    onClick={() => handleAttendance(card._id, 'present')}
                  >
                    {t("Present", "P")}
                  </button>
                  <button 
                    className={`att-btn absent ${card.todayStatus === 'absent' ? 'active' : ''}`}
                    onClick={() => handleAttendance(card._id, 'absent')}
                  >
                    {t("Absent", "A")}
                  </button>
                  <button 
                    className={`att-btn off-day ${card.todayStatus === 'off_day' ? 'active' : ''}`}
                    onClick={() => handleAttendance(card._id, 'off_day')}
                  >
                    {t("Off", "O")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Attendance;