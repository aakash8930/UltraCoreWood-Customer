// src/api/bannerApi.js

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Fetch all public banners to display in the customer portal
 * @returns {Promise<Array>}
 */
export const getPublicBanners = async () => {
  const res = await axios.get(`${BASE_URL}/api/banners/public`);
  return res.data;
};
