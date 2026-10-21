import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Students.css';

const StudentMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredMaterials = materials.filter(mat => 
    mat.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    mat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title">{t("Study Materials", "স্টাডি মেটেরিয়াল")}</h1>
        
        <input 
          type="text" 
          placeholder={t("Search by title or note...", "টাইটেল বা নোট দিয়ে খুঁজুন...")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
        />
      </div>

      {filteredMaterials.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <h3>{t("No materials found.", "কোনো মেটেরিয়াল পাওয়া যায়নি।")}</h3>
        </div>
      ) : (
        <div className="dashboard-grid">
          {filteredMaterials.map((mat) => (
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