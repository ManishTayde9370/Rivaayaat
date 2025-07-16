import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Zoom from 'react-medium-image-zoom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/cart/actions';
import { toggleWishlist, fetchWishlist } from '../redux/wishlist/actions';
import { toast } from 'react-toastify';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

import 'react-medium-image-zoom/dist/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import '../css/ProductPage.css';

const Product = () => {
  const [products, setProducts] = useState([]);
  const dispatch = useDispatch();
  const location = useLocation();
  const searchResults = location.state?.searchResults;
  const searchTerm = location.state?.searchTerm;
  const notFound = location.state?.notFound;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products', {
          withCredentials: true,
        });
        setProducts(res.data.products || []);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
    dispatch(fetchWishlist());
  }, [dispatch]);

  const displayProducts = searchResults || products;

  return (
    <div className="container py-5 product-page-container">
      <h2 className="section-heading text-center mb-5">
        {searchTerm ? `Search Results for "${searchTerm}"` : '👑 Explore Our Royal Collection'}
      </h2>
      {notFound && (
        <div className="alert alert-warning text-center" role="alert">
          No products found for "{searchTerm}".
        </div>
      )}
      <div className="row justify-content-center">
        {displayProducts.map((product, i) => (
          <ProductCard key={product._id || i} product={product} />
        ))}
      </div>
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

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    toast.success(`${product.name} added to cart!`, {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    navigate('/checkout/shipping');
  };

  const handleToggleWishlist = () => {
    dispatch(toggleWishlist(product._id));
    toast.info(`${product.name} ${isInWishlist ? 'removed from' : 'added to'} wishlist`, {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  return (
    <div className="col-md-4 col-sm-6 mb-4">
      <div className={`product-card shadow royal-border ${isOutOfStock ? 'out-of-stock-card' : ''}`} style={{ minHeight: 420, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div className="text-center p-3 position-relative" style={{ minHeight: 220 }}>
          {isOutOfStock && (
            <span className="badge bg-danger out-of-stock-badge position-absolute top-0 start-0 m-2">
              Out of Stock
            </span>
          )}
          <button
            className="btn btn-link position-absolute top-0 end-0 m-2 p-0"
            style={{ fontSize: 24, color: isInWishlist ? '#e63946' : '#bbb', zIndex: 2 }}
            onClick={handleToggleWishlist}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isInWishlist ? <FaHeart /> : <FaRegHeart />}
          </button>
          <Zoom>
            <img
              src={product.images[activeIndex] || fallbackImage}
              alt={product.name}
              onError={(e) => (e.target.src = fallbackImage)}
              className="main-product-image"
            />
          </Zoom>
        </div>

        <div className="thumbnail-row">
          {product.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`thumb-${index}`}
              onClick={() => setActiveIndex(index)}
              onError={(e) => (e.target.src = fallbackImage)}
              className={`thumbnail-img ${index === activeIndex ? 'active' : ''}`}
            />
          ))}
        </div>

        <div className="card-body text-center" style={{ minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Link to={`/product/${product._id}`} className="product-link">
            <h5 className="product-name">{product.name}</h5>
          </Link>

          {/* Removed product description here */}

          <h6 className="product-price">₹{product.price}</h6>
          <div className="d-flex justify-content-center gap-2 mt-2">
            <button
              className={`btn add-to-cart-btn ${isOutOfStock ? 'disabled-btn' : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              className={`btn btn-warning rounded-pill px-3 ${isOutOfStock ? 'disabled-btn' : ''}`}
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
