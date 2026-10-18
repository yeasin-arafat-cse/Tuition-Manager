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
  const [editingExam, setEditingExam] = useState(null); // 👈 এডিট করার জন্য
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
        api.get('/exams/teacher/all'),
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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingExam) {
        // 👈 এডিট মোড
        await api.put(`/exams/${editingExam._id}`, {
          title: formData.title,
          duration: formData.duration
        });
        toast.success(t("Exam updated successfully!", "এক্সাম আপডেট হয়েছে!"));
      } else {
        // 👈 নতুন তৈরি
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

  // 👈 এডিট বাটনে ক্লিক করলে
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

  // 👈 ডিলিট বাটনে ক্লিক করলে
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

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t("Exams & Results", "এক্সাম ও রেজাল্ট")}</h1>
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

      {exams.length === 0 ? (
        <div className="exam-list">
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            {t("No exams created yet.", "এখনো কোনো এক্সাম তৈরি করা হয়নি।")}
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
                    <button 
                      onClick={() => handleEditClick(exam)}
                      style={{ background: 'none', fontSize: '1.2rem', marginRight: '10px', cursor: 'pointer' }}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(exam._id)}
                      style={{ background: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
                      title="Delete"
                    >
                      🗑️
                    </button>
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

              {/* এডিটের সময় স্টুডেন্ট বা প্রশ্ন ব্যাংক পরিবর্তন করা যাবে না */}
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
    </div>
  );
};

export default TeacherExam;