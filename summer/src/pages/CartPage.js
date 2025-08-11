import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  removeFromCart,
  clearCartFromBackend,
  persistCartToBackend,
} from '../redux/cart/actions';

import '../css/CartPage.css'; // Optional custom CSS
import '../css/theme.css';

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
    navigate('/checkout/shipping');
  };

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="container py-5">
      <h2 className="cinzel mb-4 text-center" style={{ color: 'var(--color-maroon)' }}>🛒 Your Cart</h2>

      {cart.length === 0 ? (
        <p className="text-center">Your cart is empty.</p>
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

          <div className="mt-5 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <h4 className="cinzel fw-bold royal-total mb-0" style={{ color: 'var(--color-gold)' }}>
              <span role="img" aria-label="diya">🪔</span> Total: ₹{total.toFixed(2)}
            </h4>
            <div className="d-flex gap-3">
              <button
                className="btn btn-outline-secondary"
                onClick={handleClearCart}
              >
                Clear Cart
              </button>
              <button
                className="btn btn-dark scroll-dropdown px-4 py-2"
                onClick={handleCheckout}
                disabled={cart.length === 0}
                style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.1rem', color: 'var(--color-gold)', border: '2px solid var(--color-gold)' }}
              >
                <span role="img" aria-label="scroll">📜</span> Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
