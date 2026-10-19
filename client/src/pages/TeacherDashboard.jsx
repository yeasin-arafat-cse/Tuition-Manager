import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext'; 
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const getLocalDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const TeacherDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartRange, setChartRange] = useState('6months');
  const [todayDate, setTodayDate] = useState(getLocalDateString()); // 👈 তারিখ স্টেট
  
  const { t } = useApp();
  const { user } = useAuth(); 

  const fetchDashboard = async (range) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/dashboard/teacher?range=${range}`);
      setData(res.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(chartRange);
  }, [chartRange]);

  if (isLoading && !data) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
  if (!data) return <div>Error loading data</div>;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '10px', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <p style={{ fontWeight: 'bold' }}>{label}</p>
          <p style={{ color: 'var(--primary)' }}>Tk {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>
            {greeting}, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <h1 className="page-title" style={{ fontSize: '2rem', marginTop: '0.2rem' }}>
            {t("Dashboard Overview", "ড্যাশবোর্ড ওভারভিউ")}
          </h1>
          {/* 👈 নতুন: আজকের তারিখ */}
          <p style={{ color: 'var(--primary)', fontWeight: '600', marginTop: '0.2rem' }}>
            {t("Today's Date:", "আজকের তারিখ:")} {todayDate}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon primary">👨‍🎓</div>
          <div className="stat-info">
            <h3>{t("Total Students", "মোট স্টুডেন্ট")}</h3>
            <h2>{data.totalStudents}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">💰</div>
          <div className="stat-info">
            <h3>{t("Total Due", "মোট বাকি টাকা")}</h3>
            <h2>Tk {data.totalDue}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">📝</div>
          <div className="stat-info">
            <h3>{t("Total Exams", "মোট এক্সাম")}</h3>
            <h2>{data.totalExams}</h2>
          </div>
        </div>
      </div>

      {/* চার্ট সেকশন */}
      <div className="dashboard-section" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>📈 {t("Income Overview", "আয়ের হিসাব")}</h2>
          
          <select 
            value={chartRange} 
            onChange={(e) => setChartRange(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: '500' }}
          >
            <option value="1month">{t("This Month", "এই মাস")}</option>
            <option value="6months">{t("Last 6 Months", "গত ৬ মাস")}</option>
            <option value="1year">{t("Last 1 Year", "গত ১ বছর")}</option>
          </select>
        </div>

        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={data.incomeChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} />
              <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }} />
              <Bar dataKey="income" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={chartRange === '1year' ? 20 : 40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="dashboard-section">
        <h2 className="section-title">
          <span style={{ fontSize: '1.4rem' }}>📅</span> {t("Today's Classes", "আজকের ক্লাস")}
        </h2>
        
        {data.todaySchedules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☕</div>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>{t("No classes today!", "আজ কোনো ক্লাস নেই!")}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{t("Enjoy your free time.", "আপনার ফ্রি টাইম উপভোগ করুন।")}</p>
          </div>
        ) : (
          <div>
            {data.todaySchedules.map((schedule) => (
              <div key={schedule._id} className="schedule-item-dash">
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{schedule.student?.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{schedule.subject}</p>
                </div>
                <div className="time">
                  {schedule.time}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;