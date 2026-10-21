import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, toggleLanguage, t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    if (user?.role === 'teacher') {
      return [
        { name: t("Dashboard", "ড্যাশবোর্ড"), path: '/teacher/dashboard', icon: '📊' },
        { name: t("Students", "স্টুডেন্ট"), path: '/teacher/students', icon: '👨‍🎓' },
        { name: t("Study Materials", "স্টাডি মেটেরিয়াল"), path: '/teacher/materials', icon: '📚' }, // 👈 নতুন মেনু
        { name: t("Schedule", "রুটিন"), path: '/teacher/schedule', icon: '📅' },
        { name: t("Attendance", "হাজিরা"), path: '/teacher/attendance', icon: '✅' },
        { name: t("Payments", "পেমেন্ট"), path: '/teacher/payments', icon: '💰' },
        { name: t("AI MCQ", "এআই প্রশ্ন"), path: '/teacher/ai-mcq', icon: '🤖' },
        { name: t("Question Bank", "প্রশ্ন ব্যাংক"), path: '/teacher/question-bank', icon: '📝' },
        { name: t("Exams", "এক্সাম"), path: '/teacher/exams', icon: '📋' },
        { name: t("Notice Board", "নোটিশ বোর্ড"), path: '/teacher/notices', icon: '📢' },
        { name: t("Settings", "সেটিংস"), path: '/settings', icon: '⚙️' },
      ];
    }
    if (user?.role === 'student') {
      return [
        { name: t("Dashboard", "ড্যাশবোর্ড"), path: '/student/dashboard', icon: '📊' },
        { name: t("My Profile", "আমার প্রোফাইল"), path: '/student/profile', icon: '👤' },
        { name: t("Study Materials", "স্টাডি মেটেরিয়াল"), path: '/student/materials', icon: '📚' },
        { name: t("Notice Board", "নোটিশ বোর্ড"), path: '/student/notices', icon: '📢' },
        { name: t("My Routine", "আমার রুটিন"), path: '/student/schedule', icon: '📅' },
        { name: t("My Exams", "আমার এক্সাম"), path: '/student/exams', icon: '📝' },
        { name: t("Attendance", "উপস্থিতি"), path: '/student/attendance', icon: '✅' },
        { name: t("Payments", "পেমেন্ট"), path: '/student/payments', icon: '💰' },
        { name: t("Settings", "সেটিংস"), path: '/settings', icon: '⚙️' },
      ];
    }
    if (user?.role === 'guardian') {
      return [
        { name: t("Dashboard", "ড্যাশবোর্ড"), path: '/guardian/dashboard', icon: '📊' },
        { name: t("Settings", "সেটিংস"), path: '/settings', icon: '⚙️' },
      ];
    }
    if (user?.role === 'admin') {
      return [
        { name: t("Admin Panel", "অ্যাডমিন প্যানেল"), path: '/admin/dashboard', icon: '👑' },
        { name: t("Settings", "সেটিংস"), path: '/settings', icon: '⚙️' },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  return (
    <div className="layout-container">
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img 
            src="/pwa-192x192.png" 
            alt="TM Logo" 
            style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} 
          /> 
          Tuition Manager
        </div>
        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <div
              key={item.path}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => {
                navigate(item.path);
                setIsSidebarOpen(false);
              }}
            >
              <span className="menu-icon">{item.icon}</span>
              {item.name}
            </div>
          ))}
        </div>
      </div>

      <div className="main-content">
        <div className="navbar">
          <div className="navbar-left">
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              ☰
            </button>
            <div className="user-profile">
              <span>{user?.name}</span>
              <span className="user-role-badge">{user?.role}</span>
            </div>
          </div>

          <div className="navbar-actions">
            <button className="icon-btn ripple-btn" onClick={toggleTheme} title="Toggle Theme">
              <span className="spin-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
            </button>
            <button className="icon-btn ripple-btn" onClick={toggleLanguage} title="Change Language">
              {t("BN", "EN")}
            </button>
          </div>
        </div>

        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;