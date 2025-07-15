import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Zoom from 'react-medium-image-zoom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cart/actions';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

import 'react-medium-image-zoom/dist/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import '../css/ProductPage.css';

const Product = () => {
  const [products, setProducts] = useState([]);

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
  }, []);

  return (
    <div className="container py-5 product-page-container">
      <h2 className="section-heading text-center mb-5">
        👑 Explore Our Royal Collection
      </h2>

      <div className="row justify-content-center">
        {products.map((product, i) => (
          <ProductCard key={product._id || i} product={product} />
        ))}
      </div>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const [activeIndex, setActiveIndex] = useState(0);
  const fallbackImage = '/fallback.jpg';
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    toast.success(`${product.name} added to cart!`, {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  return (
    <div className="col-md-4 col-sm-6 mb-4">
      <div className={`product-card shadow royal-border ${isOutOfStock ? 'out-of-stock-card' : ''}`}>
        <div className="text-center p-3 position-relative">
          {isOutOfStock && (
            <span className="badge bg-danger out-of-stock-badge position-absolute top-0 start-0 m-2">
              Out of Stock
            </span>
          )}
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

        <div className="card-body text-center">
          <Link to={`/product/${product._id}`} className="product-link">
            <h5 className="product-name">{product.name}</h5>
          </Link>

          {/* Removed product description here */}

          <h6 className="product-price">₹{product.price}</h6>
          <button
            className={`btn add-to-cart-btn ${isOutOfStock ? 'disabled-btn' : ''}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;
