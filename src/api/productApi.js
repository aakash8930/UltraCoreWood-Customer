// /src/api/productApi.js
import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/products';

// --- MODIFIED: This function now sends filters to the backend ---
export const getAllProducts = async (filters = {}) => {
  // Use URLSearchParams to easily build the query string
  const params = new URLSearchParams();

  if (filters.category) params.append('category', filters.category);
  if (filters.subCategories?.length > 0) params.append('subCategories', filters.subCategories.join(','));
  if (filters.colors?.length > 0) params.append('colors', filters.colors.join(','));
  if (filters.priceRange) params.append('priceRange', filters.priceRange);
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.search) params.append('search', filters.search);

  // axios will automatically append the params as a query string (e.g., "?category=BEDROOM&...")
  const res = await axios.get(BASE_URL, { params });
  return res.data;
};

// This can now be removed or kept if you have direct category links elsewhere
export const getProductsByCategory = async (category) => {
  if (!category) return getAllProducts();
  const res = await axios.get(`${BASE_URL}/category/${encodeURIComponent(category)}`);
  return res.data;
};

// This function remains the same
export const getProductById = async (id) => {
  const res = await axios.get(`${BASE_URL}/${id}`);
  return res.data;
};