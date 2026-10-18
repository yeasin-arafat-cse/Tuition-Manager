import { useState, useEffect } from 'react';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Students.css';

const StudentPayment = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useApp();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/payments/my-payments');
        setPayments(res.data.payments);
      } catch (error) {
        toast.error('Failed to load payments');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{t("My Payments", "আমার পেমেন্ট")}</h1>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{t("Month/Year", "মাস/বছর")}</th>
              <th>{t("Amount", "টাকার পরিমাণ")}</th>
              <th>{t("Method", "মাধ্যম")}</th>
              <th>{t("Status", "স্ট্যাটাস")}</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                  {t("No payment records found", "কোনো পেমেন্টের রেকর্ড নেই")}
                </td>
              </tr>
            ) : (
              payments.map((pay) => (
                <tr key={pay._id}>
                  <td>{pay.month} {pay.year}</td>
                  <td>৳ {pay.amount}</td>
                  <td style={{ textTransform: 'capitalize' }}>{pay.method}</td>
                  <td>
                    <span className={`badge ${pay.status === 'paid' ? 'paid' : 'due'}`}>
                      {pay.status === 'paid' ? t("Paid", "পরিশোধিত") : t("Due", "বাকি")}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentPayment;