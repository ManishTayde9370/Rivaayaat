import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../redux/cart/actions';
import { serverEndpoint } from '../components/config';

function CheckoutPayment() {
  const cartItems = useSelector((state) => state?.cart?.items || []);
  const user = useSelector((state) => state?.user?.user || null);
  const shippingAddress = useSelector((state) => state.shipping?.address || null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const paymentSuccessRef = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    if (!cartItems.length && !paymentSuccessRef.current) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    setIsLoading(true);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert('Razorpay SDK failed to load. Please try again.');
      setIsLoading(false);
      return;
    }

    try {
      const { data: keyData } = await axios.get(
        `${serverEndpoint}/api/checkout/razorpay-key`
      );

      const { data: order } = await axios.post(
        `${serverEndpoint}/api/checkout/create-order`,
        { amount: totalAmount },
        { withCredentials: true }
      );

      const options = {
        key: keyData.key,
        amount: order.amount,
        currency: 'INR',
        name: 'Rivaayaat',
        description: 'Order Payment',
        order_id: order.id,
        handler: async function (response) {
          try {
            if (!shippingAddress?.address || !shippingAddress?.city) {
              alert('Shipping address missing. Please go back and fill it.');
              navigate('/checkout/shipping');
              return;
            }

            const formattedCartItems = cartItems.map((item) => ({
              productId: item.productId || item._id, // Ensure productId is always present
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

            dispatch(clearCart());
            paymentSuccessRef.current = true;
            navigate('/checkout-success', { state: { order: result.order } });
          } catch (error) {
            console.error(
              'Payment verification failed:',
              error.response?.data || error.message
            );
            alert(
              'Payment was successful, but verification failed. Please contact support.'
            );
          }
        },
        prefill: {
          name: user?.name || 'Guest',
          email: user?.email || '',
        },
        theme: {
          color: '#6366F1',
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        alert('Payment failed. Please try again.');
      });

      rzp.open();
      setIsRazorpayOpen(true);
    } catch (err) {
      console.error('Error during payment:', err);
      alert('Payment initiation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-5 text-center">
      <h2>💳 Pay ₹{totalAmount.toFixed(2)}</h2>
      <button
        className="btn btn-success mt-4"
        onClick={handlePayment}
        disabled={isLoading || isRazorpayOpen || totalAmount <= 0}
      >
        {isLoading ? 'Processing...' : 'Pay with Razorpay'}
      </button>
    </div>
  );
}

export default CheckoutPayment;
