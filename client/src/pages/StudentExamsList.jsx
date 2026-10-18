import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Students.css';
import './Exam.css';

const StudentExamsList = () => {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get(`/exams/student/my-exams`); 
        setExams(res.data.exams);
      } catch (error) {
        if (error.response?.status === 404) {
           toast.error("Profile not linked properly");
        } else {
           toast.error('Failed to load exams');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t("My Exams", "আমার এক্সাম")}</h1>
      </div>

      {exams.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t("No exams assigned yet!", "এখনো কোনো এক্সাম দেওয়া হয়নি!")}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{t("Take a deep breath, you are all caught up.", "একটা লম্বা শ্বাস নিন, আপনার সব কাজ শেষ!")}</p>
        </div>
      ) : (
        <div className="exam-list">
          {exams.map((exam) => (
            <div key={exam._id} className="exam-card">
              <div className="exam-info">
                <h3>{exam.title}</h3>
                <p>Status: <span className={`badge ${exam.status === 'submitted' ? 'paid' : 'due'}`}>{exam.status}</span></p>
                <p>Total Questions: {exam.total}</p>
              </div>
              <div>
                {exam.status === 'pending' ? (
                  <button className="add-btn" onClick={() => navigate(`/student/exam/${exam._id}`)}>
                    {t("Start Exam", "এক্সাম শুরু করুন")}
                  </button>
                ) : (
                  <button className="add-btn" style={{ backgroundColor: 'var(--secondary)' }} onClick={() => navigate(`/student/exam/${exam._id}`)}>
                    {t("View Result", "রেজাল্ট দেখুন")} ({exam.score}/{exam.total})
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentExamsList;