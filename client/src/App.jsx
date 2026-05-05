import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectUser } from './store/authSlice';

// Pages
import Home from "./Pages/Home";
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';
import VerifyEmailPage from './Pages/VerifyEmailPage';
import ForgotPasswordPage from './Pages/ForgotPasswordPage';
import Dashboard from './Pages/admin/Dashboard';
import ProductsAdmin from './Pages/admin/ProductsAdmin';
import CategoriesAdmin from './Pages/admin/CategoriesAdmin';
import OrdersAdmin from './Pages/admin/OrdersAdmin';
import CustomersAdmin from './Pages/admin/CustomersAdmin';
import BannersAdmin from './Pages/admin/BannersAdmin'; 
import ContactsAdmin from './Pages/admin/ContactsAdmin';
import SettingsAdmin from './Pages/admin/SettingsAdmin';
import ProductDetail from './Pages/ProductDetail';
import ShopPage from './Pages/ShopPage';
import CategoryPage from './Pages/CategoryPage';
import SearchPage from './Pages/SearchPage';
import CartPage from './Pages/CartPage';
import CheckoutPage from './Pages/CheckoutPage';


// ✅ Import ProtectedRoute
import ProtectedRoute from './components/ProtectedRoutes';
import OrderConfirmationPage from './Pages/OrderConfirmationPage';

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

        <Route
          path="/admin/products"
          element={
            <ProtectedRoute adminOnly>
              <ProductsAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute adminOnly>
              <CategoriesAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute adminOnly>
              <OrdersAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/customers"
          element={
            <ProtectedRoute adminOnly>
              <CustomersAdmin />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin/banners"
          element={
            <ProtectedRoute adminOnly>
              <BannersAdmin />
            </ProtectedRoute>
          }
        />

      <Route
          path="/admin/contacts"
          element={
            <ProtectedRoute adminOnly>
              <ContactsAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute adminOnly>
              <SettingsAdmin />
            </ProtectedRoute>
          }
        />

        <Route path="/sale" element={<ShopPage />} />
        <Route path="/whats-new" element={<ShopPage />} />
        <Route path="/boys" element={<ShopPage />} />
        <Route path="/girls" element={<ShopPage />} />
        <Route path="/men" element={<ShopPage />} />
        <Route path="/women" element={<ShopPage />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
        

        {/* redirect /admin */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />

      </Routes>
    </>
  );
}