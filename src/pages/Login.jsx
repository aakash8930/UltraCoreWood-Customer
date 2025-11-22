// src/pages/Login.js


import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { auth, setupRecaptcha } from '../firebaseConfig';
import { signInWithPhoneNumber, signOut } from 'firebase/auth';
import '../css/Login.css'

const Login = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('+91'); // start with +91
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Keep +91 prefix and strip non-digits
  const handlePhoneChange = (e) => {
    let digits = e.target.value.replace(/\D/g, '');
    if (digits.startsWith('91')) digits = digits.slice(2);
    // limit to 10 digits after country code
    digits = digits.slice(0, 10);
    setPhone('+91' + digits);
    setError('');
  };

  // Step 1: send OTP
  const sendOtp = async (e) => {
    e && e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const recaptchaVerifier = setupRecaptcha('recaptcha-container');
      const result = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
      setConfirmationResult(result);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify OTP
  const verifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const idToken = await userCredential.user.getIdToken();

      // Exchange Firebase ID token for your app JWT
      const { data } = await axios.post(
        'http://localhost:8000/api/auth/verify-otp',
        {},
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      localStorage.setItem('token', data.token);
      navigate('/', { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      await signOut(auth); // Ensure Firebase logout on backend failure
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    // allow user to resend OTP — reuse sendOtp logic
    await sendOtp();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <aside className="brand-panel">
          <div className="brand-logo">FURNI</div>
          <p className="brand-sub">Beautiful furniture. Delivered.</p>
          <div className="decor" aria-hidden />
        </aside>

        <main className="form-panel">
          <h2 className="title">Sign in to your account</h2>
          <p className="subtitle">Fast, secure login with phone OTP</p>

          {error && <div className="error">{error}</div>}

          <div id="recaptcha-container" />

          {step === 1 && (
            <form className="login-form" onSubmit={sendOtp}>
              <label className="input-label" htmlFor="phone">Phone number</label>
              <div className="phone-row">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="input"
                  placeholder="+91XXXXXXXXXX"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                />
              </div>
              <div className="form-actions">
                <button className="btn primary" type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </div>

              <p style={{ marginTop: '1rem' }}>
                Don't have an account? <Link to="/signup">Sign up here</Link>
              </p>
            </form>
          )}

          {step === 2 && (
            <form className="login-form" onSubmit={verifyOtp}>
              <label className="input-label" htmlFor="otp">Enter OTP</label>
              <input
                id="otp"
                type="text"
                name="otp"
                className="input"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => { setOtp(e.target.value); setError(''); }}
                required
                maxLength={6}
              />

              <div className="form-actions">
                <button className="btn primary" type="submit" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem' }}>
                <button type="button" className="btn ghost" onClick={() => { setStep(1); setOtp(''); }}>
                  Edit number
                </button>
                <button className="link" type="button" onClick={resendOtp}>Resend OTP</button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default Login;
