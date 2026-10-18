import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  // যদি লগইন না থাকে, লগইন পেজে পাঠাবে
  if (!user) return <Navigate to="/login" />;

  // যদি নির্দিষ্ট রোল না থাকে, তবে হোমে পাঠাবে
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;