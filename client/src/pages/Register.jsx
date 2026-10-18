import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher', // ডিফল্ট রোল
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { t, toggleTheme, toggleLanguage, theme } = useApp();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      localStorage.setItem("token", res.data.token);
      toast.success(t("Registration Successful!", "রেজিস্ট্রেশন সফল হয়েছে!"));
      
      // রোল অনুযায়ী রিডাইরেক্ট
      if (res.data.role === 'teacher') navigate('/teacher/dashboard');
      else if (res.data.role === 'student') navigate('/student/dashboard');
      else navigate('/');
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* 👈 নতুন: ব্যাকগ্রাউন্ড অ্যানিমেশন ব্লব */}
      <div className="auth-blob blob-1"></div>
      <div className="auth-blob blob-2"></div>
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={toggleTheme} style={{ padding: '5px 10px', borderRadius: '5px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button onClick={toggleLanguage} style={{ padding: '5px 10px', borderRadius: '5px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
          {t("BN", "EN")}
        </button>
      </div>

      <div className="auth-card">
        <h2 className="auth-title">{t("Create Account", "অ্যাকাউন্ট তৈরি করুন")}</h2>
        <p className="auth-subtitle">{t("Join Tuition Manager today", "আজই টিউশন ম্যানেজারে যোগ দিন")}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t("Full Name", "পুরো নাম")}</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>{t("Email", "ইমেইল")}</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>{t("Phone", "ফোন নাম্বার")}</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>{t("Role", "আপনি কী?")}</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="teacher">{t("Teacher", "শিক্ষক")}</option>
              <option value="student">{t("Student", "শিক্ষার্থী")}</option>
              <option value="guardian">{t("Guardian", "অভিভাবক")}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t("Password", "পাসওয়ার্ড")}</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" />
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? t("Creating...", "তৈরি হচ্ছে...") : t("Register", "রেজিস্টার")}
          </button>
        </form>

        <div className="auth-link">
          {t("Already have an account?", "ইতিমধ্যে অ্যাকাউন্ট আছে?")} 
          <span onClick={() => navigate('/login')}>{t("Login", "লগইন করুন")}</span>
        </div>
      </div>
    </div>
  );
};

export default Register;