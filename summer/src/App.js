import { Route, Routes, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import axios from 'axios';

import Applayout from './Layout/Applayout';
import AdminLayout from './Layout/AdminLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';
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

import { serverEndpoint } from './components/config';
import { SET_USER, CLEAR_USER } from './redux/user/actions';
import { fetchCartFromBackend, clearCart } from './redux/cart/actions';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [sessionChecked, setSessionChecked] = useState(false);
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
        dispatch({ type: CLEAR_USER });
        dispatch(clearCart());
      } finally {
        setSessionChecked(true);
      }
    };

    restoreSession();
  }, [dispatch]);

  const handleLogout = async () => {
    await axios.post(`${serverEndpoint}/api/auth/logout`, {}, { withCredentials: true });
    dispatch({ type: CLEAR_USER });
    dispatch(clearCart());
  };

  const isLoggedIn = !!userDetails?.email;
  const isAdmin = userDetails?.isAdmin;

  if (!sessionChecked) return <div>Loading...</div>;

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isLoggedIn && !isAdmin ? "/homeprivate" : "/homepublic"} replace />}
        />

        <Route
          path="/homepublic"
          element={
            <Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}>
              <HomePublic />
            </Applayout>
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
              <Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}>
                <Login />
              </Applayout>
            )
          }
        />

        <Route
          path="/register"
          element={
            <Applayout userDetails={userDetails} onLogout={handleLogout} sessionChecked={sessionChecked}>
              <Register />
            </Applayout>
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

        <Route path="/product/:id" element={<ProductDetailPage />} />

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
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
