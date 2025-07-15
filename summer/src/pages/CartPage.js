import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  removeFromCart,
  clearCart,
  persistCartToBackend,
} from '../redux/cart/actions';

import '../css/CartPage.css'; // Optional custom CSS

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
    dispatch(clearCart());
  };

  const handleCheckout = () => {
    navigate('/checkout/shipping');
  };

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center royal-heading">🛒 Your Cart</h2>

      {cart.length === 0 ? (
        <p className="text-center">Your cart is empty.</p>
      ) : (
        <>
          <div className="row g-4">
            {cart.map((item) => (
              <div key={item.productId || item._id} className="col-md-6 col-lg-4">
                <div className="card shadow-sm h-100 border-0 cart-item-card">
                  <div className="row g-0 align-items-center">
                    <div className="col-4 d-flex justify-content-center p-2">
                      <img
                        src={item.images?.[0] || '/fallback.jpg'}
                        alt={item.name}
                        className="img-fluid rounded"
                        style={{
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/fallback.jpg';
                        }}
                      />
                    </div>
                    <div className="col-8">
                      <div className="card-body">
                        <h5 className="card-title mb-1">{item.name}</h5>
                        <p className="mb-1 text-muted">
                          Quantity: {item.quantity}
                        </p>
                        <p className="mb-1 text-muted">Price: ₹{item.price}</p>
                        <button
                          className="btn btn-sm btn-outline-danger mt-2"
                          onClick={() =>
                            handleRemove(item.productId || item._id)
                          }
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

          <div className="mt-5 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <h4 className="fw-bold royal-total mb-0">
              Total: ₹{total.toFixed(2)}
            </h4>
            <div className="d-flex gap-3">
              <button
                className="btn btn-outline-secondary"
                onClick={handleClearCart}
              >
                Clear Cart
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
