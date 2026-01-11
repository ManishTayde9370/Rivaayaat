import { Route, Routes, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef, useState, Suspense } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

import Applayout from './Layout/Applayout';
import AdminLayout from './Layout/AdminLayout';
import PublicHomeLayout from './Layout/PublicHomeLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';
import FAQs from './pages/FAQs';
import UserProfile from './pages/UserProfile';
import UserOrders from './pages/UserOrders';
import About from './pages/About';
import HomePublic from './pages/HomePublic';
import HomePrivate from './pages/HomePrivate';
import Product from './pages/Product';
import CartPage from './pages/CartPage';
import ProductDetailPage from './pages/ProductDetailPage';

import CheckoutShipping from './pages/CheckoutShipping';
import CheckoutPayment from './pages/CheckoutPayment';
import CheckoutSuccess from './pages/CheckoutSuccess';

import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import ManageProducts from './admin/ManageProducts';
import AddProduct from './admin/AddProduct';
import AdminContactMessages from './admin/AdminContactMessages';
import ManageOrders from './admin/ManageOrders';
import ManageUsers from './admin/ManageUsers';
import AdminStockNotifications from './admin/AdminStockNotifications';
import AdminLowStockAlerts from './admin/AdminLowStockAlerts';
import AdminReviewModeration from './admin/AdminReviewModeration';
import AdminProductImportExport from './admin/AdminProductImportExport';
import AdminCsvMappings from './admin/AdminCsvMappings';
import AdminScheduledExports from './admin/AdminScheduledExports';
import AdminSettings from './admin/AdminSettings';

import { serverEndpoint } from './components/config';
import { SET_USER, CLEAR_USER } from './redux/user/actions';
import { fetchCartFromBackend, clearCart } from './redux/cart/actions';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './css/theme.css';
import BrandStory from './pages/BrandStory';
import Blogs from './pages/Blogs';
import Careers from './pages/Careers';
import ShippingDetails from './pages/ShippingDetails';
import ReturnRefundPolicy from './pages/ReturnRefundPolicy';
import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TrackOrder from './pages/TrackOrder';
import NavbarPrivate from './components/NavbarPrivate';
import { fetchWishlist } from './redux/wishlist/actions';
import { toast } from 'react-toastify';
import Spinner from './components/spinner';

function App() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [showGlobalSpinner, setShowGlobalSpinner] = useState(false);
  const spinnerDelayRef = useRef(null);
  const userDetails = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await axios.get(`${serverEndpoint}/api/auth/is-user-logged-in`, {
          withCredentials: true,
        });

        if (res.data.success && res.data.userDetails) {
          dispatch({ type: SET_USER, payload: res.data.userDetails });
          await dispatch(fetchCartFromBackend());
        } else {
          dispatch({ type: CLEAR_USER });
          dispatch(clearCart());
        }
      } catch (err) {
        if (!(err.response && err.response.status === 401)) {
          console.error(err);
        }
        dispatch({ type: CLEAR_USER });
        dispatch(clearCart());
      } finally {
        setSessionChecked(true);
      }
    };

    restoreSession();
  }, [dispatch]);

  // Global axios loading spinner via interceptors
  useEffect(() => {
    const requestInterceptorId = axios.interceptors.request.use(
      (config) => {
        setPendingRequests((count) => count + 1);
        return config;
      },
      (error) => {
        setPendingRequests((count) => Math.max(0, count - 1));
        return Promise.reject(error);
      }
    );

    const responseInterceptorId = axios.interceptors.response.use(
      (response) => {
        setPendingRequests((count) => Math.max(0, count - 1));
        return response;
      },
      (error) => {
        setPendingRequests((count) => Math.max(0, count - 1));
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptorId);
      axios.interceptors.response.eject(responseInterceptorId);
    };
  }, []);

  // Avoid flicker: only show spinner if request takes >300ms
  useEffect(() => {
    if (pendingRequests > 0) {
      if (!spinnerDelayRef.current) {
        spinnerDelayRef.current = setTimeout(() => {
          setShowGlobalSpinner(true);
          spinnerDelayRef.current = null;
        }, 300);
      }
    } else {
      setShowGlobalSpinner(false);
      if (spinnerDelayRef.current) {
        clearTimeout(spinnerDelayRef.current);
        spinnerDelayRef.current = null;
      }
    }
  }, [pendingRequests]);

  // Socket.IO real-time updates
  useEffect(() => {
    if (!userDetails?._id) return;
    const socket = io(serverEndpoint, { withCredentials: true });
    socket.emit('register', userDetails._id);
    
    // Only handle essential real-time updates, not notifications
    socket.on('orderUpdated', () => {
      // Order updates are handled in Dashboard component
      // No need for duplicate notifications
    });
    
    return () => {
      socket.disconnect();
    };
  }, [userDetails, dispatch]);

  const handleLogout = async () => {
    await axios.post(`${serverEndpoint}/api/auth/logout`, {}, { withCredentials: true });
    dispatch({ type: CLEAR_USER });
    dispatch(clearCart());
  };

  const isLoggedIn = !!userDetails?.email;
  const isAdmin = userDetails?.isAdmin;

  if (!sessionChecked) return <Spinner />;

  return (
    <>
      <Suspense fallback={<Spinner />}>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isLoggedIn && !isAdmin ? "/homeprivate" : "/homepublic"} replace />}
        />

        <Route
          path="/homepublic"
          element={
            <PublicHomeLayout>
              <HomePublic />
            </PublicHomeLayout>
          }
        />

        <Route
          path="/homeprivate"
          element={
            isLoggedIn && !isAdmin ? (
              <Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}>
                <HomePrivate />
              </Applayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to={isAdmin ? "/admin" : "/homeprivate"} replace />
            ) : (
              <PublicHomeLayout>
                <Login />
              </PublicHomeLayout>
            )
          }
        />

        <Route
          path="/register"
          element={
            <PublicHomeLayout>
              <Register />
            </PublicHomeLayout>
          }
        />

        <Route path="/adminlogin" element={<AdminLogin />} />

        <Route
          path="/dashboard"
          element={
            isLoggedIn && !isAdmin ? (
              <Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}>
                <Dashboard />
              </Applayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/product"
          element={
            <Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}>
              <Product />
            </Applayout>
          }
        />

        <Route
          path="/product/:id"
          element={
            <Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}>
              <ProductDetailPage />
            </Applayout>
          }
        />

        <Route
          path="/about"
          element={
            <Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}>
              <About />
            </Applayout>
          }
        />

        <Route
          path="/contact"
          element={
            <Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}>
              <Contact />
            </Applayout>
          }
        />

        <Route
          path="/faqs"
          element={
            <Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}>
              <FAQs />
            </Applayout>
          }
        />

        <Route
          path="/profile"
          element={
            <Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}>
              <UserProfile />
            </Applayout>
          }
        />

        <Route
          path="/orders"
          element={
            <Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}>
              <UserOrders />
            </Applayout>
          }
        />

        <Route
          path="/cart"
          element={
            <Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}>
              <CartPage />
            </Applayout>
          }
        />

        {/* ✅ Razorpay Checkout Flow */}
        <Route
          path="/checkout/shipping"
          element={
            isLoggedIn ? (
              <Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}>
                <CheckoutShipping />
              </Applayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/checkout/payment"
          element={
            isLoggedIn ? (
              <Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}>
                <CheckoutPayment />
              </Applayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/checkout-success"
          element={
            isLoggedIn ? (
              <Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}>
                <CheckoutSuccess />
              </Applayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 🔐 Admin Routes */}
        <Route
          path="/admin"
          element={
            isAdmin ? (
              <AdminLayout userDetails={userDetails} onLogout={handleLogout}>
                <AdminDashboard />
              </AdminLayout>
            ) : (
              <Navigate to="/adminlogin" replace />
            )
          }
        />

        <Route
          path="/admin/products"
          element={
            isAdmin ? (
              <AdminLayout userDetails={userDetails} onLogout={handleLogout}>
                <ManageProducts />
              </AdminLayout>
            ) : (
              <Navigate to="/adminlogin" replace />
            )
          }
        />

        <Route
          path="/admin/products/add"
          element={
            isAdmin ? (
              <AdminLayout userDetails={userDetails} onLogout={handleLogout}>
                <AddProduct />
              </AdminLayout>
            ) : (
              <Navigate to="/adminlogin" replace />
            )
          }
        />

        <Route
          path="/admin/contact-messages"
          element={
            isAdmin ? (
              <AdminLayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}>
                <AdminContactMessages />
              </AdminLayout>
            ) : (
              <Navigate to="/adminlogin" replace />
            )
          }
        />

        <Route
          path="/admin/orders"
          element={
            isAdmin ? (
              <AdminLayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}>
                <ManageOrders />
              </AdminLayout>
            ) : (
              <Navigate to="/adminlogin" replace />
            )
          }
        />

        <Route
          path="/admin/users"
          element={
            isAdmin ? (
              <AdminLayout userDetails={userDetails} onLogout={handleLogout}>
                <ManageUsers />
              </AdminLayout>
            ) : (
              <Navigate to="/adminlogin" replace />
            )
          }
        />

        <Route
          path="/admin/stock-notifications"
          element={
            isAdmin ? (
              <AdminLayout userDetails={userDetails} onLogout={handleLogout}>
                <AdminStockNotifications />
              </AdminLayout>
            ) : (
              <Navigate to="/adminlogin" replace />
            )
          }
        />

        <Route
          path="/admin/low-stock"
          element={
            isAdmin ? (
              <AdminLayout userDetails={userDetails} onLogout={handleLogout}>
                <AdminLowStockAlerts />
              </AdminLayout>
            ) : (
              <Navigate to="/adminlogin" replace />
            )
          }
        />

        <Route
          path="/admin/products/import-export"
          element={
            isAdmin ? (
              <AdminLayout userDetails={userDetails} onLogout={handleLogout}>
                <AdminProductImportExport />
              </AdminLayout>
            ) : (
              <Navigate to="/adminlogin" replace />
            )
          }
        />

        <Route
          path="/admin/csv-mappings"
          element={
            isAdmin ? (
              <AdminLayout userDetails={userDetails} onLogout={handleLogout}>
                <AdminCsvMappings />
              </AdminLayout>
            ) : (
              <Navigate to="/adminlogin" replace />
            )
          }
        />

        <Route
          path="/admin/scheduled-exports"
          element={
            isAdmin ? (
              <AdminLayout userDetails={userDetails} onLogout={handleLogout}>
                <AdminScheduledExports />
              </AdminLayout>
            ) : (
              <Navigate to="/adminlogin" replace />
            )
          }
        />

        <Route
          path="/admin/reviews"
          element={
            isAdmin ? (
              <AdminLayout userDetails={userDetails} onLogout={handleLogout}>
                <AdminReviewModeration />
              </AdminLayout>
            ) : (
              <Navigate to="/adminlogin" replace />
            )
          }
        />

        {/* ✅ Analytics Route */}
        <Route
          path="/admin/analytics"
          element={
            isAdmin ? (
              <AdminLayout userDetails={userDetails} onLogout={handleLogout}>
                <AdminDashboard />
              </AdminLayout>
            ) : (
              <Navigate to="/adminlogin" replace />
            )
          }
        />

        {/* ✅ Settings Route */}
        <Route
          path="/admin/settings"
          element={
            isAdmin ? (
              <AdminLayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}>
                <AdminSettings />
              </AdminLayout>
            ) : (
              <Navigate to="/adminlogin" replace />
            )
          }
        />

        {/* ✅ Reviews Route */}
        <Route
          path="/admin/reviews"
          element={
            isAdmin ? (
              <AdminLayout userDetails={userDetails} onLogout={handleLogout}>
                <AdminDashboard />
              </AdminLayout>
            ) : (
              <Navigate to="/adminlogin" replace />
            )
          }
        />

        {/* ✅ Profile Route */}
        <Route
          path="/admin/profile"
          element={
            isAdmin ? (
              <AdminLayout userDetails={userDetails} onLogout={handleLogout}>
                <AdminDashboard />
              </AdminLayout>
            ) : (
              <Navigate to="/adminlogin" replace />
            )
          }
        />

        <Route path="/brand-story" element={<Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}><BrandStory /></Applayout>} />
        <Route path="/blogs" element={<Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}><Blogs /></Applayout>} />
        <Route path="/careers" element={<Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}><Careers /></Applayout>} />
        <Route path="/shipping-details" element={<Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}><ShippingDetails /></Applayout>} />
        <Route path="/return-refund-policy" element={<Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}><ReturnRefundPolicy /></Applayout>} />
        <Route path="/terms-of-use" element={<Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}><TermsOfUse /></Applayout>} />
        <Route path="/privacy-policy" element={<Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}><PrivacyPolicy /></Applayout>} />
        <Route path="/track-order" element={<Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}><TrackOrder /></Applayout>} />
      </Routes>
      </Suspense>

      {showGlobalSpinner && <Spinner overlay />}

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
