import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import {
  loginUser,
  googleLogin,
  selectUser,
  selectAuthLoading,
  selectAuthError,
  selectPendingUserId,
  clearMessages,
} from '../store/authSlice';

/* ── Google One‑Tap script loader ─────────────────────────────────────── */
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const GOOGLE_SCRIPT_ID = 'google-identity-script';

function initializeGoogleButton(buttonId, onCredential) {
  if (!window.google?.accounts?.id) return;

  if (!window.__googleIdentityInitialized) {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: onCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    window.__googleIdentityInitialized = true;
  }

  const button = document.getElementById(buttonId);
  if (button) {
    window.google.accounts.id.renderButton(button, {
      theme: 'outline',
      size: 'large',
      width: 320,
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
    });
  }
}

function useGoogleScript(onCredential) {
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const setup = () => initializeGoogleButton('google-btn-login', onCredential);
    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);

    if (window.google?.accounts?.id) {
      setup();
      return;
    }

    if (existingScript) {
      existingScript.addEventListener('load', setup);
      return () => existingScript.removeEventListener('load', setup);
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = setup;
    document.body.appendChild(script);

    return () => {
      if (!existingScript) document.body.removeChild(script);
    };
  }, [onCredential]);
}

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const pendingUserId = useSelector(selectPendingUserId);

  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [fieldErr, setFieldErr] = useState({});

  /* redirect on login */
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : from, { replace: true });
    }
  }, [user, navigate, from]);

  /* redirect to OTP verify if needed */
  useEffect(() => {
    if (pendingUserId && error?.includes('verify')) {
      navigate('/verify-email', { state: { userId: pendingUserId } });
    }
  }, [pendingUserId, error, navigate]);

  useEffect(() => () => dispatch(clearMessages()), [dispatch]);

  /* Google credential handler */
  const handleGoogleCredential = useCallback(
    ({ credential }) => dispatch(googleLogin({ credential })),
    [dispatch]
  );
  useGoogleScript(handleGoogleCredential);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password) errs.password = 'Password is required';
    setFieldErr(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(loginUser(form));
  };

  const change = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (fieldErr[k]) setFieldErr(f => ({ ...f, [k]: '' }));
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left decorative panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
        {/* layered background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=900&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-pink-50/60 to-purple-50" />

        {/* Decorative rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-pink-200/50 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] border border-purple-200/50 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] border border-pink-300/50 rounded-full" />

        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full border border-pink-300 flex items-center justify-center bg-white/50">
              <span className="text-pink-600 font-serif text-lg font-bold">M</span>
            </div>
            <span className="font-serif text-gray-800 text-xl tracking-widest">MAVISH</span>
          </Link>

          {/* Center content */}
          <div className="text-center">
            <div className="inline-block mb-6 px-4 py-1 border border-pink-200 rounded-full bg-white/30">
              <span className="text-pink-600 text-xs tracking-[4px] uppercase">Welcome Back</span>
            </div>
            <h2 className="font-serif text-4xl text-gray-800 leading-tight mb-4">
              Dress Your Little<br />Ones in Love
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
              Sign in to explore our exclusive curated collections crafted with care for every occasion.
            </p>
          </div>

          {/* Bottom quote */}
          <p className="text-gray-400 text-xs tracking-widest text-center uppercase">
            Mavish Boutique · Est. 2020
          </p>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-pink-300 flex items-center justify-center bg-white/50">
                <span className="text-pink-600 font-serif font-bold">M</span>
              </div>
              <span className="font-serif text-gray-800 text-lg tracking-widest">MAVISH</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="font-serif text-3xl text-gray-800 mb-1">Sign In</h1>
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-pink-600 font-medium hover:underline">
                Create one
              </Link>
            </p>
          </div>

          {/* Server error */}
          {error && !error.includes('verify') && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In */}
          <div className="mb-6">
            {GOOGLE_CLIENT_ID ? (
              <div id="google-btn-login" className="w-full" />
            ) : (
              <button
                type="button"
                disabled
                className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-white py-3 px-4 rounded text-sm text-gray-400 cursor-not-allowed"
              >
                <GoogleIcon />
                Google Sign-In (configure VITE_GOOGLE_CLIENT_ID)
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wide uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={change('email')}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded bg-white text-sm text-gray-800 placeholder-gray-400 outline-none transition-colors focus:border-pink-400 ${
                    fieldErr.email ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
              </div>
              {fieldErr.email && <p className="text-red-500 text-xs mt-1">{fieldErr.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wide uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={change('password')}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-11 py-3 border rounded bg-white text-sm text-gray-800 placeholder-gray-400 outline-none transition-colors focus:border-pink-400 ${
                    fieldErr.password ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErr.password && <p className="text-red-500 text-xs mt-1">{fieldErr.password}</p>}
            </div>

           

            {/* Submit */}
             <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded px-5 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-md transition-opacity duration-200 disabled:opacity-60 bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            
          </form>

          <p className="text-center text-xs text-gray-400 mt-8 leading-relaxed">
            By signing in you agree to our{' '}
            <Link to="/terms" className="underline hover:text-pink-600">Terms of Service</Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline hover:text-pink-600">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}