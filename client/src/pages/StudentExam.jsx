import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Exam.css';

const StudentExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useApp();
  
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({}); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  
  // 👈 টাইমার স্টেট
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/exams/${id}`);
        setExam(res.data.exam);
        // টাইমার সেট করা (মিনিট থেকে সেকেন্ডে)
        setTimeLeft(res.data.exam.duration * 60); 
      } catch (error) {
        toast.error('Exam not found');
        navigate('/student/exams');
      } finally {
        setIsLoading(false);
      }
    };
    fetchExam();
  }, [id, navigate]);

  // 👈 টাইমার লজিক
  useEffect(() => {
    if (timeLeft === null || result) return; // রেজাল্ট এলে বা টাইমার না থাকলে বন্ধ
    
    if (timeLeft <= 0) {
      handleSubmit(true); // সময় শেষ, অটো সাবমিট
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, result]);

  const handleOptionChange = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!isAutoSubmit) {
      const formattedAnswers = Object.keys(answers).map(qId => ({
        questionId: qId,
        selectedOption: answers[qId]
      }));

      if (formattedAnswers.length !== exam.questions.length) {
        if(!window.confirm(t("You haven't answered all questions. Submit anyway?", "আপনি সব প্রশ্নের উত্তর দেননি। তবুও সাবমিট করবেন?"))) return;
      }
    } else {
      toast.error(t("Time is up! Exam auto-submitted.", "সময় শেষ! এক্সাম অটো সাবমিট হয়েছে।"));
    }

    setIsSubmitting(true);
    const formattedAnswers = Object.keys(answers).map(qId => ({
      questionId: qId,
      selectedOption: answers[qId]
    }));

    try {
      const res = await api.post(`/exams/${id}/submit`, { answers: formattedAnswers });
      setResult(res.data);
    } catch (error) {
      toast.error('Failed to submit exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  // টাইমার ফরম্যাট (MM:SS)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Exam...</div>;
  if (!exam) return <div>Exam not found</div>;

  // রেজাল্ট স্ক্রিন
  if (result) {
    const percentage = Math.round((result.score / result.total) * 100);
    return (
      <div className="exam-container animate-fade-in" style={{ textAlign: 'center', marginTop: '2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
          {percentage >= 80 ? '🏆' : percentage >= 50 ? '🎉' : '😢'}
        </div>
        <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{t("Exam Completed!", "এক্সাম সম্পন্ন!")}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{exam.title}</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '12px', minWidth: '150px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t("Your Score", "আপনার স্কোর")}</p>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--secondary)' }}>{result.score} <span style={{fontSize: '1.2rem', color: 'var(--text-muted)'}}>/ {result.total}</span></h2>
          </div>
          <div style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '12px', minWidth: '150px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t("Percentage", "শতকরা হার")}</p>
            <h2 style={{ fontSize: '2.5rem', color: percentage >= 50 ? 'var(--primary)' : 'var(--danger)' }}>{percentage}%</h2>
          </div>
        </div>

        <button className="add-btn" onClick={() => navigate('/student/exams')} style={{ margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
          {t("Back to Exams", "এক্সাম লিস্টে ফিরে যান")}
        </button>
      </div>
    );
  }

  // এক্সাম দেওয়ার স্ক্রিন
  return (
    <div className="exam-container animate-fade-in">
      {/* হেডার এবং টাইমার */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid var(--border)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>{exam.title}</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {t("Total Questions:", "মোট প্রশ্ন:")} {exam.questions.length}
          </p>
        </div>
        
        {/* 👈 টাইমার ডিসপ্লে */}
        <div style={{ 
          background: timeLeft < 60 ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-main)', 
          color: timeLeft < 60 ? 'var(--danger)' : 'var(--text-main)',
          padding: '1rem 1.5rem', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: `1px solid ${timeLeft < 60 ? 'var(--danger)' : 'var(--border)'}`
        }}>
          <p style={{ fontSize: '0.8rem', color: timeLeft < 60 ? 'var(--danger)' : 'var(--text-muted)' }}>⏱️ {t("Time Left", "বাকি সময়")}</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatTime(timeLeft)}</h3>
        </div>
      </div>

      {exam.questions.map((q, index) => (
        <div key={q._id} className="question-box">
          <div className="question-text">
            <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>Q{index + 1}.</span> 
            {q.question}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {q.options.map((opt, i) => {
              const isSelected = answers[q._id] === opt;
              return (
                <label 
                  key={i} 
                  className={`option-label ${isSelected ? 'selected' : ''}`}
                  style={{
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                  }}
                >
                  <input 
                    type="radio" 
                    name={`q-${q._id}`} 
                    value={opt}
                    checked={isSelected}
                    onChange={() => handleOptionChange(q._id, opt)}
                  />
                  <span style={{ fontWeight: isSelected ? '600' : '400' }}>{opt}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <button 
        onClick={() => handleSubmit(false)} 
        className="auth-btn" 
        disabled={isSubmitting}
        style={{ width: '100%', marginTop: '1rem', padding: '1.2rem', fontSize: '1.1rem' }}
      >
        {isSubmitting ? t("Submitting...", "সাবমিট হচ্ছে...") : t("Submit Exam", "এক্সাম সাবমিট করুন")}
      </button>
    </div>
  );
};

export default StudentExam;