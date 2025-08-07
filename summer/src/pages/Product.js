import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Zoom from 'react-medium-image-zoom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/cart/actions';
import { toggleWishlist, fetchWishlist } from '../redux/wishlist/actions';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';

import 'react-medium-image-zoom/dist/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import '../css/ProductPage.css';
import LoadingBar from '../components/LoadingBar';
import ProductFilters from '../components/ProductFilters';
import { cartNotifications } from '../utils/notifications';
import '../css/theme.css';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  
  const dispatch = useDispatch();
  const location = useLocation();
  const searchResults = location.state?.searchResults;
  const searchTerm = location.state?.searchTerm;
  const notFound = location.state?.notFound;

  useEffect(() => {
    fetchProducts();
    dispatch(fetchWishlist());
  }, [dispatch, currentPage, filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...filters
      });

      const res = await axios.get(`http://localhost:5000/api/products?${params}`, {
        withCredentials: true,
      });
      
      if (res.data.success) {
        setProducts(res.data.products || []);
        setPagination(res.data.pagination || {});
        setError(null);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      setError('Failed to load products. Please try again later.');
    }
    setLoading(false);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const displayProducts = searchResults || products;

  return (
    <div className="container py-5 product-page-container">
      <h2 className="cinzel text-center mb-5" style={{ color: 'var(--color-maroon)' }}>
        {searchTerm ? `Search Results for "${searchTerm}"` : '👑 Explore Our Royal Collection'}
      </h2>
      
      {/* Product Filters */}
      <ProductFilters 
        onFiltersChange={handleFiltersChange}
        currentFilters={filters}
      />

      {/* Loading and Error States */}
      {loading && <div className="d-flex justify-content-center my-5"><LoadingBar /></div>}
      {error && <div className="alert alert-danger text-center" role="alert">{error}</div>}
      {notFound && (
        <div className="alert alert-warning text-center" role="alert">
          No products found for "{searchTerm}".
        </div>
      )}

      {/* Products Grid */}
      <div className="row justify-content-center">
        {displayProducts.map((product, i) => (
          <ProductCard key={product._id || i} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center mt-5">
          <nav aria-label="Product pagination">
            <ul className="pagination">
              <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </button>
              </li>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <li key={page} className={`page-item ${page === pagination.currentPage ? 'active' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                </li>
              ))}
              
              <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* No Products Found */}
      {!loading && !error && displayProducts.length === 0 && (
        <div className="text-center py-5">
          <h4 className="text-muted">No products found</h4>
          <p className="text-muted">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
};

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const fallbackImage = '/fallback.jpg';
  const isOutOfStock = product.stock === 0;
  const wishlist = useSelector((state) => state.wishlist.items);
  const isInWishlist = wishlist.some((item) => item._id === product._id);

  // // Bell sound for add-to-cart
  // const playBell = () => {
  //   const audio = new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae5b2.mp3');
  //   audio.play();
  // };

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    cartNotifications.added(product.name);
    // playBell();
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    navigate('/checkout/shipping');
  };

  const handleToggleWishlist = async () => {
    try {
      await dispatch(toggleWishlist(product._id));
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };

  return (
    <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
      <div className="miniature-border h-100 product-card" style={{ background: 'var(--color-ivory)' }}>
        <div className="product-image-container position-relative">
          {product.images && product.images.length > 0 ? (
            <Zoom>
              <img
                src={product.images[activeIndex] || fallbackImage}
                className="card-img-top product-image"
                alt={product.name}
                onError={(e) => {
                  e.target.src = fallbackImage;
                }}
                style={{ borderRadius: 12, border: '2px solid var(--color-gold)', objectFit: 'cover', height: 220 }}
              />
            </Zoom>
          ) : (
            <img
              src={fallbackImage}
              className="card-img-top product-image"
              alt="Product placeholder"
              style={{ borderRadius: 12, border: '2px solid var(--color-gold)', objectFit: 'cover', height: 220 }}
            />
          )}
          {/* Image Navigation */}
          {product.images && product.images.length > 1 && (
            <div className="image-nav">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  className={`image-nav-dot ${index === activeIndex ? 'active' : ''}`}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
          )}
          {/* Wishlist Button */}
          <button
            className="wishlist-btn position-absolute top-0 end-0 m-2"
            onClick={handleToggleWishlist}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isInWishlist ? <FaHeart className="text-danger" /> : <FaRegHeart />}
          </button>
          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div className="position-absolute top-0 start-0 m-2">
              <span className="badge bg-danger">Out of Stock</span>
            </div>
          )}
          {/* Rating Badge */}
          {product.averageRating > 0 && (
            <div className="position-absolute bottom-0 start-0 m-2">
              <span className="badge bg-warning text-dark">
                <FaStar style={{ marginBottom: 2 }} /> {product.averageRating} ({product.numReviews})
              </span>
            </div>
          )}
        </div>
        <div className="card-body d-flex flex-column">
          <h5 className="cinzel product-title mb-1" style={{ color: 'var(--color-maroon)' }}>
            <Link to={`/product/${product._id}`} className="text-decoration-none">
              {product.name}
            </Link>
          </h5>
          {product.category && (
            <p className="card-text text-muted small mb-2 cinzel">
              {product.category}
            </p>
          )}
          <p className="card-text product-description flex-grow-1" style={{ color: 'var(--color-black)' }}>
            {product.description?.length > 100
              ? `${product.description.substring(0, 100)}...`
              : product.description}
          </p>
          <div className="product-price mb-3 cinzel" style={{ color: 'var(--color-gold)', fontSize: '1.2rem' }}>
            ₹{product.price}
            {product.stock > 0 && (
              <small className="text-muted ms-2">({product.stock} in stock)</small>
            )}
          </div>
          <div className="product-actions">
            <button
              className="btn btn-dark btn-sm me-2 diya-flicker"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              Add to Cart
            </button>
            <button
              className="btn btn-outline-dark btn-sm"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
