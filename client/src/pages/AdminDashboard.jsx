import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Students.css';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useApp();

  // সার্চ এবং ফিল্টার
  const [searchTerm, setSearchTerm] = useState('');
  
  // ইউজার ডিটেইলস মডাল
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // গ্লোবাল নোটিশ ফর্ম
  const [noticeData, setNoticeData] = useState({ title: '', message: '' });
  const [isSendingNotice, setIsSendingNotice] = useState(false);

  const fetchData = async () => {
    try {
      const [userRes, settingRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/settings'),
        api.get('/admin/stats')
      ]);
      setUsers(userRes.data.users);
      setSettings(settingRes.data.settings);
      setStats(statsRes.data.data);
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

  const handleSendGlobalNotice = async (e) => {
    e.preventDefault();
    setIsSendingNotice(true);
    try {
      await api.post('/admin/global-notice', noticeData);
      toast.success(t("Global notice sent!", "সবাইকে নোটিশ পাঠানো হয়েছে!"));
      setNoticeData({ title: '', message: '' });
    } catch (error) {
      toast.error('Failed to send notice');
    } finally {
      setIsSendingNotice(false);
    }
  };

  const openUserDetails = (user) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

  // সার্চ ফিল্টার
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t("Admin Panel", "অ্যাডমিন প্যানেল")}</h1>
      </div>

      {/* ১. অ্যাডভান্সড স্ট্যাটস কার্ড */}
      {stats && (
        <div className="admin-stats-grid">
          <div className="admin-card">
            <h3>{t("Total Teachers", "মোট শিক্ষক")}</h3>
            <h2>{stats.totalTeachers}</h2>
          </div>
          <div className="admin-card">
            <h3>{t("Total Students", "মোট শিক্ষার্থী")}</h3>
            <h2>{stats.totalStudents}</h2>
          </div>
          <div className="admin-card">
            <h3>{t("Total Guardians", "মোট অভিভাবক")}</h3>
            <h2>{stats.totalGuardians}</h2>
          </div>
          <div className="admin-card">
            <h3>{t("Total Exams", "মোট এক্সাম")}</h3>
            <h2>{stats.totalExams}</h2>
          </div>
          <div className="admin-card">
            <h3>{t("Study Materials", "স্টাডি মেটেরিয়াল")}</h3>
            <h2>{stats.totalMaterials}</h2>
          </div>
        </div>
      )}

      <div className="admin-grid-layout">
        {/* বাম দিকের কলাম: সেটিংস ও নোটিশ */}
        <div>
          {/* সিস্টেম সেটিংস */}
          <div className="dashboard-section" style={{ marginBottom: '1.5rem' }}>
            <h2 className="section-title">{t("System Settings", "সিস্টেম সেটিংস")}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    name="registrationOpen" 
                    checked={settings?.registrationOpen || false} 
                    onChange={handleSettingChange} 
                  />
                  <span className="slider"></span>
                </label>
                <span style={{ fontWeight: 500 }}>{t("Open Registration", "রেজিস্ট্রেশন চালু")}</span>
              </div>

              {/* ৫. মনিটাইজেশন টগল */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    name="isMonetizationEnabled" 
                    checked={settings?.isMonetizationEnabled || false} 
                    onChange={handleSettingChange} 
                  />
                  <span className="slider"></span>
                </label>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{t("Enable Teacher Subscription", "টিচার সাবস্ক্রিপশন চালু")}</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>টিচারদের অ্যাকাউন্ট অ্যাক্টিভ করতে ৳{settings?.subscriptionFee} দিতে হবে।</p>
                </div>
              </div>
            </div>
          </div>

          {/* ৩. গ্লোবাল নোটিশ */}
          <div className="dashboard-section">
            <h2 className="section-title">{t("Send Global Notice", "গ্লোবাল নোটিশ পাঠান")}</h2>
            <form onSubmit={handleSendGlobalNotice} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder={t("Notice Title", "নোটিশের শিরোনাম")}
                  value={noticeData.title} 
                  onChange={(e) => setNoticeData({...noticeData, title: e.target.value})} 
                  required 
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                />
              </div>
              <div className="form-group">
                <textarea 
                  rows="3"
                  placeholder={t("Message", "বার্তা")}
                  value={noticeData.message} 
                  onChange={(e) => setNoticeData({...noticeData, message: e.target.value})} 
                  required 
                  style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                />
              </div>
              <button type="submit" className="btn-submit" disabled={isSendingNotice}>
                {isSendingNotice ? t("Sending...", "পাঠানো হচ্ছে...") : t("Send to All Users", "সবাইকে পাঠান")}
              </button>
            </form>
          </div>
        </div>

        {/* ডান দিকের কলাম: ইউজার ম্যানেজমেন্ট */}
        <div className="dashboard-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>{t("Manage Users", "ইউজার ম্যানেজমেন্ট")}</h2>
            
            <input 
              type="text" 
              placeholder={t("Search...", "খুঁজুন...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '200px' }}
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
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No users found</td></tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u._id}>
                      <td>
                        <button onClick={() => openUserDetails(u)} style={{ background: 'none', color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>
                          {u.name}
                        </button>
                        <br/><small style={{ color: 'var(--text-muted)' }}>{u.email}</small>
                      </td>
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
                              <button onClick={() => handleStatusChange(u._id, 'blocked')} style={{ background: 'none', color: 'var(--danger)', fontWeight: 'bold' }}>Block</button>
                            ) : (
                              <button onClick={() => handleStatusChange(u._id, 'approved')} style={{ background: 'none', color: 'var(--secondary)', fontWeight: 'bold' }}>Approve</button>
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

      {/* ২. ইউজার ডিটেইলস মডাল */}
      {isUserModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedUser.name}</h2>
              <button className="close-btn" onClick={() => setIsUserModalOpen(false)}>×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <p><strong>{t("Email:", "ইমেইল:")}</strong> {selectedUser.email}</p>
              <p><strong>{t("Phone:", "ফোন:")}</strong> {selectedUser.phone || 'N/A'}</p>
              <p><strong>{t("Role:", "রোল:")}</strong> {selectedUser.role}</p>
              <p><strong>{t("Status:", "স্ট্যাটাস:")}</strong> {selectedUser.status}</p>
              <p><strong>{t("Joined:", "জয়েন ডেট:")}</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
            </div>

            <button className="btn-submit" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => setIsUserModalOpen(false)}>
              {t("Close", "বন্ধ করুন")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;