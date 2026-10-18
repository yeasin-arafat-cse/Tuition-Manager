import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Schedule.css';

const daysOfWeek = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const Schedule = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useApp();

  const [weeklyRoutine, setWeeklyRoutine] = useState(
    daysOfWeek.map(day => ({ day, subject: '', time: '', duration: 60 }))
  );

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/students');
        setStudents(res.data.students);
        if (res.data.students.length > 0) {
          setSelectedStudent(res.data.students[0]._id);
        }
      } catch (error) {
        toast.error('Failed to load students');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;

    const fetchRoutine = async () => {
      try {
        const res = await api.get(`/schedules?studentId=${selectedStudent}`);
        const savedSchedules = res.data.schedules;

        const newRoutine = daysOfWeek.map(day => {
          const existing = savedSchedules.find(s => s.day === day);
          return {
            day,
            subject: existing ? existing.subject : '',
            time: existing ? existing.time : '',
            duration: existing ? existing.duration : 60
          };
        });

        setWeeklyRoutine(newRoutine);
      } catch (error) {
        console.error("Failed to load routine", error);
      }
    };
    fetchRoutine();
  }, [selectedStudent]);

  const handleRoutineChange = (index, field, value) => {
    const updated = [...weeklyRoutine];
    updated[index][field] = value;
    setWeeklyRoutine(updated);
  };

  const handleSave = async () => {
    if (!selectedStudent) return toast.error("Select a student first");
    setIsSaving(true);

    const activeRoutine = weeklyRoutine.filter(r => r.subject.trim() !== '' && r.time.trim() !== '');

    try {
      await api.post('/schedules', {
        studentId: selectedStudent,
        routine: activeRoutine
      });
      toast.success(t("Routine saved successfully!", "রুটিন সেভ হয়েছে!"));
    } catch (error) {
      toast.error('Failed to save routine');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t("Weekly Routine Setup", "সাপ্তাহিক রুটিন সেটআপ")}</h1>
      </div>

      <div className="routine-setup-container">
        <div className="setup-sidebar">
          <div className="form-group">
            <label>{t("Select Student", "স্টুডেন্ট সিলেক্ট করুন")}</label>
            <select 
              value={selectedStudent} 
              onChange={(e) => setSelectedStudent(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
            >
              {students.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.class})</option>
              ))}
            </select>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            {t("Select a student to view or edit their weekly class schedule.", "স্টুডেন্ট সিলেক্ট করে তার সাপ্তাহিক রুটিন দেখুন বা পরিবর্তন করুন।")}
          </p>
        </div>

        <div>
          <div className="routine-days-grid">
            {weeklyRoutine.map((routine, index) => (
              <div key={routine.day} className="day-row">
                <div className="day-label">{routine.day}</div>
                
                <input 
                  type="text" 
                  placeholder={t("Subject", "বিষয়")} 
                  value={routine.subject}
                  onChange={(e) => handleRoutineChange(index, 'subject', e.target.value)}
                />
                
                <input 
                  type="text" 
                  placeholder={t("Time", "সময়")} 
                  value={routine.time}
                  onChange={(e) => handleRoutineChange(index, 'time', e.target.value)}
                />

                <input 
                  type="number" 
                  placeholder={t("Mins", "মিনিট")} 
                  value={routine.duration}
                  onChange={(e) => handleRoutineChange(index, 'duration', e.target.value)}
                />
              </div>
            ))}
          </div>

          <button className="btn-save-routine" onClick={handleSave} disabled={isSaving}>
            {isSaving ? t("Saving...", "সেভ হচ্ছে...") : t("Save Weekly Routine", "সাপ্তাহিক রুটিন সেভ করুন")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Schedule;