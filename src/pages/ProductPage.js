// src/pages/ProductPage.js

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllProducts } from '../api/productApi';
import ProductCard from './ProductCard';
import '../css/ProductPage.css';

// 1. Accept `openCart` as a prop here
const ProductPage = ({ openCart }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');

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

  useEffect(() => {
    let filtered = [];
    if (category) {
      filtered = allProducts.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
    } else {
      filtered = allProducts;
    }
    const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name));
    setDisplayProducts(sorted);
  }, [category, allProducts]);

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