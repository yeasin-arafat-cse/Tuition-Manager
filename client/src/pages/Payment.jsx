import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Students.css';
import './Payment.css';

const Payment = () => {
  const [activeTab, setActiveTab] = useState('due');
  const [duePayments, setDuePayments] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStudentId, setFilterStudentId] = useState(''); 
  const { t } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [paymentData, setPaymentData] = useState({
    months: [new Date().toLocaleString('en-US', { month: 'long' })], 
    year: new Date().getFullYear(),
    amount: '',
    method: 'cash'
  });

  const allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/students');
        setAllStudents(res.data.students);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStudents();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'due') {
        const res = await api.get(`/payments/due${filterStudentId ? `?studentId=${filterStudentId}` : ''}`);
        setDuePayments(res.data.duePayments);
      } 
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, filterStudentId]); 

  const openPayModal = (studentData) => {
    setSelectedStudent(studentData);
    const studentInfo = studentData.student || studentData; 
    
    setPaymentData({
      months: [studentData.month || new Date().toLocaleString('en-US', { month: 'long' })], 
      year: studentData.year || new Date().getFullYear(),
      amount: studentInfo.monthlyFee || 0,
      method: 'cash'
    });
    setIsModalOpen(true);
  };

  const handleMonthToggle = (month) => {
    setPaymentData(prev => {
      const isSelected = prev.months.includes(month);
      if (isSelected) {
        if (prev.months.length === 1) return prev;
        return { ...prev, months: prev.months.filter(m => m !== month) };
      } else {
        return { ...prev, months: [...prev.months, month] };
      }
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const studentId = selectedStudent.student ? selectedStudent.student._id : selectedStudent._id;
      await api.post('/payments', {
        studentId: studentId,
        months: paymentData.months,
        year: paymentData.year,
        amount: paymentData.amount,
        method: paymentData.method
      });
      toast.success(t("Payment Successful!", "পেমেন্ট সফল হয়েছে!"));
      setIsModalOpen(false);
      fetchData(); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t("Payments", "পেমেন্ট সমূহ")}</h1>
      </div>

      <div className="payment-tabs">
        <button 
          className={`tab-btn ${activeTab === 'due' ? 'active' : ''}`}
          onClick={() => setActiveTab('due')}
        >
          {t("Due Payments", "বাকি পেমেন্ট")}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          {t("All Students", "সব স্টুডেন্ট")}
        </button>
      </div>

      {activeTab === 'due' && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontWeight: '600' }}>{t("Filter by Student:", "স্টুডেন্ট দিয়ে খুঁজুন:")}</label>
          <select 
            value={filterStudentId} 
            onChange={(e) => setFilterStudentId(e.target.value)}
            style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', minWidth: '200px' }}
          >
            <option value="">{t("All Students", "সব স্টুডেন্ট")}</option>
            {allStudents.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t("Student Name", "স্টুডেন্টের নাম")}</th>
                <th>{t("Class", "ক্লাস")}</th>
                <th>{t("Month/Year", "মাস/বছর")}</th>
                <th>{t("Amount", "টাকার পরিমাণ")}</th>
                <th>{t("Status", "স্ট্যাটাস")}</th>
                <th>{t("Action", "অ্যাকশন")}</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'due' && (
                duePayments.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>{t("No due payments found!", "কোনো বাকি পেমেন্ট নেই!")}</td></tr>
                ) : (
                  duePayments.map((pay) => (
                    <tr key={pay._id}>
                      <td>{pay.student?.name}</td>
                      <td>{pay.student?.class}</td>
                      <td>{pay.month} {pay.year}</td>
                      <td>৳ {pay.amount}</td>
                      <td><span className="badge due">{t("Due", "বাকি")}</span></td>
                      <td>
                        <button className="pay-btn" onClick={() => openPayModal(pay)}>
                          {t("Pay Now", "পেমেন্ট করুন")}
                        </button>
                      </td>
                    </tr>
                  ))
                )
              )}

              {activeTab === 'all' && (
                allStudents.map((student) => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.class}</td>
                    <td>-</td>
                    <td>৳ {student.monthlyFee}</td>
                    <td><span className="badge paid">{t("Active", "সক্রিয়")}</span></td>
                    <td>
                      <button className="pay-btn" onClick={() => openPayModal(student)}>
                        {t("Collect Fee", "ফি নিন")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Modal */}
      {isModalOpen && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{t("Collect Payment", "পেমেন্ট নিন")}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
              {t("Student", "স্টুডেন্ট")}: <strong>{selectedStudent.name || selectedStudent.student?.name}</strong>
            </p>

            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>{t("Select Months (Click to toggle)", "মাস সিলেক্ট করুন (একাধিক নিতে পারেন)")}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', marginTop: '0.5rem' }}>
                  {allMonths.map(m => (
                    <div 
                      key={m} 
                      onClick={() => handleMonthToggle(m)}
                      style={{
                        padding: '0.4rem',
                        textAlign: 'center',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        border: '1px solid var(--border)',
                        backgroundColor: paymentData.months.includes(m) ? 'var(--primary)' : 'var(--bg-main)',
                        color: paymentData.months.includes(m) ? 'white' : 'var(--text-main)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {m.slice(0, 3)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t("Year", "বছর")}</label>
                  <input type="number" value={paymentData.year} onChange={(e) => setPaymentData({...paymentData, year: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>{t("Amount per month (৳)", "প্রতি মাসের টাকা (৳)")}</label>
                  <input type="number" value={paymentData.amount} onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})} required />
                </div>
              </div>

              <div className="form-group">
                <label>{t("Method", "মাধ্যম")}</label>
                <select name="method" value={paymentData.method} onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}>
                  <option value="cash">{t("Cash", "ক্যাশ")}</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="bank">{t("Bank", "ব্যাংক")}</option>
                </select>
              </div>

              <div style={{ marginTop: '1rem', textAlign: 'center', fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.2rem' }}>
                {t("Total Amount:", "মোট টাকা:")} ৳ {paymentData.amount * paymentData.months.length}
              </div>

              <div className="btn-group">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                  {t("Cancel", "বাতিল")}
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? t("Processing...", "প্রসেস হচ্ছে...") : t("Confirm Payment", "পেমেন্ট নিশ্চিত করুন")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;