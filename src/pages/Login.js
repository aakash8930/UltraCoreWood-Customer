// src/pages/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth, setupRecaptcha } from '../firebaseConfig';
import { signInWithPhoneNumber } from 'firebase/auth';
import '../css/Login.css'
const Login = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('+91');           // start with +91
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Keep +91 prefix and strip non-digits
  const handlePhoneChange = (e) => {
    let digits = e.target.value.replace(/\D/g, '');
    if (digits.startsWith('91')) digits = digits.slice(2);
    setPhone('+91' + digits);
    setError('');
  };

  // Step 1: send OTP
  const sendOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const recaptchaVerifier = setupRecaptcha('recaptcha-container');
      const result = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
      setConfirmationResult(result);
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  };

  // Step 2: verify OTP
  const verifyOtp = async (e) => {
    e.preventDefault();
    setError('');
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
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    }
  };

  return (
    <div className="container">
      <h2>Login with Phone</h2>
      {error && <div className="error">Firebase: {error}</div>}

      {/* Invisible reCAPTCHA mount point */}
      <div id="recaptcha-container" />

      {step === 1 && (
        <form className='login-form' onSubmit={sendOtp}>
          <input
            name="phone"
            type="tel"
            placeholder="+91XXXXXXXXXX"
            value={phone}
            onChange={handlePhoneChange}
            required
          />
          <button type="submit">Send OTP</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={verifyOtp}>
          <input
            type="text"
            name="otp"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => { setOtp(e.target.value); setError(''); }}
            required
          />
          <button type="submit">Verify OTP</button>
        </form>
      )}
    </div>
  );
};

export default Login;
