// src/pages/Signup.js

import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { auth, setupRecaptcha } from '../firebaseConfig';
import { signInWithPhoneNumber } from 'firebase/auth';
import '../css/Login.css';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '+91' });
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setError('');

    if (name === 'phone') {
      // strip non-digits, remove leading 91 if typed again, limit to 10
      let digits = value.replace(/\D/g, '');
      if (digits.startsWith('91')) digits = digits.slice(2);
      digits = digits.slice(0, 10);
      setForm(f => ({ ...f, phone: '+91' + digits }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Step 1: send OTP to the phone
  const sendOtp = async e => {
    e && e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const recaptchaVerifier = setupRecaptcha('recaptcha-container');
      const phoneNumber = form.phone.startsWith('+') ? form.phone : `+${form.phone}`;
      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setConfirmationResult(result);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify OTP and complete signup
  const verifyOtp = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const idToken = await userCredential.user.getIdToken();

      const config = { headers: { Authorization: `Bearer ${idToken}` } };
      const { data } = await axios.post(
        'http://localhost:8000/api/auth/signup',
        { name: form.name, email: form.email, phone: form.phone },
        config
      );

      localStorage.setItem('token', data.token);
      alert('Registration successful!');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    await sendOtp();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <aside className="brand-panel">
          <div className="brand-logo">FURNI</div>
          <p className="brand-sub">Beautiful furniture. Delivered.</p>
        </aside>

        <main className="form-panel">
          <h2 className="title">Create your account</h2>
          <p className="subtitle">Sign up quickly using your phone number</p>

          {error && <div className="error">{error}</div>}

          <div id="recaptcha-container" />

          {step === 1 && (
            <form className="login-form" onSubmit={sendOtp}>
              <label className="input-label" htmlFor="name">Full name</label>
              <input id="name" name="name" className="input" placeholder="Full Name" value={form.name} onChange={handleChange} required />

              <label className="input-label" htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" className="input" placeholder="Email Address" value={form.email} onChange={handleChange} required />

              <label className="input-label" htmlFor="phone">Phone number</label>
              <div className="phone-row">
                <input id="phone" name="phone" type="tel" className="input" placeholder="+91XXXXXXXXXX" value={form.phone} onChange={handleChange} required />
              </div>

              <div className="form-actions">
                <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send OTP & Sign Up'}</button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form className="login-form" onSubmit={verifyOtp}>
              <label className="input-label" htmlFor="otp">Enter OTP</label>
              <input id="otp" type="text" name="otp" className="input" placeholder="6-digit code" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6} />

              <div className="form-actions">
                <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP & Complete Signup'}</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem' }}>
                <button type="button" className="btn ghost" onClick={() => { setStep(1); setOtp(''); }}>Edit details</button>
                <button className="link" type="button" onClick={resendOtp}>Resend OTP</button>
              </div>
            </form>
          )}

          {step === 1 && (
            <p style={{ marginTop: '1rem' }}>
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          )}
        </main>
      </div>
    </div>
  );
};

export default Signup;
