import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../model/User.js';
import { protect } from '../middleware/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';

const router = express.Router();

const generateToken = (user) =>
  jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
const generateOtp = () =>
  String(Math.floor(100000 + Math.random() * 900000));

const passwordRegex =
  /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

const safeUser = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  isVerified: user.isVerified,
  token,
});

// ─── REGISTER ────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });
    if (!passwordRegex.test(password))
      return res.status(400).json({
        message:
          'Password must be ≥8 chars, include 1 uppercase, 1 number & 1 special character',
      });
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already in use' });

    const otp = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = new User({ name, email, password, emailOtp: otp, emailOtpExpiry: expiry });
    await user.save();

    try {
      await sendVerificationEmail(email, name, otp);
    } catch (mailErr) {
      console.error('Mail error (non-fatal):', mailErr.message);
    }

    res.status(201).json({
      message: 'Account created. Please verify your email.',
      userId: user._id,
      requiresVerification: true,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── VERIFY EMAIL OTP ────────────────────────────────────────────────────────
router.post('/verify-email', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified' });
    if (user.emailOtp !== otp || user.emailOtpExpiry < new Date())
      return res.status(400).json({ message: 'Invalid or expired OTP' });

    user.isVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpiry = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({ message: 'Email verified!', ...safeUser(user, token) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── RESEND VERIFICATION OTP ─────────────────────────────────────────────────
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified' });

    const otp = generateOtp();
    user.emailOtp = otp;
    user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, user.name, otp);
    res.json({ message: 'OTP resent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 🔥 FIX 1: Google-only account handling
    if (user.googleId && !user.password) {
      return res.status(400).json({
        message: 'This account uses Google Sign-In. Please login with Google.'
      });
    }

    // 🔥 FIX 2: password check safety
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // email verification check
    if (!user.isVerified) {
      const otp = generateOtp();
      user.emailOtp = otp;
      user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      try {
        await sendVerificationEmail(user.email, user.name, otp);
      } catch (e) {}

      return res.status(403).json({
        message: 'Please verify your email first. OTP sent again.',
        userId: user._id,
        requiresVerification: true,
      });
    }

    const token = generateToken(user._id);

    return res.json(safeUser(user, token));

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ─── GOOGLE OAUTH ─────────────────────────────────────────────────────────────
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'No credential provided' });

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        isVerified: true,
        password: undefined,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = picture;
      user.isVerified = true;
      await user.save();
    }

    const token = generateToken(user._id);
    res.json(safeUser(user, token));
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(401).json({ message: 'Google authentication failed' });
  }
});

// ─── FORGOT PASSWORD – SEND OTP ──────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account with this email' });
    if (user.googleId && !user.password)
      return res.status(400).json({ message: 'This account uses Google sign-in. No password to reset.' });

    const otp = generateOtp();
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendPasswordResetEmail(user.email, user.name, otp);
    res.json({ message: 'OTP sent to your email', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── VERIFY RESET OTP ────────────────────────────────────────────────────────
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.resetOtp !== otp || user.resetOtpExpiry < new Date())
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    res.json({ message: 'OTP verified', canReset: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── RESET PASSWORD ──────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.resetOtp !== otp || user.resetOtpExpiry < new Date())
      return res.status(400).json({ message: 'OTP invalid or expired' });
    if (!passwordRegex.test(newPassword))
      return res.status(400).json({
        message: 'Password must be ≥8 chars with 1 uppercase, 1 number & 1 special character',
      });

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();
    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET PROFILE ─────────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

export default router;