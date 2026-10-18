import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Dashboard.css';
import './Schedule.css';

const StudentSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useApp();

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const res = await api.get('/schedules/student/my-routine');
        setSchedules(res.data.schedules);
      } catch (error) {
        if (error.response?.status === 404) {
          toast.error("Profile not linked properly");
        } else {
          toast.error('Failed to load routine');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoutine();
  }, []);

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

  // রুটিনকে দিন অনুযায়ী সাজানো
  const daysOrder = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t("My Weekly Routine", "আমার সাপ্তাহিক রুটিন")}</h1>
      </div>

      {schedules.length === 0 ? (
        <div className="dashboard-section" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            {t("No routine set yet!", "এখনো কোনো রুটিন সেট করা হয়নি!")}
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            {t("Ask your teacher to add your class schedule.", "আপনার শিক্ষককে আপনার রুটিন যোগ করতে বলুন।")}
          </p>
        </div>
      ) : (
        <div className="dashboard-grid">
          {daysOrder.map(day => {
            // এই নির্দিষ্ট দিনের ক্লাসগুলো ফিল্টার করা
            const classesForDay = schedules.filter(s => s.day === day).sort((a, b) => a.time.localeCompare(b.time));
            
            return (
              <div key={day} className="dashboard-section" style={{ padding: '1.2rem' }}>
                <h3 style={{ 
                  color: 'var(--primary)', 
                  borderBottom: '2px solid var(--border)', 
                  paddingBottom: '0.5rem',
                  marginBottom: '1rem',
                  fontSize: '1.1rem'
                }}>
                  {day}
                </h3>
                
                {classesForDay.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    {t("No classes", "কোনো ক্লাস নেই")}
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {classesForDay.map((cls, idx) => (
                      <div key={idx} style={{ 
                        background: 'var(--bg-main)', 
                        padding: '0.8rem', 
                        borderRadius: '8px',
                        borderLeft: '4px solid var(--secondary)'
                      }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{cls.subject}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          🕒 {cls.time} ({cls.duration} mins)
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentSchedule;