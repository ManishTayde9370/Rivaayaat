import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  removeFromCart,
  clearCartFromBackend,
  persistCartToBackend,
} from '../redux/cart/actions';
import { FaShoppingCart, FaTrash, FaArrowRight, FaExclamationTriangle } from 'react-icons/fa';

import '../css/CartPage.css';
import '../css/theme.css';
import '../css/CheckoutFlow.css';

function CartPage() {
  const cart = useSelector((state) => state.cart?.items || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const initialRender = useRef(true);

  // ✅ Only persist to backend after the first render
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    dispatch(persistCartToBackend());
  }, [cart, dispatch]);

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleClearCart = () => {
    dispatch(clearCartFromBackend());
  };

  // // Bell sound for checkout
  // const playBell = () => {
  //   const audio = new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae5b2.mp3');
  //   audio.play();
  // };

  const handleCheckout = () => {
    // playBell();
    navigate('/checkout-flow');
  };

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="checkout-container">
      <div className="container">
        <div className="checkout-header">
          <h1 className="cinzel" style={{ color: 'var(--color-earth)' }}>
            <FaShoppingCart className="me-2" />
            Your Shopping Cart
          </h1>
          <p style={{ color: 'var(--color-earth)' }}>
            Review your items before checkout
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="checkout-form-container text-center">
            <div className="checkout-error">
              <FaExclamationTriangle />
              Your cart is empty
            </div>
            <p className="mt-3" style={{ color: 'var(--color-earth)' }}>
              Add some products to your cart to continue shopping.
            </p>
            <button 
              onClick={() => navigate('/product')}
              className="checkout-btn"
            >
              Continue Shopping
              <FaArrowRight />
            </button>
          </div>
        ) : (
        <>
          <div className="row g-4">
            {cart.map((item) => (
              <div key={item.productId || item._id} className="col-md-6 col-lg-4">
                <div className="miniature-border shadow-sm h-100 border-0 cart-item-card" style={{ background: 'var(--color-ivory)' }}>
                  <div className="row g-0 align-items-center">
                    <div className="col-4 d-flex justify-content-center p-2">
                      <img
                        src={item.images?.[0] || item.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='}
                        alt={item.name}
                        className="img-fluid rounded"
                        style={{
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          border: '2px solid var(--color-gold)'
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                        }}
                      />
                    </div>
                    <div className="col-8">
                      <div className="card-body">
                        <h5 className="cinzel card-title mb-1" style={{ color: 'var(--color-maroon)' }}>{item.name}</h5>
                        <p className="mb-1 text-muted">
                          Quantity: <span className="diya-flicker">{item.quantity}</span>
                        </p>
                        <p className="mb-1 text-muted">Price: ₹{item.price}</p>
                        <button
                          className="btn btn-sm btn-outline-danger mt-2"
                          onClick={() => handleRemove(item.productId || item._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-form-container">
            <div className="checkout-summary">
              <h3 className="checkout-summary-title">Cart Summary</h3>
              <div className="checkout-total">
                <span className="checkout-total-label">Total Amount:</span>
                <span className="checkout-total-amount">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="d-flex gap-3 justify-content-center">
              <button
                className="checkout-btn checkout-btn-secondary"
                onClick={handleClearCart}
              >
                <FaTrash />
                Clear Cart
              </button>
              <button
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                Proceed to Checkout
                <FaArrowRight />
              </button>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
}

export default CartPage;
