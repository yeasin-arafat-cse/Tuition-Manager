import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Exam.css';

const StudentExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const { t } = useApp();
  
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({}); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [isResultView, setIsResultView] = useState(false); 
  
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/exams/${id}`);
        setExam(res.data.exam);
        
        if (res.data.isResultView) {
          setIsResultView(true);
          setResult({
            score: res.data.exam.score,
            total: res.data.exam.total
          });
          setAnswers(
            res.data.exam.studentAnswers.reduce((acc, ans) => {
              acc[ans.questionId] = ans.selectedOption;
              return acc;
            }, {})
          );
        } else {
          setTimeLeft(res.data.exam.duration * 60);
        }
      } catch (error) {
        toast.error('Exam not found');
        navigate('/student/exams');
      } finally {
        setIsLoading(false);
      }
    };
    fetchExam();
  }, [id, navigate]);

  useEffect(() => {
    if (isResultView || timeLeft === null || result) return;
    
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, result, isResultView]);

  const handleOptionChange = (questionId, option) => {
    if (isResultView) return; 
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (isResultView) return;

    if (!isAutoSubmit) {
      const formattedAnswers = Object.keys(answers).map(qId => ({
        questionId: qId,
        selectedOption: answers[qId]
      }));

      if (formattedAnswers.length !== exam.questions.length) {
        if(!window.confirm(t("You haven't answered all questions. Submit anyway?", "আপনি সব প্রশ্নের উত্তর দেননি। তবুও সাবমিট করবেন?"))) return;
      }
    } else {
      toast.error(t("Time is up! Exam auto-submitted.", "সময় শেষ! এক্সাম অটো সাবমিট হয়েছে।"));
    }

    setIsSubmitting(true);
    const formattedAnswers = Object.keys(answers).map(qId => ({
      questionId: qId,
      selectedOption: answers[qId]
    }));

    try {
      const res = await api.post(`/exams/${id}/submit`, { answers: formattedAnswers });
      setResult(res.data);
      setIsResultView(true);
    } catch (error) {
      toast.error('Failed to submit exam');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <div className="exam-container animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            {percentage >= 80 ? '🏆' : percentage >= 50 ? '🎉' : '😢'}
          </div>
          <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{t("Exam Result", "এক্সামের রেজাল্ট")}</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{exam.title}</p>
          
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
        </div>

        <h2 className="section-title" style={{ marginBottom: '1rem' }}>📝 {t("Question Review", "প্রশ্ন ও উত্তর পর্যালোচনা")}</h2>
        
        {exam.questions.map((q, index) => {
          const studentAnswer = answers[q._id];
          const isCorrect = studentAnswer === q.correctAnswer;

          return (
            <div key={q._id} className="question-box" style={{ borderLeft: isCorrect ? '4px solid var(--secondary)' : '4px solid var(--danger)' }}>
              <div className="question-text">
                <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>Q{index + 1}.</span> 
                {q.question}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {q.options.map((opt, i) => {
                  const isSelected = studentAnswer === opt;
                  const isCorrectOption = q.correctAnswer === opt;
                  
                  let backgroundColor = 'transparent';
                  let borderColor = 'var(--border)';
                  
                  if (isCorrectOption) {
                    backgroundColor = 'rgba(16, 185, 129, 0.1)';
                    borderColor = 'var(--secondary)';
                  } else if (isSelected && !isCorrectOption) {
                    backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    borderColor = 'var(--danger)';
                  }

                  return (
                    <label 
                      key={i} 
                      className="option-label"
                      style={{ borderColor, backgroundColor, cursor: 'default' }}
                    >
                      <input type="radio" checked={isSelected} readOnly />
                      <span style={{ fontWeight: isCorrectOption || isSelected ? '600' : '400' }}>{opt}</span>
                      {isCorrectOption && <span style={{ marginLeft: 'auto', color: 'var(--secondary)' }}>✅ Correct</span>}
                      {isSelected && !isCorrectOption && <span style={{ marginLeft: 'auto', color: 'var(--danger)' }}>❌ Your Answer</span>}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        <button className="add-btn" onClick={() => navigate('/student/exams')} style={{ margin: '2rem auto', display: 'block', padding: '1rem 2rem' }}>
          {t("Back to Result Screen", "রেজাল্ট স্ক্রিন ফিরে যান")}
        </button>
      </div>
    );
  }

  // এক্সাম দেওয়ার স্ক্রিন
  return (
    <div className="exam-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid var(--border)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>{exam.title}</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {t("Total Questions:", "মোট প্রশ্ন:")} {exam.questions.length}
          </p>
        </div>
        
        <div style={{ 
          background: timeLeft < 60 ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-main)', 
          color: timeLeft < 60 ? 'var(--danger)' : 'var(--text-main)',
          padding: '1rem 1.5rem', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: `1px solid ${timeLeft < 60 ? 'var(--danger)' : 'var(--border)'}`
        }}>
          <p style={{ fontSize: '0.8rem', color: timeLeft < 60 ? 'var(--danger)' : 'var(--text-muted)' }}>⏱️ {t("Time Left", "বাকি সময়")}</p>
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