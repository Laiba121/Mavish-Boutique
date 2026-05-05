import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle, Loader2, XCircle } from 'lucide-react';
import {
  registerUser,
  googleLogin,
  selectUser,
  selectAuthLoading,
  selectAuthError,
  selectAuthSuccess,
  selectPendingUserId,
  clearMessages,
} from '../store/authSlice';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const GOOGLE_SCRIPT_ID = 'google-identity-script';

function initializeGoogleButton(buttonId, onCredential) {
  if (!window.google?.accounts?.id) return;

  if (!window.__googleIdentityInitialized) {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: onCredential,
    });
    window.__googleIdentityInitialized = true;
  }

  const button = document.getElementById(buttonId);
  if (button) {
    window.google.accounts.id.renderButton(button, {
      theme: 'outline',
      size: 'large',
      width: '100%',
      text: 'signup_with',
      shape: 'rectangular',
    });
  }
}

function useGoogleScript(onCredential) {
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const setup = () => initializeGoogleButton('google-btn-register', onCredential);
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

/* Password strength checker */
const checks = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: '1 uppercase letter',    test: (p) => /[A-Z]/.test(p) },
  { label: '1 number',              test: (p) => /[0-9]/.test(p) },
  { label: '1 special character',   test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

function PasswordStrength({ password }) {
  if (!password) return null;
  const passed = checks.filter(c => c.test(password)).length;
  const color = passed <= 1 ? 'bg-red-400' : passed <= 2 ? 'bg-amber-400' : passed <= 3 ? 'bg-yellow-400' : 'bg-emerald-500';
  const label = ['', 'Weak', 'Fair', 'Good', 'Strong'][passed];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passed ? color : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${passed <= 1 ? 'text-red-500' : passed <= 2 ? 'text-amber-500' : passed <= 3 ? 'text-yellow-600' : 'text-emerald-600'}`}>
        {label}
      </p>
      <ul className="space-y-1">
        {checks.map(c => (
          <li key={c.label} className="flex items-center gap-1.5 text-xs">
            {c.test(password)
              ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              : <XCircle    className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
            <span className={c.test(password) ? 'text-emerald-600' : 'text-gray-400'}>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function RegisterPage() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const user       = useSelector(selectUser);
  const loading    = useSelector(selectAuthLoading);
  const error      = useSelector(selectAuthError);
  const success    = useSelector(selectAuthSuccess);
  const pendingId  = useSelector(selectPendingUserId);

  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [show, setShow]       = useState({ pw: false, c: false });
  const [fieldErr, setFieldErr] = useState({});

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  /* After register → go to OTP page */
  useEffect(() => {
    if (success && pendingId) {
      navigate('/verify-email', { state: { userId: pendingId, email: form.email } });
    }
  }, [success, pendingId, navigate, form.email]);

  useEffect(() => () => dispatch(clearMessages()), [dispatch]);

  const handleGoogleCredential = useCallback(
    ({ credential }) => dispatch(googleLogin({ credential })),
    [dispatch]
  );
  useGoogleScript(handleGoogleCredential);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    const allPassed = checks.every(c => c.test(form.password));
    if (!form.password) errs.password = 'Password is required';
    else if (!allPassed) errs.password = 'Password does not meet requirements';
    if (!form.confirm) errs.confirm = 'Please confirm your password';
    else if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    setFieldErr(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
  };

  const change = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (fieldErr[k]) setFieldErr(f => ({ ...f, [k]: '' }));
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ──────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=900&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-pink-50/60 to-purple-50" />

        {/* Corner flourishes */}
        <div className="absolute top-8 left-8 w-16 h-16 border-t border-l border-pink-200/50" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b border-r border-pink-200/50" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-pink-300 flex items-center justify-center bg-white/50">
              <span className="text-pink-600 font-serif text-base font-bold">M</span>
            </div>
            <span className="font-serif text-gray-800 text-lg tracking-[4px]">MAVISH</span>
          </Link>

          <div>
            <div className="w-12 h-px bg-pink-300 mb-6" />
            <h2 className="font-serif text-4xl text-gray-800 leading-snug mb-4">
              Join Our<br />Boutique Family
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Get exclusive access to new arrivals, Eid collections, and member-only discounts.
            </p>
            <ul className="mt-8 space-y-3">
              {['Exclusive early access to new drops', 'Save your wishlist & order history', 'Member-only sale prices'].map(item => (
                <li key={item} className="flex items-center gap-3 text-gray-500 text-sm">
                  <CheckCircle className="w-4 h-4 text-pink-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-gray-400 text-xs tracking-widest uppercase">
            Mavish Boutique · Gujranwala
          </p>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────── */}
      <div className="w-full lg:w-7/12 flex items-center justify-center bg-white px-6 py-10 overflow-y-auto">
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

          <div className="mb-7">
            <h1 className="font-serif text-3xl text-gray-800 mb-1">Create Account</h1>
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-pink-600 font-medium hover:underline">Sign in</Link>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠</span> <span>{error}</span>
            </div>
          )}

          {/* Google */}
          <div className="mb-5">
            {GOOGLE_CLIENT_ID ? (
              <div id="google-btn-register" className="w-full" />
            ) : (
              <button disabled className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-white py-3 px-4 rounded text-sm text-gray-400 cursor-not-allowed">
                <GoogleIcon /> Sign up with Google (configure VITE_GOOGLE_CLIENT_ID)
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wide uppercase">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={change('name')}
                  placeholder="Aisha Khan"
                  className={`w-full pl-10 pr-4 py-3 border rounded bg-white text-sm outline-none transition-colors focus:border-pink-400 ${fieldErr.name ? 'border-red-400' : 'border-gray-200'}`}
                />
              </div>
              {fieldErr.name && <p className="text-red-500 text-xs mt-1">{fieldErr.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wide uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={change('email')}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded bg-white text-sm outline-none transition-colors focus:border-pink-400 ${fieldErr.email ? 'border-red-400' : 'border-gray-200'}`}
                />
              </div>
              {fieldErr.email && <p className="text-red-500 text-xs mt-1">{fieldErr.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wide uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={show.pw ? 'text' : 'password'}
                  value={form.password}
                  onChange={change('password')}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-11 py-3 border rounded bg-white text-sm outline-none transition-colors focus:border-pink-400 ${fieldErr.password ? 'border-red-400' : 'border-gray-200'}`}
                />
                <button type="button" onClick={() => setShow(s => ({ ...s, pw: !s.pw }))} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show.pw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErr.password
                ? <p className="text-red-500 text-xs mt-1">{fieldErr.password}</p>
                : <PasswordStrength password={form.password} />
              }
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wide uppercase">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={show.c ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={change('confirm')}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-11 py-3 border rounded bg-white text-sm outline-none transition-colors focus:border-pink-400 ${fieldErr.confirm ? 'border-red-400' : 'border-gray-200'}`}
                />
                <button type="button" onClick={() => setShow(s => ({ ...s, c: !s.c }))} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show.c ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErr.confirm && <p className="text-red-500 text-xs mt-1">{fieldErr.confirm}</p>}
              {!fieldErr.confirm && form.confirm && form.password === form.confirm && (
                <p className="text-emerald-500 text-xs mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 disabled:opacity-60 text-white py-3.5 font-medium text-sm tracking-widest uppercase transition-colors duration-200 rounded mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
            By creating an account you agree to our{' '}
            <Link to="/terms" className="underline hover:text-pink-600">Terms</Link> &{' '}
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