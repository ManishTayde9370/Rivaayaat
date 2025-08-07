import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import Zoom from 'react-medium-image-zoom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartWithValidation } from '../redux/cart/actions';
import { toggleWishlist, fetchWishlist } from '../redux/wishlist/actions';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaShoppingCart, FaEye, FaFilter, FaSort } from 'react-icons/fa';

import 'react-medium-image-zoom/dist/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import '../css/ProductPage.css';
import LoadingBar from '../components/LoadingBar';
import ProductFilters from '../components/ProductFilters';
import { cartNotifications, showNotification } from '../utils/notifications';

// Debounce function for search and filter operations
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Product = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [addingToCart, setAddingToCart] = useState(new Set());
  const [retryCount, setRetryCount] = useState(0);
  
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const userDetails = useSelector(state => state.user);
  const wishlist = useSelector(state => state.wishlist.items) || [];
  
  const searchResults = location.state?.searchResults;
  const searchTerm = location.state?.searchTerm;
  const notFound = location.state?.notFound;

  // Debounced filters to prevent excessive API calls
  const debouncedFilters = useDebounce(filters, 300);

  // Memoized wishlist IDs for efficient lookup
  const wishlistIds = useMemo(() => 
    new Set(wishlist.map(item => item.product?._id || item.productId || item._id)),
    [wishlist]
  );

  // Fetch products with improved error handling and caching
  const fetchProducts = useCallback(async (page = currentPage, filterOptions = debouncedFilters, isRetry = false) => {
    if (!isRetry) {
      setLoading(true);
    } else {
      setFiltersLoading(true);
    }
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page,
        limit: 12,
        ...filterOptions
      });

      const response = await axios.get(`http://localhost:5000/api/products?${params}`, {
        withCredentials: true,
        timeout: 10000, // 10 second timeout
      });

      if (response.data?.success) {
        setProducts(response.data.products || []);
        setPagination(response.data.pagination || {});
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error(response.data?.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      
      if (error.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your connection and try again.');
      } else if (error.response?.status === 500) {
        setError('Server error. Our team has been notified. Please try again later.');
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to load products');
      }
      
      // Don't clear products on filter errors, only on initial load errors
      if (!isRetry) {
        setProducts([]);
        setPagination({});
      }
    } finally {
      setLoading(false);
      setFiltersLoading(false);
    }
  }, [currentPage, debouncedFilters]);

  // Initial load and wishlist fetch
  useEffect(() => {
    if (searchResults) {
      setProducts(searchResults);
      setLoading(false);
    } else {
      fetchProducts(1, debouncedFilters);
    }
    
    // Only fetch wishlist if user is logged in
    if (userDetails?.email) {
      dispatch(fetchWishlist());
    }
  }, []);

  // Handle filter and page changes
  useEffect(() => {
    if (!searchResults && debouncedFilters !== filters) {
      setCurrentPage(1); // Reset to first page when filters change
      fetchProducts(1, debouncedFilters, true);
    }
  }, [debouncedFilters, fetchProducts, searchResults]);

  // Handle page changes
  useEffect(() => {
    if (!searchResults && currentPage > 1) {
      fetchProducts(currentPage, debouncedFilters, true);
    }
  }, [currentPage, fetchProducts, searchResults]);

  // Optimized add to cart function
  const handleAddToCart = useCallback(async (product) => {
    if (!userDetails?.email) {
      showNotification.warning('Please log in to add items to cart');
      navigate('/login');
      return;
    }

    if (addingToCart.has(product._id)) {
      return; // Prevent duplicate requests
    }

    setAddingToCart(prev => new Set(prev).add(product._id));
    
    try {
      await dispatch(addToCartWithValidation(product));
    } catch (error) {
      console.error('Add to cart error:', error);
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(product._id);
        return newSet;
      });
    }
  }, [dispatch, userDetails, navigate, addingToCart]);

  // Optimized wishlist toggle
  const handleWishlistToggle = useCallback(async (productId) => {
    if (!userDetails?.email) {
      showNotification.warning('Please log in to manage wishlist');
      navigate('/login');
      return;
    }

    try {
      await dispatch(toggleWishlist(productId));
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      showNotification.error('Failed to update wishlist');
    }
  }, [dispatch, userDetails, navigate]);

  // Filter handling
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  // Page change handling
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Retry function for error states
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    fetchProducts(currentPage, debouncedFilters);
  }, [fetchProducts, currentPage, debouncedFilters]);

  // Memoized product cards to prevent unnecessary re-renders
  const ProductCard = useMemo(() => {
    return ({ product }) => {
      const isInWishlist = wishlistIds.has(product._id);
      const isAddingToCartThis = addingToCart.has(product._id);
      
      return (
        <div className="col-md-6 col-lg-4 mb-4" key={product._id}>
          <div className="product-card h-100 shadow-sm">
            <div className="product-image-container position-relative">
              <Zoom>
                <img
                  src={product.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={product.name}
                  className="product-image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                  }}
                />
              </Zoom>
              
              {/* Wishlist Button */}
              <button
                className="wishlist-btn position-absolute top-0 end-0 m-2 btn btn-sm"
                onClick={(e) => {
                  e.preventDefault();
                  handleWishlistToggle(product._id);
                }}
                aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                disabled={!userDetails?.email}
              >
                {isInWishlist ? (
                  <FaHeart className="text-danger" />
                ) : (
                  <FaRegHeart className="text-muted" />
                )}
              </button>
              
              {/* Stock Badge */}
              {product.stock <= 0 && (
                <span className="position-absolute top-0 start-0 m-2 badge bg-danger">
                  Out of Stock
                </span>
              )}
              
              {product.stock > 0 && product.stock <= 5 && (
                <span className="position-absolute top-0 start-0 m-2 badge bg-warning">
                  Only {product.stock} left
                </span>
              )}
            </div>
            
            <div className="card-body d-flex flex-column">
              <h6 className="product-title text-truncate" title={product.name}>
                {product.name}
              </h6>
              
              <p className="product-description text-muted small">
                {product.description?.substring(0, 80)}
                {product.description?.length > 80 && '...'}
              </p>
              
              <div className="product-details">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="price fw-bold text-primary">₹{product.price}</span>
                  {product.category && (
                    <span className="badge bg-light text-dark">{product.category}</span>
                  )}
                </div>
                
                {product.artisanName && (
                  <small className="text-muted">By {product.artisanName}</small>
                )}
              </div>
              
              <div className="mt-auto pt-2">
                <div className="row g-2">
                  <div className="col-6">
                    <button
                      className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0 || isAddingToCartThis || !userDetails?.email}
                    >
                      {isAddingToCartThis ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <FaShoppingCart className="me-1" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                  <div className="col-6">
                    <Link
                      to={`/product/${product._id}`}
                      className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center"
                    >
                      <FaEye className="me-1" />
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };
  }, [wishlistIds, addingToCart, userDetails, handleAddToCart, handleWishlistToggle]);

  // Pagination component
  const PaginationComponent = useMemo(() => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null;
    
    const pages = [];
    const totalPages = pagination.totalPages;
    const current = pagination.currentPage || currentPage;
    
    // Show first page
    if (current > 3) {
      pages.push(1);
      if (current > 4) pages.push('...');
    }
    
    // Show pages around current
    for (let i = Math.max(1, current - 2); i <= Math.min(totalPages, current + 2); i++) {
      pages.push(i);
    }
    
    // Show last page
    if (current < totalPages - 2) {
      if (current < totalPages - 3) pages.push('...');
      pages.push(totalPages);
    }
    
    return (
      <nav aria-label="Product pagination">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${current === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(current - 1)}
              disabled={current === 1}
            >
              Previous
            </button>
          </li>
          
          {pages.map((page, index) => (
            <li key={index} className={`page-item ${page === current ? 'active' : page === '...' ? 'disabled' : ''}`}>
              {page === '...' ? (
                <span className="page-link">...</span>
              ) : (
                <button
                  className="page-link"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              )}
            </li>
          ))}
          
          <li className={`page-item ${current === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(current + 1)}
              disabled={current === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  }, [pagination, currentPage, handlePageChange]);

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <LoadingBar />
          <p className="mt-3 text-muted">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="alert alert-danger">
            <h5>Oops! Something went wrong</h5>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={handleRetry}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Search Results Header */}
      {searchTerm && (
        <div className="mb-4">
          <h2>Search Results for "{searchTerm}"</h2>
          <p className="text-muted">{products.length} products found</p>
        </div>
      )}
      
      {notFound && (
        <div className="alert alert-info">
          No products found for your search. Showing all products instead.
        </div>
      )}

      {/* Filters */}
      {!searchResults && (
        <div className="row mb-4">
          <div className="col-12">
            <ProductFilters
              onFilterChange={handleFilterChange}
              loading={filtersLoading}
            />
          </div>
        </div>
      )}

      {/* Filter Loading Indicator */}
      {filtersLoading && (
        <div className="text-center mb-3">
          <div className="spinner-border spinner-border-sm text-primary" />
          <span className="ms-2 text-muted">Applying filters...</span>
        </div>
      )}

      {/* Error Banner (when there are existing products) */}
      {error && products.length > 0 && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
            aria-label="Close"
          />
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <p className="text-muted mb-0">
                  Showing {products.length} of {pagination.total || products.length} products
                </p>
                <div className="d-flex align-items-center">
                  <FaSort className="me-1 text-muted" />
                  <small className="text-muted">Sorted by relevance</small>
                </div>
              </div>
            </div>
          </div>
          
          <div className="row">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          
          {/* Pagination */}
          <div className="row mt-4">
            <div className="col-12">
              {PaginationComponent}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-5">
          <div className="mb-4">
            <FaFilter size={48} className="text-muted" />
          </div>
          <h4>No products found</h4>
          <p className="text-muted">Try adjusting your filters or search terms</p>
          {Object.keys(filters).length > 0 && (
            <button
              className="btn btn-outline-primary"
              onClick={() => setFilters({})}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Product;