import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:8000/api/auth/reset-password/${token}`, {
        password,
      });
      setMessage(res.data.message);
      setError('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
      setMessage('');
    }
  };

  return (
    <div className="container">
      <h2>Reset Password</h2>
      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
