// /pages/ProductPage.js
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllProducts } from '../api/productApi';
import ProductCard from './ProductCard';
import '../css/ProductPage.css';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');

  useEffect(() => {
    const load = async () => {
      const data = await getAllProducts(category);
      setProducts(data);
    };
    load();
  }, [category]);

  return (
    <>
      
      <div className="product-page">
        {/* Left Sidebar Filters */}
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
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </main>
      </div>
    
    </>
  );
};

export default ProductPage;
