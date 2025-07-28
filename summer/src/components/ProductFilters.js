import React, { useState, useEffect } from 'react';
import { FaFilter, FaSearch, FaTimes, FaSort } from 'react-icons/fa';
import axios from 'axios';
import { serverEndpoint } from './config';

const ProductFilters = ({ onFiltersChange, currentFilters = {} }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    category: currentFilters.category || 'all',
    minPrice: currentFilters.minPrice || '',
    maxPrice: currentFilters.maxPrice || '',
    search: currentFilters.search || '',
    sortBy: currentFilters.sortBy || 'createdAt',
    sortOrder: currentFilters.sortOrder || 'desc'
  });

  // Fetch categories and price range on component mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get(`${serverEndpoint}/api/products`);
      if (response.data.success) {
        setCategories(response.data.filters.categories);
        setPriceRange(response.data.filters.priceRange);
      }
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  };

  // Search suggestions
  useEffect(() => {
    if (searchTerm.length >= 2) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(
        `${serverEndpoint}/api/products/search/suggestions?q=${searchTerm}`
      );
      setSuggestions(response.data.suggestions);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    handleFilterChange('search', value);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.name);
    handleFilterChange('search', suggestion.name);
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: 'all',
      minPrice: '',
      maxPrice: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    setSearchTerm('');
    onFiltersChange(clearedFilters);
  };

  const applyFilters = () => {
    onFiltersChange(filters);
    setShowFilters(false);
  };

  return (
    <div className="product-filters mb-4">
      {/* Search Bar */}
      <div className="search-container position-relative mb-3">
        <div className="input-group">
          <span className="input-group-text">
            <FaSearch />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {searchTerm && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => handleSearchChange('')}
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-dropdown position-absolute w-100 bg-white border rounded shadow-sm" style={{ zIndex: 1000 }}>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item p-2 cursor-pointer hover-bg-light"
                onClick={() => handleSuggestionClick(suggestion)}
                style={{ cursor: 'pointer' }}
              >
                <div className="fw-bold">{suggestion.name}</div>
                {suggestion.category && (
                  <small className="text-muted">{suggestion.category}</small>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Toggle Button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          className="btn btn-outline-primary"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter className="me-2" />
          Filters
        </button>
        
        <div className="d-flex gap-2">
          <select
            className="form-select form-select-sm"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="createdAt">Latest</option>
            <option value="price">Price</option>
            <option value="name">Name</option>
            <option value="averageRating">Rating</option>
          </select>
          
          <select
            className="form-select form-select-sm"
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel border rounded p-3 bg-light">
          <div className="row g-3">
            {/* Category Filter */}
            <div className="col-md-6">
              <label className="form-label fw-bold">Category</label>
              <select
                className="form-select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="col-md-6">
              <label className="form-label fw-bold">Price Range</label>
              <div className="row g-2">
                <div className="col-6">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    min={0}
                  />
                </div>
                <div className="col-6">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    min={0}
                  />
                </div>
              </div>
              <small className="text-muted">
                Range: ₹{priceRange.min} - ₹{priceRange.max}
              </small>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="d-flex justify-content-between mt-3">
            <button
              className="btn btn-outline-secondary"
              onClick={clearFilters}
            >
              Clear All
            </button>
            <button
              className="btn btn-primary"
              onClick={applyFilters}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters; 