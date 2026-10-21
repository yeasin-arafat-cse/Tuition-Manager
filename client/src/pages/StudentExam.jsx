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
  const [textAnswers, setTextAnswers] = useState({}); 
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
          setResult({ score: res.data.exam.score, total: res.data.exam.total });
          const mcqAns = {};
          const textAns = {};
          res.data.exam.studentAnswers.forEach(ans => {
            if (ans.selectedOption) mcqAns[ans.questionId] = ans.selectedOption;
            if (ans.textAnswer) textAns[ans.questionId] = ans.textAnswer;
          });
          setAnswers(mcqAns);
          setTextAnswers(textAns);
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
    if (timeLeft <= 0) { handleSubmit(true); return; }
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, result, isResultView]);

  const handleOptionChange = (questionId, option) => {
    if (isResultView) return;
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleTextChange = (questionId, text) => {
    if (isResultView) return;
    setTextAnswers({ ...textAnswers, [questionId]: text });
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (isResultView) return;
    setIsSubmitting(true);
    
    const formattedAnswers = exam.questions.map(q => {
      const qId = q._id.toString();
      return {
        questionId: qId,
        selectedOption: answers[qId] || null,
        textAnswer: textAnswers[qId] || null,
      };
    });

    if (!isAutoSubmit) {
      if (!window.confirm(t("Submit exam?", "এক্সাম সাবমিট করবেন?"))) {
        setIsSubmitting(false);
        return;
      }
    } else {
      toast.error(t("Time is up! Exam auto-submitted.", "সময় শেষ! এক্সাম অটো সাবমিট হয়েছে।"));
    }

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
    const percentage = Math.round((result.score / result.total) * 100) || 0;
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
          </div>
        </div>

        <h2 className="section-title" style={{ marginBottom: '1rem' }}>📝 {t("Question Review", "প্রশ্ন ও উত্তর পর্যালোচনা")}</h2>
        
        {exam.questions.map((q, index) => {
          const qId = q._id.toString();
          const studentMcqAns = answers[qId];
          const studentTextAns = textAnswers[qId];
          const isMcq = q.options && q.options.length > 0;

          return (
            <div key={q._id} className="question-box" style={{ borderLeft: isMcq ? (studentMcqAns === q.correctAnswer ? '4px solid var(--secondary)' : '4px solid var(--danger)') : '4px solid var(--border)' }}>
              <div className="question-text">
                <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>Q{index + 1}.</span> 
                {isMcq ? q.question : (q.stem ? `উদ্দীপক: ${q.stem}` : q.question)}
              </div>

              {isMcq && q.options.map((opt, i) => {
                const isSelected = studentMcqAns === opt;
                const isCorrectOption = q.correctAnswer === opt;
                return (
                  <label key={i} className="option-label" style={{
                    borderColor: isCorrectOption ? 'var(--secondary)' : (isSelected ? 'var(--danger)' : 'var(--border)'),
                    backgroundColor: isCorrectOption ? 'rgba(16, 185, 129, 0.1)' : (isSelected ? 'rgba(239, 68, 68, 0.1)' : 'transparent'),
                    cursor: 'default'
                  }}>
                    <input type="radio" checked={isSelected} readOnly />
                    <span>{opt}</span>
                    {isCorrectOption && <span style={{ marginLeft: 'auto', color: 'var(--secondary)' }}>✅</span>}
                  </label>
                );
              })}

              {!isMcq && !q.stem && (
                <div style={{ marginTop: '10px' }}>
                  <p><strong>{t("Your Answer:", "আপনার উত্তর:")}</strong> {studentTextAns || 'N/A'}</p>
                  <p style={{ color: 'var(--secondary)' }}><strong>{t("Correct Answer:", "সঠিক উত্তর:")}</strong> {q.correctAnswer}</p>
                </div>
              )}

              {q.stem && (
                <div style={{ marginTop: '10px' }}>
                  <p><strong>{q.questionA}</strong> <br/> <span style={{ color: 'var(--secondary)' }}>Ans: {q.answerA}</span></p>
                  <p><strong>{q.questionB}</strong> <br/> <span style={{ color: 'var(--secondary)' }}>Ans: {q.answerB}</span></p>
                  <p><strong>{q.questionC}</strong> <br/> <span style={{ color: 'var(--secondary)' }}>Ans: {q.answerC}</span></p>
                  <p><strong>{q.questionD}</strong> <br/> <span style={{ color: 'var(--secondary)' }}>Ans: {q.answerD}</span></p>
                </div>
              )}
            </div>
          );
        })}

        <button className="add-btn" onClick={() => navigate('/student/exams')} style={{ margin: '2rem auto', display: 'block', padding: '1rem 2rem' }}>
          {t("Back to Exams", "এক্সাম লিস্টে ফিরে যান")}
        </button>
      </div>
    );
  }

  // এক্সাম দেওয়ার স্ক্রিন
  return (
    <div className="animate-fade-in">
      
      {/* 👈 শুধু টাইমার থাকবে স্টিকি হেডারে */}
      <div className="exam-header-sticky">
        <div style={{ 
          background: timeLeft < 60 ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-card)', 
          color: timeLeft < 60 ? 'var(--danger)' : 'var(--text-main)',
          padding: '0.4rem 1.2rem', 
          borderRadius: '20px',
          textAlign: 'center',
          border: `1px solid ${timeLeft < 60 ? 'var(--danger)' : 'var(--border)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
          <span style={{ fontSize: '1rem' }}>⏱️</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>{formatTime(timeLeft)}</h3>
        </div>
      </div>

      {/* 👈 এক্সামের মূল কন্টেইনার */}
      <div className="exam-container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{exam.title}</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {t("Total Questions:", "মোট প্রশ্ন:")} {exam.questions.length}
          </p>
        </div>

        {exam.questions.map((q, index) => {
          const qId = q._id.toString();
          const isMcq = q.options && q.options.length > 0;

          return (
            <div key={q._id} className="question-box">
              <div className="question-text">
                <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>Q{index + 1}.</span> 
                {isMcq ? q.question : (q.stem ? `উদ্দীপক: ${q.stem}` : q.question)}
              </div>
              
              {isMcq && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {q.options.map((opt, i) => {
                    const isSelected = answers[qId] === opt;
                    return (
                      <label key={i} className={`option-label ${isSelected ? 'selected' : ''}`} style={{
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                      }}>
                        <input type="radio" name={`q-${qId}`} value={opt} checked={isSelected} onChange={() => handleOptionChange(qId, opt)} />
                        <span style={{ fontWeight: isSelected ? '600' : '400' }}>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {!isMcq && !q.stem && (
                <textarea
                  placeholder={t("Write your answer here...", "এখানে আপনার উত্তর লিখুন...")}
                  value={textAnswers[qId] || ''}
                  onChange={(e) => handleTextChange(qId, e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '10px', background: 'var(--bg-main)', color: 'var(--text-main)', minHeight: '80px' }}
                />
              )}

              {q.stem && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                  <div>
                    <p style={{ fontWeight: 'bold' }}>{q.questionA}</p>
                    <textarea placeholder={t("Answer A...", "ক এর উত্তর...")} value={textAnswers[`${qId}_A`] || ''} onChange={(e) => handleTextChange(`${qId}_A`, e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 'bold' }}>{q.questionB}</p>
                    <textarea placeholder={t("Answer B...", "খ এর উত্তর...")} value={textAnswers[`${qId}_B`] || ''} onChange={(e) => handleTextChange(`${qId}_B`, e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 'bold' }}>{q.questionC}</p>
                    <textarea placeholder={t("Answer C...", "গ এর উত্তর...")} value={textAnswers[`${qId}_C`] || ''} onChange={(e) => handleTextChange(`${qId}_C`, e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 'bold' }}>{q.questionD}</p>
                    <textarea placeholder={t("Answer D...", "ঘ এর উত্তর...")} value={textAnswers[`${qId}_D`] || ''} onChange={(e) => handleTextChange(`${qId}_D`, e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <button onClick={() => handleSubmit(false)} className="auth-btn" disabled={isSubmitting} style={{ width: '100%', marginTop: '1rem', padding: '1.2rem', fontSize: '1.1rem' }}>
          {isSubmitting ? t("Submitting...", "সাবমিট হচ্ছে...") : t("Submit Exam", "এক্সাম সাবমিট করুন")}
        </button>
      </div>
    </div>
  );
};

export default StudentExam;