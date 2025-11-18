// src/api/bannerApi.js

import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Fetch all public banners to display in the customer portal
 * @returns {Promise<Array>}
 */
export const getPublicBanners = async () => {
  const res = await axios.get(`${BASE_URL}/api/banners/public`);
  return res.data;
};
