import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Students.css';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null); 
  
  const [classFilter, setClassFilter] = useState(''); 
  const { t } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    class: '',
    subject: '',
    guardianName: '',
    guardianPhone: '',
    monthlyFee: '',
    email: '',
    joinDate: new Date().toISOString().split('T')[0]
  });

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data.students);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent._id}`, formData);
        toast.success(t("Student Updated!", "স্টুডেন্ট আপডেট হয়েছে!"));
      } else {
        await api.post('/students', formData);
        toast.success(t("Student Added!", "স্টুডেন্ট যোগ হয়েছে!"));
      }
      setIsModalOpen(false);
      setEditingStudent(null);
      setFormData({ name: '', class: '', subject: '', guardianName: '', guardianPhone: '', monthlyFee: '', email: '', joinDate: new Date().toISOString().split('T')[0] });
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm(t("Are you sure?", "আপনি নিশ্চিত?"))) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success(t("Deleted!", "ডিলিট হয়েছে!"));
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      class: student.class,
      subject: student.subject,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      monthlyFee: student.monthlyFee,
      email: student.email,
      joinDate: new Date(student.joinDate).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

  const filteredStudents = classFilter 
    ? students.filter(s => s.class.toLowerCase().includes(classFilter.toLowerCase()))
    : students;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t("My Students", "আমার স্টুডেন্ট")}</h1>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder={t("Filter by Class (e.g. 10)", "ক্লাস দিয়ে খুঁজুন")}
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
          />
          <button 
            className="add-btn" 
            onClick={() => {
              setEditingStudent(null);
              setFormData({ name: '', class: '', subject: '', guardianName: '', guardianPhone: '', monthlyFee: '', email: '', joinDate: new Date().toISOString().split('T')[0] });
              setIsModalOpen(true);
            }}
          >
            + {t("Add Student", "স্টুডেন্ট যোগ করুন")}
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{t("Name", "নাম")}</th>
              <th>{t("Class", "ক্লাস")}</th>
              <th>{t("Subject", "বিষয়")}</th>
              <th>{t("Guardian", "অভিভাবক")}</th>
              <th>{t("Fee", "বেতন")}</th>
              <th>{t("Action", "অ্যাকশন")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>{t("No students found", "কোনো স্টুডেন্ট নেই")}</td></tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td 
                    onClick={() => navigate(`/teacher/students/${student._id}`)}
                    style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {student.name}
                  </td>
                  <td>{student.class}</td>
                  <td>{student.subject}</td>
                  <td>{student.guardianName} <br/><small>{student.guardianPhone}</small></td>
                  <td>Tk {student.monthlyFee}</td>
                  <td>
                    <button 
                      onClick={() => handleEditClick(student)}
                      style={{ color: 'var(--primary)', background: 'none', fontWeight: 'bold', marginRight: '10px' }}
                    >
                      {t("Edit", "এডিট")}
                    </button>
                    <button onClick={() => deleteStudent(student._id)} style={{ color: 'var(--danger)', background: 'none', fontWeight: 'bold' }}>
                      {t("Delete", "ডিলিট")}
                    </button>
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
              <h2>{editingStudent ? t("Edit Student", "স্টুডেন্ট এডিট করুন") : t("Add New Student", "নতুন স্টুডেন্ট")}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>{t("Name", "নাম")}</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>{t("Class", "ক্লাস")}</label>
                  <input type="text" name="class" value={formData.class} onChange={handleChange} required />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>{t("Subject", "বিষয়")}</label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>{t("Monthly Fee", "মাসিক বেতন")}</label>
                  <input type="number" name="monthlyFee" value={formData.monthlyFee} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t("Guardian Name", "অভিভাবকের নাম")}</label>
                  <input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>{t("Guardian Phone", "অভিভাবকের ফোন")}</label>
                  <input type="text" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t("Join Date", "কবে থেকে পড়াচ্ছেন")}</label>
                  <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>{t("Student Email", "স্টুডেন্টের ইমেইল")}</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="student@mail.com" required disabled={editingStudent ? true : false} style={{ opacity: editingStudent ? 0.6 : 1 }} />
                </div>
              </div>

              <div className="btn-group">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                  {t("Cancel", "বাতিল")}
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? t("Saving...", "সেভ হচ্ছে...") : (editingStudent ? t("Update", "আপডেট") : t("Save", "সেভ করুন"))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;