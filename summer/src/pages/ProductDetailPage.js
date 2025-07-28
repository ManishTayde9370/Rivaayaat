import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Zoom from 'react-medium-image-zoom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/cart/actions';
import { toggleWishlist } from '../redux/wishlist/actions';
import 'react-medium-image-zoom/dist/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import { FaInstagram, FaFacebook, FaGlobe, FaStar } from 'react-icons/fa';
import LoadingBar from '../components/LoadingBar';
import ProductReviewForm from '../components/ProductReviewForm';
import ProductReviews from '../components/ProductReviews';
import { cartNotifications } from '../utils/notifications';

const API_BASE_URL = 'http://localhost:5000';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const wishlist = useSelector((state) => state.wishlist.items);
  const isInWishlist = wishlist.some((item) => item._id === id);
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products/${id}`, {
          withCredentials: true,
        });
        setProduct(res.data.product);
        setError(null);
      } catch (err) {
        setError('Failed to load product details. Please try again later.');
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    cartNotifications.added(product.name);
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    navigate('/checkout/shipping');
  };

  const handleToggleWishlist = async () => {
    try {
      await dispatch(toggleWishlist(id));
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };

  const handleReviewSubmitted = (reviewData) => {
    // Refresh product data to get updated reviews
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products/${id}`, {
          withCredentials: true,
        });
        setProduct(res.data.product);
      } catch (err) {
        console.error('Error refreshing product:', err);
      }
    };
    fetchProduct();
    setShowReviewForm(false);
  };

  if (error) {
    return <div className="alert alert-danger text-center mt-5">{error}</div>;
  }

  if (!product) {
    return <div className="d-flex justify-content-center my-5"><LoadingBar /></div>;
  }

  return (
    <div className="container py-5">
      <div className="row align-items-center">
        {/* Image Section */}
        <div className="col-md-6 mb-4">
          <Zoom>
            <img
              src={product.images?.[activeImageIndex] || '/fallback.jpg'}
              alt={product.name}
              className="img-fluid rounded"
              style={{
                border: '1px solid #fcecc5',
                borderRadius: '12px',
                objectFit: 'cover',
                height: '400px',
              }}
              onError={(e) => (e.target.src = '/fallback.jpg')}
            />
          </Zoom>

          <div className="d-flex mt-3">
            {product.images?.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`thumb-${i}`}
                onClick={() => setActiveImageIndex(i)}
                onError={(e) => (e.target.src = '/fallback.jpg')}
                className={`me-2 rounded border ${i === activeImageIndex ? 'border-warning' : 'border-light'}`}
                style={{
                  width: '70px',
                  height: '70px',
                  objectFit: 'cover',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>

        {/* Product Info Section */}
        <div className="col-md-6">
          <h1 className="mb-3">{product.name}</h1>
          
          {product.category && (
            <p className="text-muted mb-2">
              <strong>Category:</strong> {product.category}
            </p>
          )}

          <p className="mb-3">{product.description}</p>

          <h3 className="text-primary mb-3">₹{product.price}</h3>

          {/* Enhanced Rating Display */}
          {product.averageRating > 0 && (
            <div className="mb-3">
              <div className="d-flex align-items-center mb-2">
                <div className="stars me-2">
                  {[...Array(5)].map((_, index) => (
                    <FaStar
                      key={index}
                      color={index < Math.round(product.averageRating) ? "#ffc107" : "#e4e5e9"}
                      size={20}
                    />
                  ))}
                </div>
                <span className="fw-bold">{product.averageRating.toFixed(1)}</span>
                <span className="text-muted ms-2">({product.numReviews} reviews)</span>
              </div>
            </div>
          )}

          <p>
            <strong>Stock:</strong> {product.stock > 0 ? product.stock : 'Out of Stock'}
          </p>

          <div className="d-flex gap-3 mt-3">
            <button
              className="btn btn-dark rounded-pill px-4"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              className="btn btn-warning rounded-pill px-4"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              Buy Now
            </button>
            <button
              className={`btn rounded-pill px-4 ${isInWishlist ? 'btn-outline-danger' : 'btn-outline-secondary'}`}
              onClick={handleToggleWishlist}
            >
              {isInWishlist ? '❤️ Wishlisted' : '🤍 Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>

      {/* Artisan Info Section */}
      {product.artisan && (
        <div className="rivaayat-card" style={{ maxWidth: 500, margin: '2em auto', textAlign: 'center', padding: '2em 1em' }}>
          {product.artisan.photo && (
            <img
              src={product.artisan.photo}
              alt={product.artisan.name}
              style={{
                width: '160px',
                height: '160px',
                objectFit: 'cover',
                borderRadius: '50%',
                marginBottom: '1em',
                border: '4px solid var(--border-color)',
                boxShadow: '0 4px 16px rgba(141,85,36,0.12)'
              }}
            />
          )}
          <h2 className="rivaayat-heading" style={{ marginBottom: '0.5em' }}>
            Meet the Artisan: {product.artisan.name}
          </h2>
          <p style={{ color: 'var(--primary-color)', fontSize: '1.1em', marginBottom: '1em' }}>
            {product.artisan.bio}
          </p>
          {product.artisan.quote && (
            <blockquote style={{ fontStyle: 'italic', color: 'var(--accent-color)', margin: '1em 0' }}>
              "{product.artisan.quote}"
            </blockquote>
          )}
          <div style={{ marginTop: '0.5em', fontSize: '1.5em' }}>
            {product.artisan.social?.instagram && (
              <a href={product.artisan.social.instagram} target="_blank" rel="noopener noreferrer" style={{ margin: '0 10px', color: 'var(--accent-color)' }}>
                <FaInstagram />
              </a>
            )}
            {product.artisan.social?.facebook && (
              <a href={product.artisan.social.facebook} target="_blank" rel="noopener noreferrer" style={{ margin: '0 10px', color: 'var(--accent-color)' }}>
                <FaFacebook />
              </a>
            )}
            {product.artisan.social?.website && (
              <a href={product.artisan.social.website} target="_blank" rel="noopener noreferrer" style={{ margin: '0 10px', color: 'var(--accent-color)' }}>
                <FaGlobe />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-5">
        <div className="row">
          <div className="col-lg-8">
            <ProductReviews 
              reviews={product.reviews || []}
              averageRating={product.averageRating || 0}
              numReviews={product.numReviews || 0}
            />
          </div>
          
          <div className="col-lg-4">
            {user ? (
              <div className="review-form-sidebar">
                <ProductReviewForm 
                  productId={id}
                  onReviewSubmitted={handleReviewSubmitted}
                />
              </div>
            ) : (
              <div className="text-center p-4">
                <h6>Write a Review</h6>
                <p className="text-muted">Please login to write a review</p>
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/login')}
                >
                  Login to Review
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
