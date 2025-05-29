import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', address: '', phone: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setError("Passwords don't match");
    }
    try {
      await axios.post("http://localhost:8000/api/auth/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
        address: form.address,
        phone: form.phone,
      });
      
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="container">
      <h2>Create Account</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Full Name" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />
        <input name="address" placeholder="Address" onChange={handleChange} />
        <input name="phone" placeholder="Phone" onChange={handleChange} />
        <button type="submit">Sign Up</button>
      </form>
      
      <p>
        <a href="/login">Login</a>
      </p>

    </div>
  );
};

export default Signup;
