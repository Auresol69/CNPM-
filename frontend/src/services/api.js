import axios from 'axios';

// Base URL from BackendSpecs.md
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://smart-school-bus-api.onrender.com/api/v1',
  withCredentials: false,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log(token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log error to console for debugging
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default api;
