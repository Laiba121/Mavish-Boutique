import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft, ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import {
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  selectAuthLoading,
  selectAuthError,
  selectAuthSuccess,
  selectPendingUserId,
  clearMessages,
} from '../store/authSlice';

const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

/* Step indicators */
const STEPS = [
  { id: 1, label: 'Email',    icon: Mail },
  { id: 2, label: 'OTP',     icon: ShieldCheck },
  { id: 3, label: 'Password', icon: KeyRound },
];

export default function ForgotPasswordPage() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();

  const loading   = useSelector(selectAuthLoading);
  const error     = useSelector(selectAuthError);
  const success   = useSelector(selectAuthSuccess);
  const pendingId = useSelector(selectPendingUserId);

  const [step, setStep]   = useState(1);  // 1=email, 2=otp, 3=reset, 4=done
  const [email, setEmail] = useState('');
  const [otp, setOtp]     = useState(['', '', '', '', '', '']);
  const [otpVerified, setOtpVerified] = useState(false);
  const [pw, setPw]       = useState({ password: '', confirm: '' });
  const [showPw, setShowPw] = useState({ p: false, c: false });
  const [localErr, setLocalErr] = useState('');
  const [resendTimer, setResendTimer] = useState(90);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => () => dispatch(clearMessages()), [dispatch]);

  /* Resend timer */
  useEffect(() => {
    if (step !== 2 || resendTimer <= 0) { if (resendTimer <= 0) setCanResend(true); return; }
    const t = setTimeout(() => setResendTimer(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer, step]);

  /* Move to step 2 after email sent */
  useEffect(() => {
    if (pendingId && step === 1 && success) setStep(2);
  }, [pendingId, success, step]);

  /* Move to step 3 after OTP verified */
  useEffect(() => {
    if (otpVerified && step === 2) setStep(3);
  }, [otpVerified, step]);

  /* Move to step 4 after password reset */
  useEffect(() => {
    if (success?.includes('successfully') && step === 3) setStep(4);
  }, [success, step]);

  // ── Step 1: Request reset ──────────────────────────────────────────────────
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setLocalErr('');
    if (!email || !/\S+@\S+\.\S+/.test(email)) return setLocalErr('Please enter a valid email');
    dispatch(clearMessages());
    dispatch(forgotPassword({ email }));
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleOtpInput = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
    if (next.every(d => d !== '')) {
      handleVerifyOtp(next.join(''));
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    text.split('').forEach((c, i) => { next[i] = c; });
    setOtp(next);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleVerifyOtp = (code) => {
    if (!pendingId) return;
    dispatch(clearMessages());
    dispatch(verifyResetOtp({ userId: pendingId, otp: code })).then(res => {
      if (!res.error) setOtpVerified(true);
    });
  };

  const handleResend = () => {
    if (!canResend) return;
    dispatch(forgotPassword({ email }));
    setCanResend(false);
    setResendTimer(90);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  // ── Step 3: Reset password ────────────────────────────────────────────────
  const handleReset = (e) => {
    e.preventDefault();
    setLocalErr('');
    if (!passwordRegex.test(pw.password))
      return setLocalErr('Password must be ≥8 chars with 1 uppercase, 1 number & 1 special character');
    if (pw.password !== pw.confirm) return setLocalErr('Passwords do not match');
    dispatch(clearMessages());
    dispatch(resetPassword({ userId: pendingId, otp: otp.join(''), newPassword: pw.password }));
  };

  const errMsg = localErr || error;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-full border border-primary flex items-center justify-center">
              <span className="text-primary font-serif text-base font-bold">M</span>
            </div>
            <span className="font-serif text-secondary text-xl tracking-widest">MEHRMA</span>
          </Link>
        </div>

        {/* Done state */}
        {step === 4 ? (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="font-serif text-2xl text-secondary mb-2">Password Reset!</h2>
            <p className="text-gray-500 text-sm mb-7">Your password has been updated successfully. You can now sign in.</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded font-medium text-sm tracking-widest uppercase hover:bg-primary-dark transition-colors"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8">

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const active = step === s.id;
                const done   = step > s.id;
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300
                      ${done   ? 'bg-emerald-100 text-emerald-600'
                      : active ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-400'}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`w-6 h-px transition-colors duration-300 ${step > s.id ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Error / success banner */}
            {errMsg && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm text-center">
                {errMsg}
              </div>
            )}

            {/* ── STEP 1 ──────────────────────────────────────────────── */}
            {step === 1 && (
              <>
                <div className="text-center mb-7">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="font-serif text-2xl text-secondary mb-2">Forgot Password?</h1>
                  <p className="text-gray-500 text-sm">Enter your email and we'll send a reset code.</p>
                </div>
                <form onSubmit={handleEmailSubmit} noValidate className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wide uppercase">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setLocalErr(''); dispatch(clearMessages()); }}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded bg-white text-sm outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white py-3.5 rounded font-medium text-sm tracking-widest uppercase transition-colors"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Send Reset Code</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </>
            )}

            {/* ── STEP 2 ──────────────────────────────────────────────── */}
            {step === 2 && (
              <>
                <div className="text-center mb-7">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="font-serif text-2xl text-secondary mb-2">Enter OTP</h1>
                  <p className="text-gray-500 text-sm">
                    We sent a 6-digit code to <strong className="text-secondary">{email}</strong>.<br />
                    It expires in 15 minutes.
                  </p>
                </div>

                <div className="flex gap-3 justify-center mb-5" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => inputRefs.current[idx] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpInput(idx, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(idx, e)}
                      className={`w-11 h-13 py-3 text-center text-xl font-bold border-2 rounded-lg outline-none transition-all font-mono
                        ${digit ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 bg-white text-secondary'}
                        focus:border-primary focus:ring-2 focus:ring-primary/20`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => handleVerifyOtp(otp.join(''))}
                  disabled={loading || otp.some(d => !d)}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white py-3.5 rounded font-medium text-sm tracking-widest uppercase transition-colors mb-4"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify OTP'}
                </button>

                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    Didn't get it?{' '}
                    {canResend ? (
                      <button onClick={handleResend} className="text-primary font-medium hover:underline">Resend OTP</button>
                    ) : (
                      <span>Resend in <strong className="text-secondary">{resendTimer}s</strong></span>
                    )}
                  </p>
                </div>

                <button onClick={() => setStep(1)} className="mt-4 w-full flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-primary transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Change email
                </button>
              </>
            )}

            {/* ── STEP 3 ──────────────────────────────────────────────── */}
            {step === 3 && (
              <>
                <div className="text-center mb-7">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="font-serif text-2xl text-secondary mb-2">New Password</h1>
                  <p className="text-gray-500 text-sm">Choose a strong password for your account.</p>
                </div>

                <form onSubmit={handleReset} noValidate className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wide uppercase">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPw.p ? 'text' : 'password'}
                        value={pw.password}
                        onChange={e => { setPw(p => ({ ...p, password: e.target.value })); setLocalErr(''); }}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded bg-white text-sm outline-none focus:border-primary transition-colors"
                      />
                      <button type="button" onClick={() => setShowPw(s => ({ ...s, p: !s.p }))} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPw.p ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wide uppercase">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPw.c ? 'text' : 'password'}
                        value={pw.confirm}
                        onChange={e => { setPw(p => ({ ...p, confirm: e.target.value })); setLocalErr(''); }}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded bg-white text-sm outline-none focus:border-primary transition-colors"
                      />
                      <button type="button" onClick={() => setShowPw(s => ({ ...s, c: !s.c }))} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPw.c ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-500 font-medium mb-1">Password requirements:</p>
                    {[
                      ['≥ 8 characters', pw.password.length >= 8],
                      ['1 uppercase letter', /[A-Z]/.test(pw.password)],
                      ['1 number', /[0-9]/.test(pw.password)],
                      ['1 special character', /[!@#$%^&*]/.test(pw.password)],
                    ].map(([label, ok]) => (
                      <p key={label} className={`text-xs flex items-center gap-1.5 mt-1 ${ok ? 'text-emerald-600' : 'text-gray-400'}`}>
                        <span>{ok ? '✓' : '○'}</span> {label}
                      </p>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white py-3.5 rounded font-medium text-sm tracking-widest uppercase transition-colors"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Reset Password</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-gray-400 hover:text-primary transition-colors inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}