// src/components/FilterSidebar.js

import React from 'react';
import '../css/FilterSidebar.css';
import { formatPrice } from '../utils/formatters'; // Import the price formatter

const FilterSidebar = ({
    categoryTitle,
    subCategoryOptions,
    selectedSubCategories,
    onSubCategoryChange,
    colorOptions,
    selectedColors,
    onColorChange,
    // --- Add New Props for Price Filter ---
    priceRange,
    onPriceChange,
    maxPrice 
}) => {

  const handleSubCategoryToggle = (option) => {
    const newSelection = selectedSubCategories.includes(option)
      ? selectedSubCategories.filter(o => o !== option)
      : [...selectedSubCategories, option];
    onSubCategoryChange(newSelection);
  };

  const handleColorToggle = (colorName) => {
    const newSelection = selectedColors.includes(colorName)
      ? selectedColors.filter(c => c !== colorName)
      : [...selectedColors, colorName];
    onColorChange(newSelection);
  };

  return (
    <aside className="filter-sidebar">
      <h3>FILTER</h3>

      {/* --- NEW: Price Range Filter Section --- */}
      <div className="filter-group">
        <h4>PRICE</h4>
        <input
            type="range"
            min="0"
            max={maxPrice}
            value={priceRange}
            onChange={onPriceChange}
            className="price-slider"
        />
        <div className="price-label">
            Up to: {formatPrice(priceRange)}
        </div>
      </div>
      {/* --- End of New Section --- */}

      {/* Sub-Category Section (only shows if options are available) */}
      {subCategoryOptions && subCategoryOptions.length > 0 && (
        <div className="filter-group">
          <h4>{categoryTitle || 'CATEGORY'}</h4>
          {subCategoryOptions.map(option => (
            <label key={option} className="filter-checkbox">
              <input
                type="checkbox"
                checked={selectedSubCategories.includes(option)}
                onChange={() => handleSubCategoryToggle(option)}
              />
              <span className="checkbox-custom"></span>
              {option}
            </label>
          ))}
        </div>
      )}
      
      {/* Color Filter Section */}
      <div className="filter-group">
        <h4>FINISH / COLOR</h4>
        <div className="color-swatches">
          {colorOptions.map(color => (
            <span
              key={color.name}
              className={`swatch ${selectedColors.includes(color.name) ? 'selected' : ''}`}
              style={{ backgroundColor: color.hex, border: color.hex === '#ffffff' ? '1px solid #ddd' : 'none' }}
              onClick={() => handleColorToggle(color.name)}
              title={color.name}
            >
              {selectedColors.includes(color.name) && '✔'}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;