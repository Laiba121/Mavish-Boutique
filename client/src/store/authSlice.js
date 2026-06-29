import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';


const saved = localStorage.getItem('mavish_user');

// ─── Thunks ──────────────────────────────────────────────────────────────────
export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post(`/auth/register`, data);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Registration failed'); }
});

export const verifyEmail = createAsyncThunk('auth/verifyEmail', async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post(`/auth/verify-email`, data);
    localStorage.setItem('mavish_user', JSON.stringify(res.data));
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Verification failed'); }
});

export const resendOtp = createAsyncThunk('auth/resendOtp', async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post(`/auth/resend-otp`, data);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Resend failed'); }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post(`/auth/login`, data);
    localStorage.setItem('mavish_user', JSON.stringify(res.data));
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const googleLogin = createAsyncThunk('auth/google', async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post(`/auth/google`, data);
    localStorage.setItem('mavish_user', JSON.stringify(res.data));
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Google login failed'); }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post(`/auth/forgot-password`, data);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Request failed'); }
});

export const verifyResetOtp = createAsyncThunk('auth/verifyResetOtp', async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post(`/auth/verify-reset-otp`, data);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'OTP invalid'); }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post(`/auth/reset-password`, data);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Reset failed'); }
});

// ─── Slice ───────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: saved ? JSON.parse(saved) : null,
    pendingUserId: null,   // for OTP flows
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.pendingUserId = null;
      localStorage.removeItem('mavish_user');
    },
    clearMessages: (state) => { state.error = null; state.success = null; },
    setPendingUser: (state, action) => { state.pendingUserId = action.payload; },
  },
  extraReducers: (builder) => {
    const pending = (s) => { s.loading = true; s.error = null; s.success = null; };
    const rejected = (s, a) => { s.loading = false; s.error = a.payload; };

    builder
      // register
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, (s, a) => { s.loading = false; s.pendingUserId = a.payload.userId; s.success = a.payload.message; })
      .addCase(registerUser.rejected, rejected)
      // verify email
      .addCase(verifyEmail.pending, pending)
      .addCase(verifyEmail.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; s.pendingUserId = null; })
      .addCase(verifyEmail.rejected, rejected)
      // resend
      .addCase(resendOtp.pending, pending)
      .addCase(resendOtp.fulfilled, (s, a) => { s.loading = false; s.success = a.payload.message; })
      .addCase(resendOtp.rejected, rejected)
      // login
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; })
      .addCase(loginUser.rejected, (s, a) => {
        s.loading = false;
        if (a.payload?.requiresVerification) { s.pendingUserId = a.payload.userId; }
        s.error = a.payload?.message || a.payload;
      })
      // google
      .addCase(googleLogin.pending, pending)
      .addCase(googleLogin.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; })
      .addCase(googleLogin.rejected, rejected)
      // forgot password
      .addCase(forgotPassword.pending, pending)
      .addCase(forgotPassword.fulfilled, (s, a) => { s.loading = false; s.pendingUserId = a.payload.userId; s.success = a.payload.message; })
      .addCase(forgotPassword.rejected, rejected)
      // verify reset otp
      .addCase(verifyResetOtp.pending, pending)
      .addCase(verifyResetOtp.fulfilled, (s) => { s.loading = false; s.success = 'OTP verified'; })
      .addCase(verifyResetOtp.rejected, rejected)
      // reset password
      .addCase(resetPassword.pending, pending)
      .addCase(resetPassword.fulfilled, (s, a) => { s.loading = false; s.pendingUserId = null; s.success = a.payload.message; })
      .addCase(resetPassword.rejected, rejected);
  },
});

export const { logout, clearMessages, setPendingUser } = authSlice.actions;
export const selectUser = (s) => s.auth.user;
export const selectAuthLoading = (s) => s.auth.loading;
export const selectAuthError = (s) => s.auth.error;
export const selectAuthSuccess = (s) => s.auth.success;
export const selectPendingUserId = (s) => s.auth.pendingUserId;
export default authSlice.reducer;