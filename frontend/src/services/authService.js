// src/services/authService.js
import { logOut as apiLogOut, refreshToken as apiRefreshToken, signIn as apiSignIn, signUp as apiSignUp } from '../api/apiClient';
import { connectSocket, disconnectSocket } from './socketService'; // Thêm Socket.IO
import api from '../api/apiClient';

/**
 * Đăng nhập (alias cho signIn - dành cho driver frontend)
 * @param {Object} credentials - { username, password }
 * @returns {Promise<Object>} - { token, user }
 */
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/signin', credentials);
    
    if (response.data && response.data.accessToken) {
      const { accessToken, data } = response.data;
      const token = accessToken;
      
      console.log("Login success:", response.data);

      if (token && data?.user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Kết nối Socket.IO ngay sau khi đăng nhập thành công
        connectSocket();
      }

      return { token, user: data?.user };
    }
  } catch (error) {
    console.error('Login failed in authService:', error);
    throw error;
  }
};

/**
 * Đăng nhập
 * @param {Object} credentials - { username, password }
 * @returns {Promise<Object>} - { token, user }
 */
export const signIn = async (credentials) => {
  try {
    console.log('Sending login request with:', credentials);
    const response = await apiSignIn(credentials);
    console.log('Login response:', response.data);

    const { accessToken, data } = response.data;
    const token = accessToken;

    if (token && data?.user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Kết nối Socket.IO ngay sau khi đăng nhập thành công
      connectSocket();
    }

    return { token, user: data.user };
  } catch (error) {
    console.error('Lỗi đăng nhập:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

/**
 * Logs out the user
 */
export const logout = async () => {
  try {
    await api.delete('/auth/logout');
  } catch (error) {
    console.warn("Logout API call failed:", error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Ngắt kết nối Socket.IO khi logout
    disconnectSocket();
  }
};

// Alias for driver frontend compatibility
export const logOut = logout;

/**
 * Retrieves the currently stored JWT token.
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem('accessToken') || localStorage.getItem('token');
};

/**
 * Retrieves the currently stored user data.
 * @returns {object|null}
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    console.error("Failed to parse user data from localStorage", e);
    return null;
  }
};

/**
 * Checks if a user is currently authenticated.
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getToken();
};

// Default export for backward compatibility
const authService = {
  login,
  signIn,
  logout,
  logOut,
  getToken,
  getCurrentUser,
  isAuthenticated,
};

export default authService;

