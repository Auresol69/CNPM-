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
// ⚠️ DEPRECATED: Sử dụng apiClient.js thay thế
// File này giữ lại để tương thích ngược với code cũ
import api from '../api/apiClient';

export default api;