import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Students.css'; 
import './Exam.css';

const QuestionBank = () => {
  const [banks, setBanks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const { t } = useApp();

  const fetchBanks = async () => {
    try {
      const res = await api.get('/ai/question-bank');
      setBanks(res.data.banks);
    } catch (error) {
      toast.error('Failed to load question banks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(t("Are you sure you want to delete this question bank?", "আপনি কি নিশ্চিত এই প্রশ্ন ব্যাংকটি ডিলিট করতে চান?"))) return;
    try {
      await api.delete(`/ai/question-bank/${id}`);
      toast.success(t("Deleted!", "ডিলিট হয়েছে!"));
      fetchBanks(); // লিস্ট রিফ্রেশ
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const openDetails = (bank) => {
    setSelectedBank(bank);
    setIsModalOpen(true);
  };

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t("Question Bank", "প্রশ্ন ব্যাংক")}</h1>
      </div>

      {banks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <h3>{t("No questions saved yet.", "এখনো কোনো প্রশ্ন সেভ করা হয়নি।")}</h3>
          <p>Go to AI MCQ page to generate and save questions.</p>
        </div>
      ) : (
        <div className="exam-list">
          {banks.map((bank) => (
            <div key={bank._id} className="exam-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>{bank.subject}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {t("Source:", "সোর্স:")} <span style={{ textTransform: 'uppercase' }}>{bank.source}</span> | 
                    {t("Total:", "মোট:")} {bank.questions.length} Qs
                  </p>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {new Date(bank.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* বাটন গ্রুপ */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', width: '100%' }}>
                <button 
                  className="add-btn" 
                  onClick={() => openDetails(bank)}
                  style={{ flex: 1, justifyContent: 'center', backgroundColor: 'var(--secondary)' }}
                >
                  👁️ {t("View Questions", "প্রশ্নগুলো দেখুন")}
                </button>
                <button 
                  className="btn-cancel" 
                  onClick={() => handleDelete(bank._id)}
                  style={{ flex: 1, color: 'var(--danger)', borderColor: 'var(--danger)', fontWeight: 'bold' }}
                >
                  🗑️ {t("Delete", "ডিলিট")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {isModalOpen && selectedBank && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>{selectedBank.subject} - {t("Questions", "প্রশ্নসমূহ")}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
              {selectedBank.questions.map((q, index) => (
                <div key={index} className="q-card" style={{ marginBottom: '1rem', backgroundColor: 'var(--bg-main)' }}>
                  <div className="q-title">{index + 1}. {q.question}</div>
                  <div className="q-options">
                    {q.options.map((opt, i) => (
                      <div key={i} className={`q-option ${opt === q.correctAnswer ? 'correct' : ''}`}>
                        {opt === q.correctAnswer ? '✅' : '⚪'} {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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

export default QuestionBank;