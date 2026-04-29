import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';
import {
  verifyEmail,
  resendOtp,
  selectUser,
  selectAuthLoading,
  selectAuthError,
  selectAuthSuccess,
  selectPendingUserId,
  clearMessages,
} from '../store/authSlice';

export default function VerifyEmailPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();

  const user      = useSelector(selectUser);
  const loading   = useSelector(selectAuthLoading);
  const error     = useSelector(selectAuthError);
  const success   = useSelector(selectAuthSuccess);
  const pendingId = useSelector(selectPendingUserId);

  const userId = location.state?.userId || pendingId;
  const email  = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef([]);

  /* Redirect if already logged in */
  useEffect(() => {
    if (user && !verified) navigate('/', { replace: true });
  }, [user, navigate, verified]);

  /* No userId → back to register */
  useEffect(() => {
    if (!userId) navigate('/register', { replace: true });
  }, [userId, navigate]);

  /* Resend countdown */
  useEffect(() => {
    if (resendTimer <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setResendTimer(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  /* Auto-submit when all 6 digits filled */
  useEffect(() => {
    if (otp.every(d => d !== '')) {
      handleVerify(otp.join(''));
    }
  }, [otp]);

  /* On success → show tick then redirect */
  useEffect(() => {
    if (user && !verified) {
      setVerified(true);
      setTimeout(() => {
        navigate(user.role === 'admin' ? '/admin/dashboard' : '/', { replace: true });
      }, 1500);
    }
  }, [user, navigate, verified]);

  useEffect(() => () => dispatch(clearMessages()), [dispatch]);

  const handleVerify = (code) => {
    if (!userId) return;
    dispatch(verifyEmail({ userId, otp: code }));
  };

  const handleInput = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    text.split('').forEach((c, i) => { next[i] = c; });
    setOtp(next);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleResend = () => {
    if (!canResend || !userId) return;
    dispatch(resendOtp({ userId }));
    setCanResend(false);
    setResendTimer(60);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="font-serif text-2xl text-secondary mb-2">Email Verified!</h2>
          <p className="text-gray-500 text-sm">Redirecting you now…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md animate-fade-in">

        {/* Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10">

          {/* Icon */}
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-7 h-7 text-primary" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-2xl text-secondary mb-2">Verify Your Email</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              We sent a 6-digit code to{' '}
              {email ? <strong className="text-secondary">{email}</strong> : 'your email address'}.<br />
              Enter it below to activate your account.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* Success (resend) */}
          {success && (
            <div className="mb-5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-600 text-sm text-center">
              {success}
            </div>
          )}

          {/* OTP inputs */}
          <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => inputRefs.current[idx] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleInput(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg outline-none transition-all duration-200 font-mono
                  ${digit ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 bg-white text-secondary'}
                  ${error ? 'border-red-300' : ''}
                  focus:border-primary focus:ring-2 focus:ring-primary/20`}
              />
            ))}
          </div>

          {/* Manual verify button */}
          <button
            onClick={() => handleVerify(otp.join(''))}
            disabled={loading || otp.some(d => !d)}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white py-3.5 rounded font-medium text-sm tracking-widest uppercase transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Email'}
          </button>

          {/* Resend */}
          <div className="mt-5 text-center">
            <p className="text-gray-400 text-sm">
              Didn't receive the code?{' '}
              {canResend ? (
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Resend
                </button>
              ) : (
                <span className="text-gray-400">
                  Resend in <span className="text-secondary font-medium">{resendTimer}s</span>
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-gray-400 hover:text-primary transition-colors">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}