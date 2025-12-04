// // src/services/api.js
// import axios from 'axios';

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
//   timeout: 10000,
// });

// // Interceptor thêm token nếu có
// api.interceptors.request.use((config) => {
//   const user = JSON.parse(localStorage.getItem('busUser') || '{}');
//   if (user.token) {
//     config.headers.Authorization = `Bearer ${user.token}`;
//   }
//   return config;
// });

// export default api;
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1', // Thay bằng URL backend của bạn
  timeout: 10000,
});

// Tự động gắn token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // hoặc sessionStorage
  if (token) {
    config.headers.Authorization = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

export default api;