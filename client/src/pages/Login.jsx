import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { t, toggleTheme, toggleLanguage, theme } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await login(email, password);
      toast.success(t("Welcome back!", "স্বাগতম!"));
      
      // রোল অনুযায়ী রিডাইরেক্ট করা
      if (data.role === 'admin') navigate('/admin/dashboard');
      else if (data.role === 'teacher') navigate('/teacher/dashboard');
      else if (data.role === 'student') navigate('/student/dashboard');
      else if (data.role === 'guardian') navigate('/guardian/dashboard');
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-blob blob-1"></div>
      <div className="auth-blob blob-2"></div>
      {/* থিম ও ল্যাঙ্গুয়েজ বাটন (উপরে ডানদিকে রাখতে পারেন, আপাতত নিচে দিলাম) */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={toggleTheme} style={{ padding: '5px 10px', borderRadius: '5px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button onClick={toggleLanguage} style={{ padding: '5px 10px', borderRadius: '5px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
          {t("BN", "EN")}
        </button>
      </div>

      <div className="auth-card">
        <h2 className="auth-title">{t("Welcome Back", "আবার স্বাগতম")}</h2>
        <p className="auth-subtitle">{t("Login to your account", "আপনার অ্যাকাউন্টে লগইন করুন")}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t("Email", "ইমেইল")}</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="example@mail.com"
              required 
            />
          </div>

          <div className="form-group">
            <label>{t("Password", "পাসওয়ার্ড")}</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? t("Logging in...", "লগইন হচ্ছে...") : t("Login", "লগইন")}
          </button>
        </form>

        <div className="auth-link">
          {t("Don't have an account?", "অ্যাকাউন্ট নেই?")} 
          <span onClick={() => navigate('/register')}>{t("Register", "রেজিস্টার করুন")}</span>
        </div>
      </div>
    </div>
  );
};

export default Login;