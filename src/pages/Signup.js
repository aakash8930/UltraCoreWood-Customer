// src/pages/Signup.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { auth, setupRecaptcha } from '../firebaseConfig';
import { signInWithPhoneNumber } from 'firebase/auth';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '+91'      // start with +91
  });
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setError('');

    if (name === 'phone') {
      // strip non-digits
      let digits = value.replace(/\D/g, '');
      // remove leading '91' if they type it again
      if (digits.startsWith('91')) {
        digits = digits.slice(2);
      }
      // rebuild with +91 prefix
      setForm(f => ({
        ...f,
        phone: '+91' + digits
      }));
    } else {
      setForm(f => ({
        ...f,
        [name]: value
      }));
    }
  };

  // Step 1: send OTP to the phone
  const sendOtp = async e => {
    e.preventDefault();
    setError('');
    try {
      const recaptchaVerifier = setupRecaptcha('recaptcha-container');

      // ensure E.164 format
      const phoneNumber = form.phone.startsWith('+')
        ? form.phone
        : `+${form.phone}`;

      const result = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier
      );
      setConfirmationResult(result);
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  };

  // Step 2: verify OTP and complete signup
  const verifyOtp = async e => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const idToken = await userCredential.user.getIdToken();

      // call your backend signup route with Firebase ID token
      const config = {
        headers: { Authorization: `Bearer ${idToken}` }
      };
      const { data } = await axios.post(
        'http://localhost:8000/api/auth/signup',
        {
          name:  form.name,
          email: form.email,
          phone: form.phone
        },
        config
      );

      // store your JWT and redirect
      localStorage.setItem('token', data.token);
      alert('Registration successful!');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  return (
    <div className="container">
      <h2>Create Account</h2>
      {error && <div className="error">{error}</div>}

      {/* recaptcha hook */}
      <div id="recaptcha-container" />

      {step === 1 && (
        <form onSubmit={sendOtp}>
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            name="phone"
            type="tel"
            placeholder="+91XXXXXXXXXX"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <button type="submit">Send OTP & Sign Up</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={verifyOtp}>
          <input
            type="text"
            name="otp"
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            required
          />
          <button type="submit">Verify OTP & Complete Signup</button>
        </form>
      )}

      {step === 1 && (
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      )}
    </div>
  );
};

export default Signup;
