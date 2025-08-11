import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../redux/cart/actions';
import { serverEndpoint } from '../components/config';
import { orderNotifications } from '../utils/notifications';
import { FaCreditCard, FaExclamationTriangle, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import '../css/theme.css';
import '../css/CheckoutFlow.css';

function CheckoutPayment() {
  const cartItems = useSelector((state) => state?.cart?.items || []);
  const user = useSelector((state) => state?.user?.user || null);
  const shippingAddress = useSelector((state) => state.shipping?.address || null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const paymentSuccessRef = useRef(false);
  const razorpayInstanceRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    if (!cartItems.length && !paymentSuccessRef.current) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Cleanup function for Razorpay instance
  useEffect(() => {
    return () => {
      if (razorpayInstanceRef.current) {
        razorpayInstanceRef.current.close();
      }
    };
  }, []);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      // Check if script is already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const validatePaymentData = () => {
    if (!shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.postalCode) {
      setPaymentError('Shipping address is incomplete. Please go back and fill it.');
      return false;
    }

    if (totalAmount <= 0) {
      setPaymentError('Invalid order amount.');
      return false;
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      setPaymentError('Cart is empty.');
      return false;
    }

    // Validate each cart item
    for (const item of cartItems) {
      if (!item.productId && !item._id) {
        setPaymentError('Invalid product data.');
        return false;
      }
      if (!item.name || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
        setPaymentError('Invalid product information.');
        return false;
      }
      if (item.price <= 0 || item.quantity <= 0) {
        setPaymentError('Invalid product price or quantity.');
        return false;
      }
    }

    return true;
  };

  const handlePayment = async () => {
    if (isLoading || isRazorpayOpen) return;

    setPaymentError(null);
    setIsLoading(true);

    try {
      // Validate payment data
      if (!validatePaymentData()) {
        setIsLoading(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPaymentError('Failed to load payment gateway. Please try again.');
        setIsLoading(false);
        return;
      }

      // Get Razorpay key
      const { data: keyData } = await axios.get(
        `${serverEndpoint}/api/checkout/razorpay-key`
      );

      if (!keyData.key) {
        setPaymentError('Payment gateway configuration error.');
        setIsLoading(false);
        return;
      }

      // Create order
      const { data: order } = await axios.post(
        `${serverEndpoint}/api/checkout/create-order`,
        { amount: totalAmount },
        { withCredentials: true }
      );

      if (!order.id) {
        setPaymentError('Failed to create payment order.');
        setIsLoading(false);
        return;
      }

      const options = {
        key: keyData.key,
        amount: order.amount,
        currency: 'INR',
        name: 'Rivaayaat',
        description: 'Order Payment',
        order_id: order.id,
        handler: async function (response) {
          try {
            if (!validatePaymentData()) {
              navigate('/checkout-flow');
              return;
            }

            const formattedCartItems = cartItems.map((item) => ({
              productId: item.productId || item._id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image || '',
            }));

            const { data: result } = await axios.post(
              `${serverEndpoint}/api/checkout/verify-and-place-order`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                cartItems: formattedCartItems,
                amount: totalAmount,
                shippingAddress,
              },
              { withCredentials: true }
            );

            paymentSuccessRef.current = true;
            orderNotifications.paymentSuccess();
            navigate('/checkout-success', { state: { order: result.order } });
          } catch (error) {
            console.error(
              'Payment verification failed:',
              error.response?.data || error.message
            );
            
            // Handle specific error cases
            if (error.response?.status === 400) {
              orderNotifications.verificationFailed(error.response.data.message);
            } else if (error.response?.status === 401) {
              orderNotifications.verificationFailed('Session expired. Please login again.');
              navigate('/login');
            } else {
              orderNotifications.verificationFailed();
            }
          }
        },
        prefill: {
          name: user?.name || 'Guest',
          email: user?.email || '',
        },
        theme: {
          color: '#6366F1',
        },
        modal: {
          ondismiss: function() {
            setIsRazorpayOpen(false);
            setPaymentError(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      razorpayInstanceRef.current = rzp;

      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setPaymentError(`Payment failed: ${response.error.description || 'Unknown error'}`);
        orderNotifications.paymentFailed();
        setIsRazorpayOpen(false);
      });

      rzp.on('payment.cancelled', function () {
        setPaymentError('Payment was cancelled by user.');
        setIsRazorpayOpen(false);
      });

      rzp.open();
      setIsRazorpayOpen(true);
    } catch (err) {
      console.error('Error during payment:', err);
      
      if (err.response?.status === 401) {
        setPaymentError('Session expired. Please login again.');
        navigate('/login');
      } else if (err.response?.status === 400) {
        setPaymentError(err.response.data.message || 'Invalid payment data.');
      } else {
        setPaymentError('Payment initialization failed. Please try again.');
      }
      
      orderNotifications.paymentFailed();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="container">
        <div className="checkout-header">
          <h1 className="cinzel" style={{ color: 'var(--color-earth)' }}>
            Payment Details
          </h1>
          <p style={{ color: 'var(--color-earth)' }}>
            Complete your purchase securely
          </p>
        </div>

        <div className="checkout-form-container">
          <h2 className="cinzel mb-4 text-center" style={{ color: 'var(--color-earth)' }}>
            <FaCreditCard className="me-2" />
            Secure Payment
          </h2>

          <div className="checkout-summary">
            <h3 className="checkout-summary-title">Order Summary</h3>
            {cartItems.map((item, index) => (
              <div key={index} className="checkout-item">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="checkout-item-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/60x60?text=Product';
                  }}
                />
                <div className="checkout-item-details">
                  <div className="checkout-item-name">{item.name}</div>
                  <div className="checkout-item-price">₹{item.price}</div>
                </div>
                <span className="checkout-item-quantity">Qty: {item.quantity}</span>
              </div>
            ))}
            <div className="checkout-total">
              <span className="checkout-total-label">Total Amount:</span>
              <span className="checkout-total-amount">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {paymentError && (
            <div className="checkout-error">
              <FaExclamationTriangle />
              {paymentError}
            </div>
          )}

          <div className="payment-methods">
            <div className="payment-method selected">
              <div className="payment-method-icon">💳</div>
              <div className="payment-method-details">
                <div className="payment-method-name">Razorpay Secure Payment</div>
                <div className="payment-method-description">Credit/Debit Cards, UPI, Net Banking</div>
              </div>
            </div>
          </div>

          <button
            className="checkout-btn"
            onClick={handlePayment}
            disabled={isLoading || isRazorpayOpen || totalAmount <= 0}
          >
            {isLoading ? (
              <>
                <div className="checkout-spinner"></div>
                Processing Payment...
              </>
            ) : (
              <>
                Pay ₹{totalAmount.toFixed(2)}
                <FaCreditCard />
              </>
            )}
          </button>

          <button 
            onClick={() => navigate('/checkout-flow')}
            className="checkout-btn checkout-btn-secondary mt-3"
          >
            <FaArrowLeft />
            Back to Shipping
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPayment;
