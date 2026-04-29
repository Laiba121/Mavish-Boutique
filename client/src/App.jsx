import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectUser } from './store/authSlice';

// Pages
import Home from "./pages/Home";
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Dashboard from './pages/admin/Dashboard';

// ✅ Import ProtectedRoute
import ProtectedRoute from './components/ProtectedRoutes';

export default function App() {
  const user = useSelector(selectUser);

  return (
    <>
      <Toaster position="top-center" />

      <Routes>

        {/* ROOT */}
        <Route
          path="/"
          element={
            user?.role === 'admin'
              ? <Navigate to="/admin/dashboard" replace />
              : <Home />
          }
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            user
              ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/'} replace />
              : <LoginPage />
          }
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={
            user
              ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/'} replace />
              : <RegisterPage />
          }
        />

        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* redirect /admin */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />

      </Routes>
    </>
  );
}