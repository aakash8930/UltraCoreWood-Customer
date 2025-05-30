// src/api/addressApi.js
import axios from 'axios';

// Base URL for API calls; adjust as needed or set via environment variable
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Helper to get auth header
function authHeader() {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
}

/**
 * Fetch all addresses for the logged-in user
 * @returns {Promise<Array>} list of address objects
 */
export const fetchAddresses = async () => {
  const response = await axios.get(
    `${BASE_URL}/api/addresses`,
    authHeader()
  );
  return response.data;
};

/**
 * Create a new address
 * @param {Object} addressData
 * @returns {Promise<Object>} created address
 */
export const createAddress = async (addressData) => {
  const response = await axios.post(
    `${BASE_URL}/api/addresses`,
    addressData,
    authHeader()
  );
  return response.data;
};

/**
 * Update an existing address
 * @param {string} id - address document ID
 * @param {Object} addressData
 * @returns {Promise<Object>} updated address
 */
export const updateAddress = async (id, addressData) => {
  const response = await axios.put(
    `${BASE_URL}/api/addresses/${id}`,
    addressData,
    authHeader()
  );
  return response.data;
};

/**
 * Delete an address
 * @param {string} id - address document ID
 * @returns {Promise<Object>} deletion response
 */
export const deleteAddress = async (id) => {
  const response = await axios.delete(
    `${BASE_URL}/api/addresses/${id}`,
    authHeader()
  );
  return response.data;
};
