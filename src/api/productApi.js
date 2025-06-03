// src/api/productApi.js
import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/products';

// 1) Get all products (optionally filtered by category query param)
export const getAllProducts = async (category = '') => {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  const res = await axios.get(`${BASE_URL}${query}`);
  return res.data;
};

// 2) Get products by category (if you prefer explicit endpoint)
export const getProductsByCategory = async (category) => {
  if (!category) return getAllProducts();
  const res = await axios.get(`${BASE_URL}/category/${encodeURIComponent(category)}`);
  return res.data;
};

// 3) New: Get a single product by its ID
export const getProductById = async (id) => {
  const res = await axios.get(`${BASE_URL}/${id}`);
  return res.data;
};
