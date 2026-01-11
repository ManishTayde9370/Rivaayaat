import axios from 'axios';
import store from '../store';
import { CLEAR_USER } from '../redux/user/actions';
import notifications from './notifications';

// Ensure cookies are sent with every request (important for session-based auth)
axios.defaults.withCredentials = true;

// Response interceptor to handle common failures centrally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, request } = error || {};

    if (response) {
      const { status } = response;

      if (status === 401) {
        // Clear user in store and notify
        try {
          store.dispatch({ type: CLEAR_USER });
        } catch (e) {
          // ignore
        }

        try {
          notifications.userNotifications.warning('Session expired. Please login.');
        } catch (e) { /* ignore */ }

        // Redirect to login page unless already there
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      } else if (status >= 500) {
        try {
          notifications.userNotifications.error('Server error. Please try again later.');
        } catch (e) { /* ignore */ }
      } else if (status >= 400) {
        // For other 4xx errors, show a friendly message for the user
        try {
          const msg = response.data?.message || 'Request failed';
          notifications.userNotifications.warning(msg);
        } catch (e) { /* ignore */ }
      }
    } else if (request) {
      // No response received
      try {
        notifications.userNotifications.error('Network error. Please check your connection.');
      } catch (e) { /* ignore */ }
    }

    return Promise.reject(error);
  }
);
