import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Students.css';

const StudentNotices = () => {
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useApp();

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await api.get('/notices/student');
        setNotices(res.data.notices);
      } catch (error) {
        toast.error('Failed to load notices');
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotices();
  }, []);

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t("Notice Board", "নোটিশ বোর্ড")}</h1>
      </div>

      {notices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <h3>{t("No notices found.", "কোনো নোটিশ পাওয়া যায়নি।")}</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notices.map(notice => (
            <div key={notice._id} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)', boxShadow: 'var(--shadow)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{notice.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {new Date(notice.createdAt).toLocaleString()}
              </p>
              <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>{notice.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentNotices;