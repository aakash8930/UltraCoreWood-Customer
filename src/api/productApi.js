import axios from 'axios';

export const getAllProducts = async (category = '') => {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  const res = await axios.get(`http://localhost:8000/api/products${query}`);
  return res.data;
};

