// src/pages/AddressBook.js

import React, { useState, useEffect } from 'react';
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress
} from '../api/addressApi';
import { getAuth } from 'firebase/auth';
import ConfirmationModal from '../pages/ConfirmationModal'; // --- 1. Import the modal component ---
import '../css/AddressBook.css';

const blankAddress = {
  fullName: '',
  phone: '',
  flat: '',
  area: '',
  landmark: '',
  pincode: '',
  city: '',
  state: '',
  isDefault: false,
};

export default function AddressBook({ initialView, onSwitchView }) {
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState(blankAddress);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState(initialView);

  // --- 2. Add state for the delete confirmation modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  useEffect(() => {
    setCurrentView(initialView);
    if (initialView === 'form') {
        setEditingId(null);
        setFormData(blankAddress);
    }
  }, [initialView]);

  const getToken = async () => {
    const user = getAuth().currentUser;
    return user ? await user.getIdToken() : null;
  };

  const loadAddresses = async () => {
    setError('');
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const data = await fetchAddresses(token);
      setAddresses(data);
    } catch (err) {
      console.error('Error listing addresses:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    if (name === 'phone' || name === 'pincode') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(fd => ({ ...fd, [name]: numericValue }));
    } else {
      setFormData(fd => ({ ...fd, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (formData.phone.length !== 10) {
        setError('Phone number must be exactly 10 digits.');
        return;
    }

    if (formData.pincode.length !== 6) {
        setError('Pincode must be exactly 6 digits.');
        return;
    }

    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      if (formData.isDefault) {
        const currentDefault = addresses.find(addr => addr.isDefault && addr._id !== editingId);
        if (currentDefault) {
          const updatedOldDefault = { ...currentDefault, isDefault: false };
          await updateAddress(token, currentDefault._id, updatedOldDefault);
        }
      }
      
      if (editingId) {
        await updateAddress(token, editingId, formData);
      } else {
        await createAddress(token, formData);
      }

      setFormData(blankAddress);
      setEditingId(null);
      await loadAddresses();
      onSwitchView('list'); 
    } catch (err) {
      console.error('Save address failed:', err);
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleEdit = addr => {
    setEditingId(addr._id);
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      flat: addr.flat,
      area: addr.area,
      landmark: addr.landmark,
      pincode: addr.pincode,
      city: addr.city,
      state: addr.state,
      isDefault: addr.isDefault
    });
    onSwitchView('form');
  };

  // --- 3. Replace the old handleDelete with functions to manage the modal ---
  const openDeleteModal = (id) => {
    setAddressToDelete(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!addressToDelete) return;
    try {
        await deleteAddress(await getToken(), addressToDelete);
        await loadAddresses();
    } catch (err) {
        console.error('Failed to delete address:', err);
        setError(err.response?.data?.error || 'Could not delete address.');
    } finally {
        setIsModalOpen(false);
        setAddressToDelete(null);
    }
  };

  const handleSetDefault = async (addressToMakeDefault) => {
    try {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const currentDefault = addresses.find(addr => addr.isDefault);
        const updates = [];

        if (currentDefault) {
            updates.push(updateAddress(token, currentDefault._id, { ...currentDefault, isDefault: false }));
        }
        updates.push(updateAddress(token, addressToMakeDefault._id, { ...addressToMakeDefault, isDefault: true }));

        await Promise.all(updates);
        await loadAddresses();
    } catch (err) {
        console.error('Failed to set default address:', err);
        setError(err.response?.data?.error || err.message);
    }
  };

  if (loading) {
    return <p>Loading addresses...</p>;
  }

  return (
    <>
      {currentView === 'list' && (
        <>
          <h2 className="Heading">Saved Addresses</h2>
          {error && <div className="error">{error}</div>}
          <div className="address-list">
            {addresses.map(addr => (
              <div key={addr._id} className="address-card">
                <p className="name">
                  {addr.fullName}
                  {addr.isDefault && <span className="badge-inline">Default</span>}
                </p>
                <p>{addr.flat}, {addr.area}, {addr.landmark}</p>
                <p>{addr.city}, {addr.state} – {addr.pincode}</p>
                <p className="phone">{addr.phone}</p>
                
                <div className="card-actions">
                  {!addr.isDefault && (
                    <button className="action-button default" onClick={() => handleSetDefault(addr)}>
                      Set as Default
                    </button>
                  )}
                  <button className="action-button edit" onClick={() => handleEdit(addr)}>✏️ Edit</button>
                  {/* --- 4. Update the button's onClick to open the modal --- */}
                  <button className="action-button delete" onClick={() => openDeleteModal(addr._id)}>🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {currentView === 'form' && (
        <>
          <h2 className="Heading">{editingId ? 'Update Address' : 'Add New Address'}</h2>
          {error && <div className="error">{error}</div>}
          <form className='address-form' onSubmit={handleSubmit}>
            <input name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required />
            <input name="phone" type="tel" placeholder="Mobile Number" value={formData.phone} onChange={handleChange} required maxLength="10" />
            <input name="flat" placeholder="Flat, House No., Building" value={formData.flat} onChange={handleChange} />
            <input name="area" placeholder="Area, Street, Sector" value={formData.area} onChange={handleChange} />
            <input name="landmark" placeholder="Landmark" value={formData.landmark} onChange={handleChange} />
            <input name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} required maxLength="6" />
            <input name="city" placeholder="Town/City" value={formData.city} onChange={handleChange} required />
            <input name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
            <label>
              <input name="isDefault" type="checkbox" checked={formData.isDefault} onChange={handleChange} />
              {' '}Make default
            </label>
            
            <div className="button-row">
              <button type="submit">
                {editingId ? 'Update Address' : 'Save Address'}
              </button>
              <button type="button" onClick={() => onSwitchView('list')} style={{marginLeft: '1rem', background: '#6c757d'}}>
                Cancel
              </button>
            </div>
          </form>
        </>
      )}

      {/* --- 5. Render the modal component --- */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Address Deletion"
      >
        Are you sure you want to permanently delete this address? This action cannot be undone.
      </ConfirmationModal>
    </>
  );
}