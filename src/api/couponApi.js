// src/api/couponApi.js

import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

/**
 * Fetch all available (visible + not expired) coupons for customers
 */
export const fetchAvailableCoupons = async () => {
  const res = await axios.get(`${BASE_URL}/api/coupons`);
  return res.data;
};

/**
 * Validate or apply a coupon code server‐side, regardless of visibility.
 * @param {string} code       The coupon code to apply (e.g. "SAVE10")
 * @param {number} orderTotal The current order total (before discount)
 * @returns {Promise<Object>} { code, discount } on success
 */
export const applyCoupon = async (code, orderTotal) => {
  const res = await axios.post(
    `${BASE_URL}/api/coupons/apply`,
    { code: code.trim().toUpperCase(), orderTotal },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return res.data; // { code, discount }
};
