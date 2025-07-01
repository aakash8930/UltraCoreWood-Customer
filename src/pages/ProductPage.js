// src/pages/ProductPage.js

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllProducts } from '../api/productApi';
import ProductCard from './ProductCard';
import '../css/ProductPage.css';

const ProductPage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');

  // Step 1: Fetch ALL products once when the component loads
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        setLoading(true);
        const data = await getAllProducts(); // Fetch all products without a category
        setAllProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAllProducts();
  }, []); // Empty dependency array means this runs only once on mount

  // Step 2: Filter and sort products whenever the category or the full product list changes
  useEffect(() => {
    let filtered = [];
    if (category) {
      // Filter the full list based on the category from the URL
      filtered = allProducts.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
    } else {
      // If no category, show all products
      filtered = allProducts;
    }

    // Sort the filtered list alphabetically by name
    const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name));
    
    setDisplayProducts(sorted);
  }, [category, allProducts]); // This effect re-runs when the category or product list changes

  return (
    <>
      <div className="product-page">
        {/* Left Sidebar Filters (static for now) */}
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

        {/* Right Main Content */}
        <main className="main-content">
          <h2>{category || "All Products"}</h2>
          {loading ? (
            <p>Loading products...</p>
          ) : (
            <div className="product-grid">
              {displayProducts.length > 0 ? (
                displayProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
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
