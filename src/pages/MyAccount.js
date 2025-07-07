// src/pages/MyAccount.js

import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, deleteProfile } from '../api/accountApi';
import '../css/MyAccount.css'; // Import the new CSS file

export default function MyAccountPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deleting, setDeleting] = useState(false);
  
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);

  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        const data = await getProfile();
        const safeData = {
            name: data?.name || '',
            email: data?.email || '',
            phone: data?.phone || ''
        };
        setProfile(safeData);
        setFormData(safeData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setSuccessMsg('');
    setError('');
  };

  const handleSave = async (section) => {
    setError('');
    setSuccessMsg('');
    try {
      const updatedProfile = await updateProfile(formData);
      setProfile(updatedProfile);
      setSuccessMsg('Profile updated successfully!');
      
      if (section === 'info') setIsEditingInfo(false);
      if (section === 'contact') setIsEditingContact(false);

    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleCancel = (section) => {
    setFormData(profile);
    if (section === 'info') setIsEditingInfo(false);
    if (section === 'contact') setIsEditingContact(false);
  };
  
  const handleDelete = async () => {
    // In a real app, you would show a custom confirmation modal here instead of window.confirm
    setDeleting(true);
    setError('');
    try {
      await deleteProfile();
      await auth.signOut();
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="account-loading">
        <p>Loading your account…</p>
      </div>
    );
  }

  const userFirstName = profile.name ? profile.name.split(' ')[0] : 'User';

  return (
    <div className="account-page-wrapper">
      <div className="account-main-content">
        <h1 className="account-header">Account settings</h1>
        
        {error && <div className="account-message error">{error}</div>}
        {successMsg && <div className="account-message success">{successMsg}</div>}

        {/* --- Personal Information Box --- */}
        <div className="info-box">
          <div className="info-box-header">
            <h3 className="info-box-header-title">Personal Information</h3>
            {isEditingInfo ? (
              <div className="edit-buttons-container">
                <button onClick={() => handleSave('info')} className="save-btn">Save</button>
                <button onClick={() => handleCancel('info')} className="cancel-btn">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setIsEditingInfo(true)} className="edit-btn">✏️ EDIT</button>
            )}
          </div>
          <div className="info-row">
            <span className="info-label">Name</span>
            {isEditingInfo ? (
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="info-input" />
            ) : (
              <span className="info-value">{profile.name}</span>
            )}
          </div>
          <div className="info-row">
            <span className="info-label">Date of Birth</span>
            <span className="info-value">10-11-2000</span>
          </div>
          <div className="info-row no-border">
            <span className="info-label">Gender</span>
            <span className="info-value">Male</span>
          </div>
        </div>

        {/* --- Contact Information Box --- */}
        <div className="info-box">
          <div className="info-box-header">
            <h3 className="info-box-header-title">Contact Information</h3>
            {isEditingContact ? (
              <div className="edit-buttons-container">
                <button onClick={() => handleSave('contact')} className="save-btn">Save</button>
                <button onClick={() => handleCancel('contact')} className="cancel-btn">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setIsEditingContact(true)} className="edit-btn">✏️ EDIT</button>
            )}
          </div>
          <div className="info-row">
            <span className="info-label">Email Address</span>
            {isEditingContact ? (
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="info-input" />
            ) : (
              <span className="info-value">{profile.email}</span>
            )}
          </div>
          <div className="info-row no-border">
            <span className="info-label">Mobile Number</span>
            {isEditingContact ? (
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="info-input" />
            ) : (
              <span className="info-value">{profile.phone}</span>
            )}
          </div>
        </div>
        
        {/* --- Delete Account Section --- */}
        <div className="info-box">
            <div className="info-box-header delete-section-header">
                <h3 className="info-box-header-title delete-section-title">Delete Account</h3>
            </div>
            <div className="info-row delete-row no-border">
                <p className="delete-text">Once you delete your account, there is no going back. Please be certain.</p>
                <button onClick={handleDelete} disabled={deleting} className="delete-btn">
                    {deleting ? 'Deleting...' : 'Delete My Account'}
                </button>
            </div>
        </div>

      </div>

      <div className="account-sidebar">
        <div className="user-greeting">
          <div className="user-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="#d0d0d0"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <h2 className="user-greeting-title">Hello, {userFirstName}!</h2>
        </div>
      </div>
    </div>
  );
}
