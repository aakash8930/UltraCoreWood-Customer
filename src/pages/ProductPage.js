// src/pages/ProductPage.js

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllProducts } from '../api/productApi';
import ProductCard from './ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import '../css/ProductPage.css';

const SUBCATEGORY_MAP = {
  'BEDROOM': ['Beds', 'Wardrobes', 'Nightstands', 'Dressers'],
  'LIVING ROOM': ['Sofas', 'Coffee Tables', 'TV Units', 'Accent Chairs'],
  'DINING': ['Dining Tables', 'Dining Chairs', 'Sideboards', 'Bar Cabinets'],
  'OFFICE': ['Work Desks', 'Office Chairs', 'Bookshelves'],
  'TABLEWARE': ['Dinnerware', 'Serveware', 'Cutlery', 'Glassware'],
  'OUTDOOR': ['Outdoor Seating', 'Patio Tables', 'Garden Decor'],
  'DECOR': ['Vases', 'Lamps', 'Rugs', 'Wall Art'],
  'SALE': [],
};

const COLOR_OPTIONS = [
  { name: 'Brown', hex: '#6b3e26' },
  { name: 'Beige', hex: '#d3a268' },
  { name: 'Black', hex: '#1e1e1e' },
  { name: 'White', hex: '#ffffff' },
];

const ProductPage = ({ openCart }) => {
  // --- STATE MANAGEMENT ---
  // 1. allProducts: Used ONLY to calculate the Max Price for the slider
  const [allProducts, setAllProducts] = useState([]);
  // 2. displayProducts: The actual filtered list shown in the grid
  const [displayProducts, setDisplayProducts] = useState([]);
  
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sortOrder, setSortOrder] = useState('default');
  const [priceRange, setPriceRange] = useState(0);
  // debouncedPrice is used to trigger the API call only when user stops sliding
  const [debouncedPrice, setDebouncedPrice] = useState(0); 

  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category')?.toUpperCase();
  const searchTerm = searchParams.get('search');

  const sidebarFilterOptions = SUBCATEGORY_MAP[urlCategory] || [];

  // Mobile Detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // --- 1. INITIAL LOAD (Get Max Price) ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        // Fetch EVERYTHING once just to find the highest price item
        const data = await getAllProducts({}); 
        setAllProducts(data);
        
        // Set initial price range to max
        if (data.length > 0) {
          const max = Math.max(...data.map(p => p.price));
          setPriceRange(max);
          setDebouncedPrice(max);
        }
      } catch (error) {
        console.error("Failed to fetch initial products:", error);
      }
    };
    loadInitialData();
  }, []); // Run once on mount

  // --- 2. DEBOUNCE PRICE SLIDER ---
  // When user moves slider, update UI immediately (priceRange), 
  // but wait 500ms to update 'debouncedPrice' which triggers the API.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPrice(priceRange);
    }, 500);

    return () => clearTimeout(timer);
  }, [priceRange]);


  // --- 3. SERVER-SIDE FILTERING TRIGGER ---
  // Whenever any filter changes, ask the BACKEND for the new list.
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        
        const filters = {
          category: urlCategory,
          search: searchTerm,
          subCategories: selectedSubCategories,
          colors: selectedColors,
          priceRange: debouncedPrice, // Send the rounded/debounced price
          sort: sortOrder
        };

        console.log("Fetching from Backend with Filters:", filters);
        
        // The backend now handles the logic for discount calculation and regex matching
        const data = await getAllProducts(filters);
        setDisplayProducts(data);

      } catch (error) {
        console.error("Filter fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have initialized the price (prevent fetching with 0 price)
    if (debouncedPrice > 0 || allProducts.length === 0) {
       fetchFilteredProducts();
    }

  }, [
    urlCategory, 
    searchTerm, 
    selectedSubCategories, 
    selectedColors, 
    debouncedPrice, // Triggers only when slider stops
    sortOrder
  ]);

  // --- 4. RESET FILTERS ON CATEGORY CHANGE ---
  useEffect(() => {
    setSelectedSubCategories([]);
    setSelectedColors([]);
    // Reset price to max when category changes
    if (allProducts.length > 0) {
        const max = Math.max(...allProducts.map(p => p.price));
        setPriceRange(max);
        setDebouncedPrice(max);
    }
  }, [urlCategory, searchTerm, allProducts]);

  const getHeading = () => {
    if (searchTerm) return `Search Results for: "${searchTerm}"`;
    return urlCategory || "All Products";
  };

  const maxPrice = useMemo(() => {
    if (allProducts.length === 0) return 100000;
    return Math.max(...allProducts.map(p => p.price));
  }, [allProducts]);

  // Window Resize Handler
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="product-page">
         {/*  - visualizing Sidebar vs Grid */}
      {/* Sidebar for desktop only */}
      {!isMobile && (
        <FilterSidebar
          categoryTitle={urlCategory}
          subCategoryOptions={sidebarFilterOptions}
          selectedSubCategories={selectedSubCategories}
          onSubCategoryChange={setSelectedSubCategories}
          colorOptions={COLOR_OPTIONS}
          selectedColors={selectedColors}
          onColorChange={setSelectedColors}
          priceRange={priceRange}
          onPriceChange={(e) => setPriceRange(Number(e.target.value))}
          maxPrice={maxPrice}
        />
      )}
      
      <main className="main-content">
        <div className="page-header">
          <h2>{getHeading()}</h2>
          {/* Filter button on mobile inside header */}
          {isMobile && (
            <button
              className="filter-dropdown-btn"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              Filters
            </button>
          )}
          <div className="sort-container">
            <label htmlFor="sort">Sort by: </label>
            <select id="sort" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="sort-dropdown">
              <option value="default">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>

        {/* Mobile filter overlay */}
        {isMobile && showFilterDropdown && (
          <div className="filter-dropdown-overlay" onClick={() => setShowFilterDropdown(false)}>
            <div className="filter-dropdown-content" onClick={(e) => e.stopPropagation()}>
              <div className="filter-overlay-header">
                <h3>Filter Products</h3>
                <button 
                  className="close-filter-btn"
                  onClick={() => setShowFilterDropdown(false)}
                  aria-label="Close filters"
                >
                  ✕
                </button>
              </div>
              <FilterSidebar
                categoryTitle={urlCategory}
                subCategoryOptions={sidebarFilterOptions}
                selectedSubCategories={selectedSubCategories}
                onSubCategoryChange={setSelectedSubCategories}
                colorOptions={COLOR_OPTIONS}
                selectedColors={selectedColors}
                onColorChange={setSelectedColors}
                priceRange={priceRange}
                onPriceChange={(e) => setPriceRange(Number(e.target.value))}
                maxPrice={maxPrice}
              />
            </div>
          </div>
        )}

        {loading ? (
          <p style={{textAlign:'center', marginTop: '2rem'}}>Loading products...</p>
        ) : (
          <div className="product-grid">
            {displayProducts.length > 0 ? (
              displayProducts.map((product) => (
                <ProductCard key={product._id} product={product} openCart={openCart} />
              ))
            ) : (
              <div className="no-products-found">
                  <p>No products match your filters.</p>
                  <button 
                    className="clear-filters-btn"
                    onClick={() => {
                        setSelectedSubCategories([]);
                        setSelectedColors([]);
                        setPriceRange(maxPrice);
                    }}
                    style={{marginTop:'10px', padding:'8px 16px', cursor:'pointer'}}
                  >
                      Clear Filters
                  </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductPage;