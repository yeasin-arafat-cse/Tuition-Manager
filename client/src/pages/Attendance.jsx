import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Attendance.css';

const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Attendance = () => {
  const [studentCards, setStudentCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; 
  });
  const [todayDate, setTodayDate] = useState(getLocalDateString()); 
  
  // মডাল স্টেট
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState([]); 
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  
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

    const interval = setInterval(() => {
      const newDate = getLocalDateString();
      if (newDate !== todayDate) {
        setTodayDate(newDate);
        setSelectedMonth(newDate.substring(0, 7));
        fetchData(); 
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedMonth, todayDate]);

  const handleAttendance = async (studentId, status) => {
    const today = todayDate; 
    setStudentCards(prev => prev.map(card => {
      if (card._id === studentId) {
        let newPresent = card.present;
        let newAbsent = card.absent;
        let newOffDay = card.offDay || 0;

        if (card.todayStatus === 'present') newPresent--;
        if (card.todayStatus === 'absent') newAbsent--;
        if (card.todayStatus === 'off_day') newOffDay--;

        if (status === 'present') newPresent++;
        else if (status === 'absent') newAbsent++;
        else if (status === 'off_day') newOffDay++;

        return { ...card, todayStatus: status, present: newPresent, absent: newAbsent, offDay: newOffDay };
      }
      return card;
    }));

    try {
      await api.post('/attendance', { studentId, date: today, status });
      toast.success(t("Attendance marked", "হাজিরা সেভ হয়েছে"));
    } catch (error) {
      toast.error('Failed to save attendance');
      fetchData(); 
    }
  };

  // নির্দিষ্ট দিনের হাজিরা ডিলিট
  const handleDeleteSpecificDay = async (dateStr) => {
    if (!window.confirm(t("Delete attendance for this specific date?", "এই নির্দিষ্ট দিনের হাজিরা ডিলিট করবেন?"))) return;
    try {
      await api.delete(`/attendance/student/${selectedStudent._id}/date/${dateStr}`);
      toast.success(t("Deleted!", "ডিলিট হয়েছে!"));
      
      const updatedDetails = studentDetails.filter(d => new Date(d.date).toISOString().split('T')[0] !== dateStr);
      setStudentDetails(updatedDetails);
      fetchData(); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  // মডাল ওপেন করে ডিটেইলস আনা
  const openDetails = async (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
    setIsDetailsLoading(true);
    try {
      const res = await api.get(`/attendance/student/${student._id}/details?month=${selectedMonth}`);
      setStudentDetails(res.data.attendances);
    } catch (error) {
      toast.error("Failed to load details");
    } finally {
      setIsDetailsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">{t("Attendance", "হাজিরা")}</h1>
          <p style={{ color: 'var(--primary)', fontWeight: '600', marginTop: '0.2rem' }}>
            {t("Today's Date:", "আজকের তারিখ:")} {todayDate}
          </p>
        </div>
        
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
                  onClick={() => openDetails(card)}
                  style={{ background: 'none', color: 'var(--primary)', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '600' }}
                >
                  Details
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

      {/* ডিটেইলস মডাল */}
      {isModalOpen && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>{selectedStudent.name} - {t("Attendance", "হাজিরা")}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
              {isDetailsLoading ? (
                <p style={{ textAlign: 'center', padding: '1rem' }}>Loading...</p>
              ) : studentDetails.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>No attendance records this month.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {studentDetails.map((att) => {
                    const dateStr = new Date(att.date).toISOString().split('T')[0];
                    return (
                      <li key={att._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', borderBottom: '1px solid var(--border)' }}>
                        <div>
                          <strong>{new Date(att.date).toLocaleDateString()}</strong>
                          <p style={{ fontSize: '0.85rem', color: att.status === 'present' ? 'var(--secondary)' : att.status === 'absent' ? 'var(--danger)' : 'var(--warning)', textTransform: 'capitalize' }}>
                            {att.status}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDeleteSpecificDay(dateStr)}
                          style={{ background: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem' }}
                          title="Delete this day"
                        >
                          🗑️
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            
            <button className="btn-submit" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setIsModalOpen(false)}>
              {t("Close", "বন্ধ করুন")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;