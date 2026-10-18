import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Attendance.css';

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({}); // { studentId: "present" | "absent" }
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useApp();

  // ১. স্টুডেন্ট লিস্ট এবং নির্দিষ্ট তারিখের হাজিরা ফেচ করা
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [studentRes, attRes] = await Promise.all([
        api.get('/students'),
        api.get(`/attendance/date/${date}`)
      ]);
      
      // স্টুডেন্ট লিস্ট সেট করা (যদি ডেটা না থাকে তবে খালি অ্যারে)
      setStudents(studentRes.data.students || []);

      // আগের হাজিরা ডাটাকে অবজেক্টে রূপান্তর করা (নিরাপদভাবে)
      const existingAtt = {};
      if (attRes.data && attRes.data.attendance) {
        attRes.data.attendance.forEach(att => {
          if (att.student && att.student._id) {
            existingAtt[att.student._id] = att.status;
          }
        });
      }
      setAttendanceData(existingAtt);

    } catch (error) {
      console.error("Attendance Error:", error); // কনসোল এ আসল এরর দেখতে পাবেন
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  // হাজিরা পরিবর্তন করা
  const handleAttendance = async (studentId, status) => {
    // লোকাল স্টেট আপডেট (ফাস্ট রেসপন্সের জন্য)
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));

    try {
      await api.post('/attendance', {
        studentId,
        date,
        status
      });
      toast.success(t("Attendance marked", "হাজিরা সেভ হয়েছে"));
    } catch (error) {
      toast.error('Failed to save attendance');
      // এরর হলে আগের অবস্থায় ফিরিয়ে নেওয়া (Optional)
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="attendance-header">
        <h1 className="page-title">{t("Attendance", "হাজিরা")}</h1>
        <input 
          type="date" 
          className="date-input" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
        />
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      ) : students.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          {t("No students found.", "কোনো স্টুডেন্ট পাওয়া যায়নি।")}
        </div>
      ) : (
        <div className="attendance-list">
          {students.map((student) => {
            const currentStatus = attendanceData[student._id];

            return (
              <div key={student._id} className="attendance-item">
                <div className="student-info">
                  <h4>{student.name}</h4>
                  <p>{student.class} - {student.subject}</p>
                </div>
                <div className="attendance-actions">
                  <button 
                    className={`att-btn present ${currentStatus === 'present' ? 'active' : ''}`}
                    onClick={() => handleAttendance(student._id, 'present')}
                  >
                    {t("Present", "উপস্থিত")}
                  </button>
                  <button 
                    className={`att-btn absent ${currentStatus === 'absent' ? 'active' : ''}`}
                    onClick={() => handleAttendance(student._id, 'absent')}
                  >
                    {t("Absent", "অনুপস্থিত")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Attendance;