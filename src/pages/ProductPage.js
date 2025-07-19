// src/pages/ProductPage.js

import React, { useEffect, useState, useMemo } from 'react'; // Import useMemo
import { useSearchParams } from 'react-router-dom';
import { getAllProducts } from '../api/productApi';
import ProductCard from './ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import '../css/ProductPage.css';

// ... (SUBCATEGORY_MAP and COLOR_OPTIONS remain the same)
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
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for all interactive filters
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sortOrder, setSortOrder] = useState('default');

  // --- NEW: State for price filter ---
  const [priceRange, setPriceRange] = useState(0);

  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category')?.toUpperCase();
  const searchTerm = searchParams.get('search');

  const sidebarFilterOptions = SUBCATEGORY_MAP[urlCategory] || [];

  // --- DATA FETCHING ---
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        setLoading(true);
        const data = await getAllProducts();
        console.log('PRODUCTS RECEIVED BY REACT:', data); // <-- ADD THIS LINE
        setAllProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAllProducts();
  }, []);

  // --- NEW: Calculate max price and initialize priceRange ---
  const maxPrice = useMemo(() => {
    if (allProducts.length === 0) return 100000; // Default max
    return Math.max(...allProducts.map(p => p.price));
  }, [allProducts]);

  useEffect(() => {
    if (maxPrice > 0) {
      setPriceRange(maxPrice);
    }
  }, [maxPrice]);


  // --- UNIFIED FILTERING & SORTING LOGIC ---
  useEffect(() => {
    let processedProducts = [...allProducts];

    // 1. Filter by main category from URL
    if (urlCategory) {
      processedProducts = processedProducts.filter(product =>
        product.category.toUpperCase() === urlCategory
      );
    }

    // 2. Filter by selected sub-categories from sidebar
    if (selectedSubCategories.length > 0) {
      processedProducts = processedProducts.filter(product =>
        product.subCategory && selectedSubCategories.includes(product.subCategory)
      );
    }

    // 3. Filter by selected colors from sidebar
    if (selectedColors.length > 0) {
      processedProducts = processedProducts.filter(product =>
        product.color && selectedColors.includes(product.color)
      );
    }

    // --- NEW: 4. Filter by price range ---
    if (priceRange < maxPrice) {
      processedProducts = processedProducts.filter(product =>
        product.price <= priceRange
      );
    }

    // 5. Filter by search term from URL
    if (searchTerm) {
      processedProducts = processedProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 6. Apply sorting
    switch (sortOrder) {
      case 'price-asc':
        processedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        processedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        processedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        processedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setDisplayProducts(processedProducts);

  }, [allProducts, urlCategory, searchTerm, selectedSubCategories, selectedColors, sortOrder, priceRange, maxPrice]); // Add priceRange and maxPrice to dependency array

  // Clear sidebar filters when the main category or search term changes
  useEffect(() => {
    setSelectedSubCategories([]);
    setSelectedColors([]);
    setPriceRange(maxPrice); // Reset price slider
  }, [urlCategory, searchTerm, maxPrice]); // Add maxPrice dependency

  const getHeading = () => {
    if (searchTerm) return `Search Results for: "${searchTerm}"`;
    return urlCategory || "All Products";
  };

  return (
    <div className="product-page">
      <FilterSidebar
        categoryTitle={urlCategory}
        subCategoryOptions={sidebarFilterOptions}
        selectedSubCategories={selectedSubCategories}
        onSubCategoryChange={setSelectedSubCategories}
        colorOptions={COLOR_OPTIONS}
        selectedColors={selectedColors}
        onColorChange={setSelectedColors}
        // --- Pass new props for the price slider ---
        priceRange={priceRange}
        onPriceChange={(e) => setPriceRange(Number(e.target.value))}
        maxPrice={maxPrice}
      />

      <main className="main-content">
        <div className="page-header">
          <h2>{getHeading()}</h2>
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

        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div className="product-grid">
            {displayProducts.length > 0 ? (
              displayProducts.map((product) => (
                <ProductCard key={product._id} product={product} openCart={openCart} />
              ))
            ) : (
              <p>No products match your filters.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductPage;