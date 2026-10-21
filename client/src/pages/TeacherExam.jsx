import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Students.css';
import './Exam.css';

const TeacherExam = () => {
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [banks, setBanks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingExam, setEditingExam] = useState(null); 
  
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('');

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedExamDetails, setSelectedExamDetails] = useState(null);
  
  const { t } = useApp();

  const [formData, setFormData] = useState({
    studentId: '',
    questionBankId: '',
    title: '',
    duration: 10
  });

  const fetchData = async () => {
    try {
      const [examRes, studentRes, bankRes] = await Promise.all([
        api.get(`/exams/teacher/all${selectedStudentFilter ? `?studentId=${selectedStudentFilter}` : ''}`),
        api.get('/students'),
        api.get('/ai/question-bank')
      ]);
      setExams(examRes.data.exams);
      setStudents(studentRes.data.students);
      setBanks(bankRes.data.banks);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStudentFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingExam) {
        await api.put(`/exams/${editingExam._id}`, {
          title: formData.title,
          duration: formData.duration
        });
        toast.success(t("Exam updated successfully!", "এক্সাম আপডেট হয়েছে!"));
      } else {
        await api.post('/exams/create', formData);
        toast.success(t("Exam created successfully!", "এক্সাম তৈরি হয়েছে!"));
      }
      
      setIsModalOpen(false);
      setEditingExam(null);
      setFormData({ studentId: '', questionBankId: '', title: '', duration: 10 });
      fetchData(); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      duration: exam.duration,
      studentId: exam.student._id,
      questionBankId: exam.questions.length > 0 ? 'keep-same' : '' 
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm(t("Are you sure? This exam and its result will be deleted permanently.", "আপনি কি নিশ্চিত? এই এক্সাম এবং এর রেজাল্ট স্থায়ীভাবে মুছে যাবে।"))) return;
    try {
      await api.delete(`/exams/${id}`);
      toast.success(t("Exam deleted successfully!", "এক্সাম ডিলিট হয়েছে!"));
      fetchData();
    } catch (error) {
      toast.error('Failed to delete exam');
    }
  };

  const handleViewDetails = async (examId) => {
    try {
      const res = await api.get(`/exams/${examId}/details`);
      setSelectedExamDetails(res.data.exam);
      setIsDetailsOpen(true);
    } catch (error) {
      toast.error('Failed to load exam details');
    }
  };

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title">{t("Exams & Results", "এক্সাম ও রেজাল্ট")}</h1>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={selectedStudentFilter}
            onChange={(e) => setSelectedStudentFilter(e.target.value)}
            style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
          >
            <option value="">{t("All Students", "সব স্টুডেন্ট")}</option>
            {students.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>

          <button 
            className="add-btn" 
            onClick={() => {
              setEditingExam(null);
              setFormData({ studentId: '', questionBankId: '', title: '', duration: 10 });
              setIsModalOpen(true);
            }}
          >
            + {t("Create Exam", "এক্সাম তৈরি করুন")}
          </button>
        </div>
      </div>

      {exams.length === 0 ? (
        <div className="exam-list">
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            {t("No exams found.", "কোনো এক্সাম পাওয়া যায়নি।")}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t("Exam Title", "এক্সামের নাম")}</th>
                <th>{t("Student", "স্টুডেন্ট")}</th>
                <th>{t("Duration", "সময়")}</th>
                <th>{t("Status & Score", "স্ট্যাটাস ও স্কোর")}</th>
                <th>{t("Action", "অ্যাকশন")}</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam._id}>
                  <td style={{ fontWeight: '600' }}>{exam.title}</td>
                  <td>{exam.student?.name} <br/><small>{exam.student?.class}</small></td>
                  <td>{exam.duration} {t("mins", "মিনিট")}</td>
                  <td>
                    <span className={`badge ${exam.status === 'submitted' ? 'paid' : 'due'}`}>
                      {exam.status}
                    </span>
                    {exam.status === 'submitted' && (
                      <span style={{ marginLeft: '8px', fontWeight: '700', color: 'var(--primary)' }}>
                        {exam.score} / {exam.total}
                      </span>
                    )}
                  </td>
                  <td>
                    {exam.status === 'submitted' && (
                      <button 
                        onClick={() => handleViewDetails(exam._id)}
                        style={{ color: 'var(--secondary)', background: 'none', fontWeight: 'bold', marginRight: '10px' }}
                      >
                        {t("View Answers", "উত্তর দেখুন")}
                      </button>
                    )}
                    <button onClick={() => handleEditClick(exam)} style={{ color: 'var(--primary)', background: 'none', fontWeight: 'bold', marginRight: '10px' }}>{t("Edit", "এডিট")}</button>
                    <button onClick={() => handleDeleteClick(exam._id)} style={{ color: 'var(--danger)', background: 'none', fontWeight: 'bold' }}>{t("Delete", "ডিলিট")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Exam Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingExam ? t("Edit Exam", "এক্সাম এডিট করুন") : t("Create New Exam", "নতুন এক্সাম")}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t("Exam Title", "এক্সামের নাম")}</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              </div>

              <div className="form-group">
                <label>{t("Exam Duration (Minutes)", "এক্সামের সময় (মিনিট)")}</label>
                <input 
                  type="number" 
                  min="1" 
                  value={formData.duration} 
                  onChange={(e) => setFormData({...formData, duration: e.target.value})} 
                  required 
                />
              </div>

              {!editingExam && (
                <>
                  <div className="form-group">
                    <label>{t("Select Student", "স্টুডেন্ট সিলেক্ট করুন")}</label>
                    <select value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})} required>
                      <option value="">-- {t("Choose", "বাছাই করুন")} --</option>
                      {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{t("Select Question Bank", "প্রশ্ন ব্যাংক সিলেক্ট করুন")}</label>
                    <select value={formData.questionBankId} onChange={(e) => setFormData({...formData, questionBankId: e.target.value})} required>
                      <option value="">-- {t("Choose", "বাছাই করুন")} --</option>
                      {banks.map(b => (
                        <option key={b._id} value={b._id}>
                          {b.subject} ({b.questions.length} Qs)
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="btn-group">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>{t("Cancel", "বাতিল")}</button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? t("Saving...", "সেভ হচ্ছে...") : (editingExam ? t("Update", "আপডেট") : t("Create", "তৈরি করুন"))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Answers Modal */}
      {isDetailsOpen && selectedExamDetails && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>{selectedExamDetails.student?.name} - {t("Answers", "উত্তরপত্র")}</h2>
              <button className="close-btn" onClick={() => setIsDetailsOpen(false)}>×</button>
            </div>
            
            <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
              {selectedExamDetails.questions.map((q, index) => {
                const studentAns = selectedExamDetails.studentAnswers.find(a => a.questionId === q._id.toString());
                const isMcq = q.options && q.options.length > 0;

                return (
                  <div key={q._id} className="question-box" style={{ marginBottom: '1.5rem' }}>
                    <div className="question-text">
                      <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>Q{index + 1}.</span> 
                      {isMcq ? q.question : (q.stem ? `উদ্দীপক: ${q.stem}` : q.question)}
                    </div>

                    {isMcq && q.options.map((opt, i) => {
                      const isSelected = studentAns?.selectedOption === opt;
                      const isCorrect = q.correctAnswer === opt;
                      return (
                        <label key={i} className="option-label" style={{
                          borderColor: isCorrect ? 'var(--secondary)' : (isSelected ? 'var(--danger)' : 'var(--border)'),
                          backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.1)' : (isSelected ? 'rgba(239, 68, 68, 0.1)' : 'transparent'),
                          cursor: 'default'
                        }}>
                          <input type="radio" checked={isSelected} readOnly />
                          <span>{opt}</span>
                          {isCorrect && <span style={{ marginLeft: 'auto', color: 'var(--secondary)' }}>✅ Correct</span>}
                          {isSelected && !isCorrect && <span style={{ marginLeft: 'auto', color: 'var(--danger)' }}>❌ Student's Answer</span>}
                        </label>
                      );
                    })}

                    {!isMcq && !q.stem && (
                      <div style={{ marginTop: '10px', padding: '10px', background: 'var(--bg-main)', borderRadius: '8px' }}>
                        <p><strong>{t("Student's Answer:", "স্টুডেন্টের উত্তর:")}</strong> {studentAns?.textAnswer || 'N/A'}</p>
                        <p style={{ color: 'var(--secondary)', marginTop: '5px' }}><strong>{t("Correct Answer:", "সঠিক উত্তর:")}</strong> {q.correctAnswer}</p>
                      </div>
                    )}

                    {q.stem && (
                      <div style={{ marginTop: '10px', padding: '10px', background: 'var(--bg-main)', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '10px' }}><strong>{q.questionA}</strong> <br/> <span style={{ color: 'var(--secondary)' }}>Ans: {q.answerA}</span></div>
                        <div style={{ marginBottom: '10px' }}><strong>{q.questionB}</strong> <br/> <span style={{ color: 'var(--secondary)' }}>Ans: {q.answerB}</span></div>
                        <div style={{ marginBottom: '10px' }}><strong>{q.questionC}</strong> <br/> <span style={{ color: 'var(--secondary)' }}>Ans: {q.answerC}</span></div>
                        <div><strong>{q.questionD}</strong> <br/> <span style={{ color: 'var(--secondary)' }}>Ans: {q.answerD}</span></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <button className="btn-submit" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setIsDetailsOpen(false)}>
              {t("Close", "বন্ধ করুন")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherExam;