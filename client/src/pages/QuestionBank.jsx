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
  
  // 👈 সার্চ ও ফিল্টার স্টেট
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  const { t } = useApp();

  const fetchBanks = async () => {
    setIsLoading(true);
    try {
      // 👈 API-তে কুয়েরি প্যারামিটার পাঠানো হচ্ছে
      let url = '/ai/question-bank?';
      if (filterClass) url += `class=${filterClass}&`;
      if (filterSubject) url += `subject=${filterSubject}`;

      const res = await api.get(url);
      setBanks(res.data.banks);
    } catch (error) {
      toast.error('Failed to load question banks');
    } finally {
      setIsLoading(false);
    }
  };

  // ফিল্টার বা সাবজেক্ট চেঞ্জ হলে ডেটা রিফ্রেশ হবে
  useEffect(() => {
    fetchBanks();
  }, [filterClass, filterSubject]);

  const handleDelete = async (id) => {
    if (!window.confirm(t("Are you sure you want to delete this question bank?", "আপনি কি নিশ্চিত এই প্রশ্ন ব্যাংকটি ডিলিট করতে চান?"))) return;
    try {
      await api.delete(`/ai/question-bank/${id}`);
      toast.success(t("Deleted!", "ডিলিট হয়েছে!"));
      fetchBanks();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const openDetails = (bank) => {
    setSelectedBank(bank);
    setIsModalOpen(true);
  };

    // 👈 টাইটেল দিয়ে সার্চ করার জন্য লোকাল ফিল্টার (নিরাপদভাবে)
  const filteredBanks = banks.filter(bank => {
    const term = searchTerm.toLowerCase();
    const bankClass = bank.class ? bank.class.toLowerCase() : '';
    const bankSubject = bank.subject ? bank.subject.toLowerCase() : '';
    
    return bankClass.includes(term) || bankSubject.includes(term);
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title">{t("Question Bank", "প্রশ্ন ব্যাংক")}</h1>
      </div>

      {/* 👈 সার্চ এবং ফিল্টার সেকশন (Text Input) */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        
        <input 
          type="text" 
          placeholder={t("Search by subject or class...", "বিষয় বা ক্লাস দিয়ে খুঁজুন...")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
        />

        <input 
          type="text" 
          placeholder={t("Class (e.g. 8, 10)", "ক্লাস (যেমন: 8, 10)")}
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', minWidth: '120px' }}
        />

        <input 
          type="text" 
          placeholder={t("Subject (e.g. Math)", "বিষয় (যেমন: Math)")}
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', minWidth: '120px' }}
        />

      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      ) : filteredBanks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <h3>{t("No questions found.", "কোনো প্রশ্ন পাওয়া যায়নি।")}</h3>
          <p>Try changing the filters or search term.</p>
        </div>
      ) : (
        <div className="exam-list">
          {filteredBanks.map((bank) => (
            <div key={bank._id} className="exam-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>{bank.subject}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold' }}>
                    {bank.class} {/* 👈 ক্লাস দেখানো হচ্ছে */}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {t("Source:", "সোর্স:")} <span style={{ textTransform: 'uppercase' }}>{bank.source}</span> | 
                    {t("Total:", "মোট:")} {bank.questions.length} Qs
                  </p>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {new Date(bank.createdAt).toLocaleDateString()}
                </div>
              </div>

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
              <h2>{selectedBank.subject} ({selectedBank.class}) - {t("Questions", "প্রশ্নসমূহ")}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
              {selectedBank.questions.map((q, index) => (
                <div key={index} className="q-card" style={{ marginBottom: '1rem', backgroundColor: 'var(--bg-main)' }}>
                  
                  {/* MCQ */}
                  {q.question && q.options && q.options.length > 0 && (
                    <>
                      <div className="q-title">{index + 1}. {q.question}</div>
                      <div className="q-options">
                        {q.options.map((opt, i) => (
                          <div key={i} className={`q-option ${opt === q.correctAnswer ? 'correct' : ''}`}>
                            {opt === q.correctAnswer ? '✅' : '⚪'} {opt}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Short Question */}
                  {q.question && (!q.options || q.options.length === 0) && !q.stem && (
                    <>
                      <div className="q-title">{index + 1}. {q.question}</div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', marginTop: '5px' }}>Ans: {q.correctAnswer}</p>
                    </>
                  )}

                  {/* Creative Question */}
                  {q.stem && (
                    <>
                      <div style={{ marginBottom: '10px', fontWeight: 'bold', color: 'var(--primary)' }}>{index + 1}. উদ্দীপক: {q.stem}</div>
                      <div style={{ marginBottom: '5px' }}><strong>{q.questionA}</strong> <br/> <span style={{ color: 'var(--secondary)' }}>Ans: {q.answerA}</span></div>
                      <div style={{ marginBottom: '5px' }}><strong>{q.questionB}</strong> <br/> <span style={{ color: 'var(--secondary)' }}>Ans: {q.answerB}</span></div>
                      <div style={{ marginBottom: '5px' }}><strong>{q.questionC}</strong> <br/> <span style={{ color: 'var(--secondary)' }}>Ans: {q.answerC}</span></div>
                      <div><strong>{q.questionD}</strong> <br/> <span style={{ color: 'var(--secondary)' }}>Ans: {q.answerD}</span></div>
                    </>
                  )}

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