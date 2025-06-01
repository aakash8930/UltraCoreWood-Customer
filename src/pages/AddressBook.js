// src/pages/AddressBook.js
import React, { useState, useEffect } from 'react';
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress
} from '../api/addressApi';
import { getAuth } from 'firebase/auth';

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

export default function AddressBook() {
  const [addresses, setAddresses]       = useState([]);
  const [formData, setFormData]         = useState(blankAddress);
  const [editingId, setEditingId]       = useState(null);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(true);

  // helper to pull the Firebase token
  const getToken = async () => {
    const user = getAuth().currentUser;
    return user ? await user.getIdToken() : null;
  };

  // load addresses
  const loadAddresses = async () => {
    setError('');
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const data  = await fetchAddresses(token);
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
    setError('');
    setFormData(fd => ({
      ...fd,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      if (editingId) {
        await updateAddress(token, editingId, formData);
      } else {
        await createAddress(token, formData);
      }

      setFormData(blankAddress);
      setEditingId(null);
      await loadAddresses();
    } catch (err) {
      console.error('Save address failed:', err);
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleEdit = addr => {
    setError('');
    setEditingId(addr._id);
    setFormData({
      fullName:  addr.fullName,
      phone:     addr.phone,
      flat:      addr.flat,
      area:      addr.area,
      landmark:  addr.landmark,
      pincode:   addr.pincode,
      city:      addr.city,
      state:     addr.state,
      isDefault: addr.isDefault
    });
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this address?')) return;
    setError('');
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      await deleteAddress(token, id);
      if (id === editingId) {
        setEditingId(null);
        setFormData(blankAddress);
      }
      await loadAddresses();
    } catch (err) {
      console.error('Delete address failed:', err);
      setError(err.response?.data?.error || err.message);
    }
  };

  if (loading) {
    return <p>Loading addresses…</p>;
  }

  return (
    <div className="container">
      <h2>Address</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        <input
          name="phone"
          type="tel"
          placeholder="Mobile Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          name="flat"
          placeholder="Flat, House No., Building"
          value={formData.flat}
          onChange={handleChange}
        />
        <input
          name="area"
          placeholder="Area, Street, Sector"
          value={formData.area}
          onChange={handleChange}
        />
        <input
          name="landmark"
          placeholder="Landmark"
          value={formData.landmark}
          onChange={handleChange}
        />
        <input
          name="pincode"
          placeholder="Pincode"
          value={formData.pincode}
          onChange={handleChange}
          required
        />
        <input
          name="city"
          placeholder="Town/City"
          value={formData.city}
          onChange={handleChange}
          required
        />
        <input
          name="state"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
          required
        />
        <label>
          <input
            name="isDefault"
            type="checkbox"
            checked={formData.isDefault}
            onChange={handleChange}
          />{' '}
          Make default
        </label>

        <button type="submit" disabled={loading}>
          {editingId ? 'Update Address' : 'Add Address'}
        </button>
        {editingId && (
          <button type="button" onClick={() => {
            setEditingId(null);
            setFormData(blankAddress);
            setError('');
          }}>
            Cancel
          </button>
        )}
      </form>

      <hr />

      <ul>
        {addresses.map(addr => (
          <li key={addr._id}>
            <p><strong>{addr.fullName}</strong> ({addr.phone})</p>
            <p>{addr.flat}, {addr.area}, {addr.landmark}</p>
            <p>{addr.city}, {addr.state} – {addr.pincode}</p>
            {addr.isDefault && <em>Default</em>}
            <br />
            <button onClick={() => handleEdit(addr)}>Edit</button>
            <button onClick={() => handleDelete(addr._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
