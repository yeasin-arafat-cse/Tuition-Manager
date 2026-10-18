import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Students.css';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useApp();

  const fetchData = async () => {
    try {
      const [userRes, settingRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/settings')
      ]);
      setUsers(userRes.data.users);
      setSettings(settingRes.data.settings);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      toast.success(t("User status updated", "ইউজার স্ট্যাটাস আপডেট হয়েছে"));
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSettingChange = async (e) => {
    const { name, checked } = e.target;
    const newSettings = { ...settings, [name]: checked };
    setSettings(newSettings);

    try {
      await api.put('/admin/settings', { [name]: checked });
      toast.success(t("Settings updated", "সেটিংস আপডেট হয়েছে"));
    } catch (error) {
      toast.error('Failed to update settings');
      fetchData();
    }
  };

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

  // সার্চ ফিল্টার লজিক
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTeachers = users.filter(u => u.role === 'teacher').length;
  const totalStudents = users.filter(u => u.role === 'student').length;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t("Admin Panel", "অ্যাডমিন প্যানেল")}</h1>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="admin-card">
          <h3>{t("Total Users", "মোট ইউজার")}</h3>
          <h2>{users.length}</h2>
        </div>
        <div className="admin-card">
          <h3>{t("Teachers", "শিক্ষক")}</h3>
          <h2>{totalTeachers}</h2>
        </div>
        <div className="admin-card">
          <h3>{t("Students", "শিক্ষার্থী")}</h3>
          <h2>{totalStudents}</h2>
        </div>
      </div>

      {/* Settings */}
      <div className="dashboard-section" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title">{t("System Settings", "সিস্টেম সেটিংস")}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
          <label className="switch">
            <input 
              type="checkbox" 
              name="registrationOpen" 
              checked={settings?.registrationOpen || false} 
              onChange={handleSettingChange} 
            />
            <span className="slider"></span>
          </label>
          <span style={{ fontWeight: 500 }}>
            {t("Open Registration (Allow new users)", "রেজিস্ট্রেশন চালু করুন")}
          </span>
        </div>
      </div>

      {/* User List */}
      <div className="dashboard-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>{t("Manage Users", "ইউজার ম্যানেজমেন্ট")}</h2>
          
          {/* সার্চ ইনপুট */}
          <input 
            type="text" 
            placeholder={t("Search by name or email...", "নাম বা ইমেইল দিয়ে খুঁজুন...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              padding: '0.6rem 1rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              width: '250px'
            }}
          />
        </div>

        <div className="table-container" style={{ marginTop: '1rem' }}>
          <table>
            <thead>
              <tr>
                <th>{t("Name", "নাম")}</th>
                <th>{t("Role", "রোল")}</th>
                <th>{t("Status", "স্ট্যাটাস")}</th>
                <th>{t("Action", "অ্যাকশন")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    {t("No users found matching your search.", "আপনার সার্চের সাথে কোনো ইউজার মেলেনি।")}
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u._id}>
                    <td>{u.name} <br/><small style={{ color: 'var(--text-muted)' }}>{u.email}</small></td>
                    <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                    <td>
                      <span className={`badge ${u.status === 'approved' ? 'paid' : 'due'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      {u.role !== 'admin' && (
                        <>
                          {u.status === 'approved' ? (
                            <button 
                              onClick={() => handleStatusChange(u._id, 'blocked')}
                              style={{ background: 'none', color: 'var(--danger)', fontWeight: 'bold' }}
                            >
                              {t("Block", "ব্লক")}
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleStatusChange(u._id, 'approved')}
                              style={{ background: 'none', color: 'var(--secondary)', fontWeight: 'bold' }}
                            >
                              {t("Approve", "অ্যাপ্রুভ")}
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;