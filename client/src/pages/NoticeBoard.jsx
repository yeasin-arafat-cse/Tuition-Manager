import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Students.css'; 

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [students, setStudents] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', message: '', studentId: '' }); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useApp();

  const fetchData = async () => {
    try {
      const [noticeRes, studentRes] = await Promise.all([
        api.get('/notices'),
        api.get('/students')
      ]);
      setNotices(noticeRes.data.notices);
      setStudents(studentRes.data.students);
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
      await api.post('/notices', formData);
      toast.success(t("Notice published!", "নোটিশ প্রকাশিত হয়েছে!"));
      setFormData({ title: '', message: '', studentId: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to publish notice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("Delete this notice?", "এই নোটিশটি ডিলিট করবেন?"))) return;
    try {
      await api.delete(`/notices/${id}`);
      toast.success(t("Deleted!", "ডিলিট হয়েছে!"));
      fetchData();
    } catch (error) {
      toast.error('Failed to delete notice');
    }
  };

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t("Notice Board", "নোটিশ বোর্ড")}</h1>
      </div>

      {/* 👈 এখানে notice-grid ক্লাস ব্যবহার করা হলো */}
      <div className="notice-grid">
        <div className="dashboard-section">
          <h2 className="section-title">📢 {t("Publish Notice", "নতুন নোটিশ")}</h2>
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div className="form-group">
              <label>{t("Send To", "কাকে পাঠাবেন")}</label>
              <select 
                value={formData.studentId} 
                onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
              >
                <option value="">{t("All Students", "সব স্টুডেন্ট")}</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.class})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t("Title", "শিরোনাম")}</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>{t("Message", "বার্তা")}</label>
              <textarea 
                rows="4"
                value={formData.message} 
                onChange={(e) => setFormData({...formData, message: e.target.value})} 
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                required 
              />
            </div>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? t("Publishing...", "প্রকাশ হচ্ছে...") : t("Publish Notice", "নোটিশ দিন")}
            </button>
          </form>
        </div>

        <div className="dashboard-section">
          <h2 className="section-title">📌 {t("Recent Notices", "সাম্প্রতিক নোটিশ")}</h2>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notices.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>{t("No notices yet.", "এখনো কোনো নোটিশ নেই।")}</p>
            ) : (
              notices.map(notice => (
                <div key={notice._id} style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>{notice.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        {notice.student ? `${t("To:", "প্রাপক:")} ${notice.student.name}` : t("To: All Students", "প্রাপক: সব স্টুডেন্ট")} | {new Date(notice.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDelete(notice._id)}
                      style={{ color: 'var(--danger)', background: 'none', fontWeight: 'bold', fontSize: '0.85rem' }}
                    >
                      {t("Delete", "ডিলিট")}
                    </button>
                  </div>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{notice.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeBoard;