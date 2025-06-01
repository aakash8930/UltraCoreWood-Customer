// src/pages/MyAccountPage.jsx

import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, deleteProfile } from '../api/accountApi';

export default function MyAccountPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const navigate = useNavigate();
  const auth = getAuth();

  // 1) On mount: wait for Firebase user → fetch profile
  useEffect(() => {
    let unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not logged in → redirect to login
        navigate('/login');
        return;
      }

      try {
        const data = await getProfile();
        setForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  // 2) Handle form-field changes
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setSuccessMsg('');
    setError('');
  };

  // 3) Submit updated profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const updated = await updateProfile(form);
      setForm({
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
      });
      setSuccessMsg('Profile updated successfully.');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // 4) Delete account
  const handleDelete = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      return;
    }
    setDeleting(true);
    setError('');
    try {
      await deleteProfile();
      // After deletion, sign out locally and redirect to /goodbye or /login
      await auth.signOut();
      navigate('/goodbye');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // While loading the profile data, show a spinner/message
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p>Loading your account…</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>My Account</h2>

      {error && (
        <div style={{ color: 'crimson', marginBottom: '1rem', textAlign: 'center' }}>
          {error}
        </div>
      )}
      {successMsg && (
        <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              marginTop: '0.25rem',
              boxSizing: 'border-box',
            }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              marginTop: '0.25rem',
              boxSizing: 'border-box',
            }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: '1rem' }}>
          Phone
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="10-digit mobile"
            style={{
              width: '100%',
              padding: '0.5rem',
              marginTop: '0.25rem',
              boxSizing: 'border-box',
            }}
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: saving ? '#888' : '#07aca4',
            color: 'white',
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            marginBottom: '1rem',
          }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <hr style={{ margin: '2rem 0' }} />

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            background: deleting ? '#888' : 'crimson',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            cursor: deleting ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
            fontSize: '1rem',
          }}
        >
          {deleting ? 'Deleting…' : 'Delete My Account'}
        </button>
      </div>
    </div>
  );
}
