// src/pages/AddressBook.js
import React, { useState, useEffect } from 'react';
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress
} from '../api/addressApi';

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
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState(blankAddress);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const loadAddresses = async () => {
    try {
      const data = await fetchAddresses();
      setAddresses(data);
    } catch (err) {
      setError(err.message || 'Failed to load addresses');
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
      if (editingId) {
        await updateAddress(editingId, formData);
      } else {
        await createAddress(formData);
      }
      handleCancel();
      loadAddresses();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Save failed');
    }
  };

  const handleEdit = addr => {
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      flat: addr.flat,
      area: addr.area,
      landmark: addr.landmark,
      pincode: addr.pincode,
      city: addr.city,
      state: addr.state,
      isDefault: addr.isDefault || false
    });
    setEditingId(addr._id);
    setError('');
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await deleteAddress(id);
      if (id === editingId) {
        handleCancel();
      }
      loadAddresses();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Delete failed');
    }
  };

  const handleCancel = () => {
    setFormData(blankAddress);
    setEditingId(null);
    setError('');
  };

  return (
    <div className="container">
      <h2>Address</h2>
      {error && <div className="error">{error}</div>}

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
          Make default address
        </label>

        <button type="submit">
          {editingId ? 'Update Address' : 'Add Address'}
        </button>
        {editingId && (
          <button type="button" onClick={handleCancel}>
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
