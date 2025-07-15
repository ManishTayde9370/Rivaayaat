import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Zoom from 'react-medium-image-zoom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/cart/actions';
import { toggleWishlist } from '../redux/wishlist/actions';
import { toast } from 'react-toastify';
import 'react-medium-image-zoom/dist/styles.css';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = 'http://localhost:5000';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const wishlist = useSelector((state) => state.wishlist.items);
  const isInWishlist = wishlist.some((item) => item._id === id);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products/${id}`, {
          withCredentials: true,
        });
        setProduct(res.data.product);
      } catch (err) {
        console.error('Error fetching product details:', err);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    toast.success(`${product.name} added to cart!`, {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  const handleToggleWishlist = () => {
    dispatch(toggleWishlist(id));
    toast.info(`${product.name} ${isInWishlist ? 'removed from' : 'added to'} wishlist`, {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  if (!product) {
    return <div className="text-center mt-5">Loading product details...</div>;
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
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Product Info Section */}
        <div className="col-md-6">
          <h2 style={{ color: '#5e3d19', fontFamily: 'Georgia', fontWeight: 'bold' }}>{product.name}</h2>
          <h4 className="text-muted mb-3">₹{product.price}</h4>
          <p>{product.description}</p>

          {/* Average Rating */}
          {product.averageRating && (
            <p>
              <strong>Rating:</strong>{' '}
              <span className="text-warning">
                {'★'.repeat(Math.round(product.averageRating))}
                {'☆'.repeat(5 - Math.round(product.averageRating))}
              </span>{' '}
              ({product.numReviews} reviews)
            </p>
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
              className={`btn rounded-pill px-4 ${isInWishlist ? 'btn-outline-danger' : 'btn-outline-secondary'}`}
              onClick={handleToggleWishlist}
            >
              {isInWishlist ? '❤️ Wishlisted' : '🤍 Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>

      {/* Future Review Section */}
      {/* <div className="mt-5">
        <h4>Reviews</h4>
        <ReviewList reviews={product.reviews} />
        <ReviewForm productId={id} />
      </div> */}
    </div>
  );
};

export default ProductDetailPage;
