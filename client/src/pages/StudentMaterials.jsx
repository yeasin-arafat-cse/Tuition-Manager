import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Students.css';

const StudentMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useApp();

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await api.get('/materials/student');
        setMaterials(res.data.materials);
      } catch (error) {
        toast.error('Failed to load materials');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t("Study Materials", "স্টাডি মেটেরিয়াল")}</h1>
      </div>

      {materials.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <h3>{t("No materials shared yet.", "এখনো কোনো মেটেরিয়াল শেয়ার করা হয়নি।")}</h3>
        </div>
      ) : (
        <div className="dashboard-grid">
          {materials.map((mat) => (
            <div key={mat._id} className="dashboard-section" style={{ padding: '1.5rem' }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{mat.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {new Date(mat.createdAt).toLocaleDateString()}
              </p>
              
              {mat.description && (
                <p style={{ marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>{mat.description}</p>
              )}

              {mat.imageUrl && (
                <img 
                  src={mat.imageUrl} 
                  alt={mat.title} 
                  style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }} 
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentMaterials;