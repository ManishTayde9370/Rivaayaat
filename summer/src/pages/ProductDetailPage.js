import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Zoom from 'react-medium-image-zoom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/cart/actions';
import { toggleWishlist } from '../redux/wishlist/actions';
import 'react-medium-image-zoom/dist/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import { FaInstagram, FaFacebook, FaGlobe, FaStar, FaVolumeUp } from 'react-icons/fa';
import LoadingBar from '../components/LoadingBar';
import ProductReviewForm from '../components/ProductReviewForm';
import ProductReviews from '../components/ProductReviews';
import { cartNotifications } from '../utils/notifications';
import '../css/theme.css';

const API_BASE_URL = 'http://localhost:5000';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showBackstory, setShowBackstory] = useState(false);
  const [soundPlaying, setSoundPlaying] = useState(false);

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

  // // Bell sound for add-to-cart
  // const playBell = () => {
  //   const audio = new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae5b2.mp3');
  //   audio.play();
  // };

  // Dummy soundscape (no actual sound file for now)
  const handleSoundscape = () => {
    setSoundPlaying((prev) => !prev);
    // Optionally play/pause a sound file here
  };

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
          <div className="miniature-border p-2" style={{ background: 'var(--color-ivory)' }}>
            <Zoom>
              <img
                src={product.images?.[activeImageIndex] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='}
                alt={product.name}
                className="img-fluid rounded"
                style={{
                  border: '2.5px solid var(--color-gold)',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  height: '400px',
                  boxShadow: '0 4px 24px rgba(123,34,48,0.08)'
                }}
                onError={(e) => (e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=')}
              />
            </Zoom>
            <div className="d-flex mt-3 justify-content-center">
              {product.images?.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`thumb-${i}`}
                  onClick={() => setActiveImageIndex(i)}
                  onError={(e) => (e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=')}
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
        </div>

        {/* Product Info Section */}
        <div className="col-md-6">
          <h1 className="cinzel mb-2" style={{ color: 'var(--color-maroon)' }}>{product.name}</h1>
          <div className="d-flex align-items-center mb-2">
            <button
              className={`btn btn-sm regal-sound-btn me-2${soundPlaying ? ' diya-flicker' : ''}`}
              onClick={handleSoundscape}
              title="Play regal soundscape"
            >
              <FaVolumeUp />
            </button>
            <span style={{ color: 'var(--color-peacock)', fontWeight: 500 }}>Regal Soundscape</span>
            {soundPlaying && <span className="ms-2" style={{ color: 'var(--color-gold)' }}>(Playing...)</span>}
          </div>

          <div className="d-flex gap-2 mb-3">
            <span className="badge bg-warning text-dark cinzel" style={{ fontSize: '1rem' }}>{product.category}</span>
            {product.origin && <span className="badge bg-info text-dark cinzel">{product.origin}</span>}
          </div>

          <div className="mb-3">
            <button
              className={`btn btn-outline-dark rounded-pill px-3 me-2${showBackstory ? ' active' : ''}`}
              onClick={() => setShowBackstory((prev) => !prev)}
            >
              Royal Backstory
            </button>
            {showBackstory && (
              <div className="scroll-dropdown mt-2 p-3" style={{ maxWidth: 420 }}>
                <div className="cinzel mb-2" style={{ color: 'var(--color-gold)' }}>The Royal Tale</div>
                <div style={{ color: 'var(--color-black)' }}>{product.backstory || 'This piece is inspired by centuries-old traditions and royal patronage.'}</div>
              </div>
            )}
          </div>

          <p className="mb-3" style={{ color: 'var(--color-black)' }}>{product.description}</p>

          <h3 className="cinzel mb-3" style={{ color: 'var(--color-gold)' }}>₹{product.price}</h3>

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
              className="btn btn-dark rounded-pill px-4 diya-flicker"
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
        <div className="miniature-border my-5 p-4" style={{ maxWidth: 600, margin: '2em auto', textAlign: 'center', background: 'var(--color-ivory)' }}>
          {product.artisan.photo && (
            <img
              src={product.artisan.photo}
              alt={product.artisan.name}
              style={{
                width: '120px',
                height: '120px',
                objectFit: 'cover',
                borderRadius: '50%',
                marginBottom: '1em',
                border: '4px solid var(--color-gold)',
                boxShadow: '0 4px 16px rgba(141,85,36,0.12)'
              }}
            />
          )}
          <h2 className="cinzel mb-1" style={{ color: 'var(--color-maroon)' }}>Artisan: {product.artisan.name}</h2>
          <div style={{ color: 'var(--color-peacock)', fontWeight: 500 }}>{product.artisan.region}</div>
          <div style={{ fontStyle: 'italic', color: 'var(--color-emerald)' }}>{product.artisan.bio}</div>
          {product.artisan.quote && (
            <blockquote style={{ fontStyle: 'italic', color: 'var(--color-gold)', margin: '1em 0' }}>
              “{product.artisan.quote}”
            </blockquote>
          )}
          <div style={{ marginTop: '0.5em', fontSize: '1.5em' }}>
            {product.artisan.social?.instagram && (
              <a href={product.artisan.social.instagram} target="_blank" rel="noopener noreferrer" style={{ margin: '0 10px', color: 'var(--color-peacock)' }}>
                <FaInstagram />
              </a>
            )}
            {product.artisan.social?.facebook && (
              <a href={product.artisan.social.facebook} target="_blank" rel="noopener noreferrer" style={{ margin: '0 10px', color: 'var(--color-peacock)' }}>
                <FaFacebook />
              </a>
            )}
            {product.artisan.social?.website && (
              <a href={product.artisan.social.website} target="_blank" rel="noopener noreferrer" style={{ margin: '0 10px', color: 'var(--color-peacock)' }}>
                <FaGlobe />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Cultural Footnotes Section */}
      <div className="container my-5">
        <div className="scroll-dropdown p-4" style={{ maxWidth: 700, margin: '0 auto' }}>
          <div className="cinzel mb-2" style={{ color: 'var(--color-gold)' }}>From the Royal Diaries</div>
          <div style={{ color: 'var(--color-black)' }}>{product.footnotes || 'This piece is part of a living tradition, cherished in royal courts and family rituals.'}</div>
        </div>
      </div>

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
