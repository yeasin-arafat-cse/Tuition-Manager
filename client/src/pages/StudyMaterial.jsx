import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Students.css'; 

const StudyMaterial = () => {
  const [materials, setMaterials] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const { t } = useApp();

  const [formData, setFormData] = useState({
    studentId: '',
    title: '',
    description: '',
    imageUrl: '' 
  });

  const fetchData = async () => {
    try {
      const [materialRes, studentRes] = await Promise.all([
        api.get('/materials/teacher'),
        api.get('/students')
      ]);
      setMaterials(materialRes.data.materials);
      setStudents(studentRes.data.students);
      if (studentRes.data.students.length > 0 && !formData.studentId) {
        setFormData(prev => ({ ...prev, studentId: studentRes.data.students[0]._id }));
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        return toast.error("Image must be less than 5MB");
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      data.append('studentId', formData.studentId);
      data.append('title', formData.title);
      data.append('description', formData.description);
      
      if (imageFile) {
        data.append('imageFile', imageFile); 
      }

      if (editingMaterial) {
        await api.put(`/materials/${editingMaterial._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success(t("Material Updated!", "মেটেরিয়াল আপডেট হয়েছে!"));
      } else {
        await api.post('/materials', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success(t("Material Sent!", "মেটেরিয়াল পাঠানো হয়েছে!"));
      }
      
      setIsModalOpen(false);
      setEditingMaterial(null);
      setFormData({ studentId: students[0]?._id || '', title: '', description: '', imageUrl: '' });
      setImageFile(null);
      setImagePreview('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("Delete this material?", "এই মেটেরিয়ালটি ডিলিট করবেন?"))) return;
    try {
      await api.delete(`/materials/${id}`);
      toast.success(t("Deleted!", "ডিলিট হয়েছে!"));
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleEditClick = (material) => {
    setEditingMaterial(material);
    setFormData({
      studentId: material.student._id,
      title: material.title,
      description: material.description || '',
      imageUrl: material.imageUrl || ''
    });
    setImagePreview(material.imageUrl || '');
    setImageFile(null);
    setIsModalOpen(true);
  };

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t("Study Materials", "স্টাডি মেটেরিয়াল")}</h1>
        <button className="add-btn" onClick={() => { setEditingMaterial(null); setImagePreview(''); setImageFile(null); setIsModalOpen(true); }}>
          + {t("Add Material", "মেটেরিয়াল যোগ করুন")}
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{t("Student", "স্টুডেন্ট")}</th>
              <th>{t("Title", "শিরোনাম")}</th>
              <th>{t("Date", "তারিখ")}</th>
              <th>{t("Action", "অ্যাকশন")}</th>
            </tr>
          </thead>
          <tbody>
            {materials.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No materials yet.</td></tr>
            ) : (
              materials.map((mat) => (
                <tr key={mat._id}>
                  <td>{mat.student?.name}</td>
                  <td>{mat.title}</td>
                  <td>{new Date(mat.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleEditClick(mat)} style={{ color: 'var(--primary)', background: 'none', fontWeight: 'bold', marginRight: '10px' }}>{t("Edit", "এডিট")}</button>
                    <button onClick={() => handleDelete(mat._id)} style={{ color: 'var(--danger)', background: 'none', fontWeight: 'bold' }}>{t("Delete", "ডিলিট")}</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingMaterial ? t("Edit Material", "এডিট করুন") : t("Add Material", "নতুন মেটেরিয়াল")}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t("Select Student", "স্টুডেন্ট সিলেক্ট করুন")}</label>
                <select name="studentId" value={formData.studentId} onChange={handleChange} required disabled={editingMaterial ? true : false}>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>{t("Title", "শিরোনাম")}</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>{t("Description / Note", "বিবরণ / নোট")}</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
              </div>

              <div className="form-group">
                <label>{t("Upload Image (Max 5MB)", "ছবি আপলোড (সর্বোচ্চ ৫MB)")}</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                {(imagePreview || formData.imageUrl) && (
                  <img 
                    src={imagePreview || formData.imageUrl} 
                    alt="Preview" 
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', marginTop: '10px', borderRadius: '8px' }} 
                  />
                )}
              </div>

              <div className="btn-group">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>{t("Cancel", "বাতিল")}</button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? t("Saving...", "সেভ হচ্ছে...") : t("Save", "সেভ করুন")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyMaterial;