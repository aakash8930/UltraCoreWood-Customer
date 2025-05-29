import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/auth/forgot-password', { email });
      setMessage(res.data.message);
      setError('');
    } catch (err) {
      setMessage('');
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="container">
      <h2>Forgot Password</h2>
      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
