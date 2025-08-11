import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setShippingAddress } from '../redux/shipping/actions';
import { clearCart } from '../redux/cart/actions';
import axios from 'axios';
import { serverEndpoint } from '../components/config';
import { orderNotifications } from '../utils/notifications';
import { FaMapMarkerAlt, FaCreditCard, FaCheckCircle, FaArrowLeft, FaArrowRight, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import '../css/CheckoutFlow.css';
import '../css/theme.css';

const CheckoutFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Form states
  const [shippingForm, setShippingForm] = useState({
    address: '',
    city: '',
    postalCode: '',
    email: '',
    mobile: '',
    state: 'Maharashtra',
    country: 'India'
  });

  const cartItems = useSelector((state) => state?.cart?.items || []);
  const user = useSelector((state) => state?.user?.user || null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    if (!cartItems.length && !paymentSuccess) {
      navigate('/cart');
    }
  }, [cartItems, navigate, paymentSuccess]);

  const steps = [
    { id: 1, label: 'Shipping Address', icon: <FaMapMarkerAlt /> },
    { id: 2, label: 'Payment', icon: <FaCreditCard /> },
    { id: 3, label: 'Confirmation', icon: <FaCheckCircle /> }
  ];

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!shippingForm.address.trim() || !shippingForm.city.trim() || 
        !shippingForm.postalCode.trim() || !shippingForm.email.trim() || 
        !shippingForm.mobile.trim()) {
      setError('Please fill out all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingForm.email)) {
      setError('Please enter a valid email address');
      return;
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(shippingForm.mobile.replace(/\s/g, ''))) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    dispatch(setShippingAddress(shippingForm));
    setCurrentStep(2);
  };

  const handlePayment = async () => {
    if (isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please try again.');
        setIsLoading(false);
        return;
      }

      const { data: keyData } = await axios.get(
        `${serverEndpoint}/api/checkout/razorpay-key`
      );

      if (!keyData.key) {
        setError('Payment gateway configuration error.');
        setIsLoading(false);
        return;
      }

      const { data: order } = await axios.post(
        `${serverEndpoint}/api/checkout/create-order`,
        { amount: totalAmount },
        { withCredentials: true }
      );

      if (!order.id) {
        setError('Failed to create payment order.');
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
                shippingAddress: shippingForm,
              },
              { withCredentials: true }
            );

            setPaymentSuccess(true);
            orderNotifications.paymentSuccess();
            dispatch(clearCart());
            setCurrentStep(3);
          } catch (error) {
            console.error('Payment verification failed:', error);
            if (error.response?.status === 400) {
              setError(error.response.data.message);
            } else if (error.response?.status === 401) {
              setError('Session expired. Please login again.');
              navigate('/login');
            } else {
              setError('Payment verification failed. Please try again.');
            }
          }
        },
        prefill: {
          name: user?.name || 'Guest',
          email: user?.email || shippingForm.email,
        },
        theme: {
          color: '#E07A5F',
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
            setError(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError(`Payment failed: ${response.error.description || 'Unknown error'}`);
        orderNotifications.paymentFailed();
        setIsLoading(false);
      });

      rzp.on('payment.cancelled', function () {
        setError('Payment was cancelled by user.');
        setIsLoading(false);
      });

      rzp.open();
    } catch (err) {
      console.error('Error during payment:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        navigate('/login');
      } else if (err.response?.status === 400) {
        setError(err.response.data.message || 'Invalid payment data.');
      } else {
        setError('Payment initialization failed. Please try again.');
      }
      orderNotifications.paymentFailed();
    } finally {
      setIsLoading(false);
    }
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
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

  const renderShippingStep = () => (
    <div className="checkout-form-container">
      <h2 className="cinzel mb-4 text-center" style={{ color: 'var(--color-earth)' }}>
        <FaMapMarkerAlt className="me-2" />
        Shipping Address
      </h2>
      
      {error && (
        <div className="checkout-error">
          <FaExclamationTriangle />
          {error}
        </div>
      )}

      <form onSubmit={handleShippingSubmit}>
        <div className="checkout-form-group">
          <label className="checkout-form-label">Address</label>
          <input
            type="text"
            className="checkout-form-input"
            value={shippingForm.address}
            onChange={(e) => setShippingForm({...shippingForm, address: e.target.value})}
            placeholder="123 Main Street"
            required
          />
        </div>

        <div className="checkout-form-group">
          <label className="checkout-form-label">City</label>
          <input
            type="text"
            className="checkout-form-input"
            value={shippingForm.city}
            onChange={(e) => setShippingForm({...shippingForm, city: e.target.value})}
            placeholder="Mumbai"
            required
          />
        </div>

        <div className="checkout-form-group">
          <label className="checkout-form-label">Postal Code</label>
          <input
            type="text"
            className="checkout-form-input"
            value={shippingForm.postalCode}
            onChange={(e) => setShippingForm({...shippingForm, postalCode: e.target.value})}
            placeholder="400001"
            required
          />
        </div>

        <div className="checkout-form-group">
          <label className="checkout-form-label">Email</label>
          <input
            type="email"
            className="checkout-form-input"
            value={shippingForm.email}
            onChange={(e) => setShippingForm({...shippingForm, email: e.target.value})}
            placeholder="user@example.com"
            required
          />
        </div>

        <div className="checkout-form-group">
          <label className="checkout-form-label">Mobile Number</label>
          <input
            type="tel"
            className="checkout-form-input"
            value={shippingForm.mobile}
            onChange={(e) => setShippingForm({...shippingForm, mobile: e.target.value})}
            placeholder="9876543210"
            required
          />
        </div>

        <button type="submit" className="checkout-btn">
          Continue to Payment
          <FaArrowRight />
        </button>
      </form>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="checkout-form-container">
      <h2 className="cinzel mb-4 text-center" style={{ color: 'var(--color-earth)' }}>
        <FaCreditCard className="me-2" />
        Payment Details
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

      {error && (
        <div className="checkout-error">
          <FaExclamationTriangle />
          {error}
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
        onClick={handlePayment}
        disabled={isLoading}
        className="checkout-btn"
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
        onClick={() => setCurrentStep(1)}
        className="checkout-btn checkout-btn-secondary mt-3"
      >
        <FaArrowLeft />
        Back to Shipping
      </button>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="checkout-form-container text-center">
      <div className="checkout-success mb-4">
        <FaCheckCircle />
        Order Placed Successfully!
      </div>
      
      <h2 className="cinzel mb-4" style={{ color: 'var(--color-earth)' }}>
        Thank you for your purchase! 🎉
      </h2>
      
      <p className="mb-4" style={{ color: 'var(--color-earth)' }}>
        Your order has been confirmed and will be shipped to your address soon.
        You will receive an email confirmation with tracking details.
      </p>

      <div className="checkout-summary">
        <h3 className="checkout-summary-title">Order Details</h3>
        <p><strong>Total Paid:</strong> <span style={{ color: 'var(--color-terracotta)' }}>₹{totalAmount.toFixed(2)}</span></p>
        <p><strong>Shipping Address:</strong></p>
        <p>{shippingForm.address}, {shippingForm.city}</p>
        <p>{shippingForm.state} - {shippingForm.postalCode}, {shippingForm.country}</p>
      </div>

      <button 
        onClick={() => navigate('/')}
        className="checkout-btn"
      >
        Continue Shopping
        <FaArrowRight />
      </button>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderShippingStep();
      case 2:
        return renderPaymentStep();
      case 3:
        return renderSuccessStep();
      default:
        return renderShippingStep();
    }
  };

  return (
    <div className="checkout-container">
      <div className="container">
        <div className="checkout-header">
          <h1 className="cinzel" style={{ color: 'var(--color-earth)' }}>
            Secure Checkout
          </h1>
          <p style={{ color: 'var(--color-earth)' }}>
            Complete your purchase with our secure payment gateway
          </p>
        </div>

        <div className="checkout-steps">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`checkout-step ${
                currentStep === step.id ? 'active' : 
                currentStep > step.id ? 'completed' : ''
              }`}
            >
              <div className="checkout-step-number">
                {currentStep > step.id ? <FaCheckCircle /> : step.id}
              </div>
              <span className="checkout-step-label">{step.label}</span>
            </div>
          ))}
        </div>

        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default CheckoutFlow;
