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
import ProductDetail from './Pages/ProductDetail';
import ShopPage from './Pages/ShopPage';
import CategoryPage from './Pages/CategoryPage';
import SearchPage from './Pages/SearchPage';
import CartPage from './Pages/CartPage';
import CheckoutPage from './Pages/CheckoutPage';


// ✅ Import ProtectedRoute
import ProtectedRoute from './components/ProtectedRoutes';
import OrderConfirmationPage from './Pages/OrderConfirmationPage';
import OrderTrackingPage from './Pages/OrderTrackingPage';
import MyOrdersPage from './Pages/MyOrdersPage';
import AboutUs from './Pages/AboutUs';
import TermsOfService from './Pages/TermsOfService';
import PrivacyPolicy from './Pages/PrivacyPolicy';
import PaymentPage from './Pages/PaymentPage';
import ReturnAndExchange from './Pages/ReturnAndExchange';
import FAQS from './Pages/FAQS';
import ContactUs from './Pages/ContactUs';
import ScrollToTop from './components/ScrollToTop';


export default function App() {
  const user = useSelector(selectUser);

  return (
    <>
      <Toaster position="top-center" />
      <ScrollToTop />

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


        <Route path="/sale" element={<ShopPage />} />
        <Route path="/whats-new" element={<ShopPage />} />
        <Route path="/boys" element={<ShopPage />} />
        <Route path="/girls" element={<ShopPage />} />
        <Route path="/men" element={<ShopPage />} />
        <Route path="/women" element={<ShopPage />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/return-exchange" element={<ReturnAndExchange />} />
        <Route path="/faqs" element={<FAQS />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
        <Route path="/order-tracking" element={<OrderTrackingPage />}></Route>
        <Route path="/orders" element={<MyOrdersPage />}> </Route>
        

        {/* redirect /admin */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />

      </Routes>
    </>
  );
}