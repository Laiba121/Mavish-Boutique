import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectUser } from '../store/authSlice';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const user = useSelector(selectUser);

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Not admin but trying to access admin route
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}