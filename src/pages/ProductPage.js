// src/pages/ProductPage.js

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllProducts } from '../api/productApi';
import ProductCard from './ProductCard';
import '../css/ProductPage.css';





const ProductPage = ({ openCart }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  // Get both category and search term from URL
  const category = searchParams.get('category');
  const searchTerm = searchParams.get('search'); // <-- Get search term

  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        setLoading(true);
        const data = await getAllProducts();
        setAllProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAllProducts();
  }, []);

  // --- START: UPDATED FILTERING LOGIC ---
  useEffect(() => {
    let filtered = [...allProducts];

    // First, filter by category if it exists
    if (category) {
      filtered = filtered.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Then, filter by search term if it exists
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name));
    setDisplayProducts(sorted);
  }, [category, searchTerm, allProducts]);
  // --- END: UPDATED FILTERING LOGIC ---

  // Determine the heading based on the filter applied
  const getHeading = () => {
    if (searchTerm) {
      return `Search Results for: "${searchTerm}"`;
    }
    if (category) {
      return category;
    }
    return "All Products";
  };


  return (
    <>
      <div className="product-page">
        <aside className="sidebar">
          <h3>FILTER</h3>
          <div className="filter-group">
            <h4>CATEGORY</h4>
            <label><input type="checkbox" /> Dining Tables</label>
            <label><input type="checkbox" /> Coffee Tables</label>
            <label><input type="checkbox" /> Work Desks</label>
            <label><input type="checkbox" /> Study Tables</label>
            <label><input type="checkbox" /> Nightstands</label>
          </div>
          <div className="filter-group">
            <h4>FINISH / COLOR</h4>
            <div className="color-swatches">
              {['#6b3e26', '#d3a268', '#1e1e1e', '#fff', '#000'].map((color, i) => (
                <span key={i} style={{ background: color }} className="swatch" />
              ))}
            </div>
          </div>
        </aside>

        <main className="main-content">
          <h2>{category || "All Products"}</h2>
          {loading ? (
            <p>Loading products...</p>
          ) : (
            <div className="product-grid">
              {displayProducts.length > 0 ? (
                displayProducts.map((product) => (
                  // 2. Pass the `openCart` prop down to each ProductCard
                  <ProductCard
                    key={product._id}
                    product={product}
                    openCart={openCart}
                  />
                ))
              ) : (
                <p>No products found for this category.</p>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default ProductPage;