import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Students.css'; 

const ProfileSettings = () => {
  const { user, logout } = useAuth(); 
  const { t } = useApp();
  const navigate = useNavigate(); 

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await api.put('/auth/profile', profileData);
      toast.success(t("Profile updated successfully!", "প্রোফাইল আপডেট হয়েছে!"));
      
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (currentUser) {
        currentUser.name = res.data.user.name;
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
      window.location.reload(); 
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error(t("Passwords do not match", "পাসওয়ার্ড মিলেনি"));
    }
    
    setIsUpdatingPassword(true);
    try {
      await api.put('/auth/password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      toast.success(t("Password updated successfully!", "পাসওয়ার্ড আপডেট হয়েছে!"));
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t("Profile Settings", "প্রোফাইল সেটিংস")}</h1>
      </div>

      {/* 👈 এখানে settings-grid ব্যবহার করা হলো */}
      <div className="settings-grid">
        {/* Update Profile Form */}
        <div className="ai-panel">
          <h2>👤 {t("Update Profile", "প্রোফাইল আপডেট করুন")}</h2>
          <form onSubmit={handleProfileUpdate} style={{ marginTop: '1.5rem' }}>
            <div className="form-group">
              <label>{t("Full Name", "পুরো নাম")}</label>
              <input 
                type="text" 
                value={profileData.name} 
                onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>{t("Email (Cannot be changed)", "ইমেইল (পরিবর্তন করা যাবে না)")}</label>
              <input type="email" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
            </div>

            <div className="form-group">
              <label>{t("Phone Number", "ফোন নাম্বার")}</label>
              <input 
                type="text" 
                value={profileData.phone} 
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})} 
              />
            </div>

            <button type="submit" className="auth-btn" disabled={isUpdatingProfile}>
              {isUpdatingProfile ? t("Updating...", "আপডেট হচ্ছে...") : t("Update Profile", "প্রোফাইল আপডেট")}
            </button>
          </form>
        </div>

        {/* Update Password Form */}
        <div className="ai-panel">
          <h2>🔒 {t("Change Password", "পাসওয়ার্ড পরিবর্তন")}</h2>
          <form onSubmit={handlePasswordUpdate} style={{ marginTop: '1.5rem' }}>
            <div className="form-group">
              <label>{t("Current Password", "বর্তমান পাসওয়ার্ড")}</label>
              <input 
                type="password" 
                value={passwordData.oldPassword} 
                onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})} 
                required 
              />
            </div>

            <div className="form-group">
              <label>{t("New Password", "নতুন পাসওয়ার্ড")}</label>
              <input 
                type="password" 
                value={passwordData.newPassword} 
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} 
                required 
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label>{t("Confirm New Password", "নতুন পাসওয়ার্ড নিশ্চিত করুন")}</label>
              <input 
                type="password" 
                value={passwordData.confirmPassword} 
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                required 
                minLength="6"
              />
            </div>

            <button type="submit" className="auth-btn" style={{ backgroundColor: 'var(--secondary)' }} disabled={isUpdatingPassword}>
              {isUpdatingPassword ? t("Updating...", "আপডেট হচ্ছে...") : t("Change Password", "পাসওয়ার্ড পরিবর্তন")}
            </button>
          </form>
        </div>
      </div>

      {/* Logout সেকশন */}
      <div className="dashboard-section" style={{ marginTop: '2rem', border: '1px solid var(--danger)' }}>
        <h2 className="section-title" style={{ color: 'var(--danger)' }}>⚠️ {t("Danger Zone", "সতর্কতা")}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          {t("Once you log out, you will need to enter your credentials to access your account.", "লগআউট করলে আবার ঢুকতে হলে আপনার ইমেইল ও পাসওয়ার্ড দিতে হবে।")}
        </p>
        <button 
          onClick={handleLogout}
          style={{ 
            backgroundColor: 'var(--danger)', 
            color: 'white', 
            padding: '0.8rem 2rem', 
            borderRadius: '8px', 
            fontWeight: 'bold', 
            border: 'none', 
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          🚪 {t("Logout Now", "লগআউট করুন")}
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;