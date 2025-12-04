// src/services/routeService.js
import api from './api';

// Gọi API lấy lộ trình hôm nay của tài xế
export const getTodayRoute = async () => {
  try {
    const response = await api.get('/driver/today-route');
    return response.data; // { routeId, name, stations: [...] }
  } catch (error) {
    console.error('Lỗi lấy lộ trình:', error);
    return 
  }
};

// Gửi sự cố (nếu cần)
export const reportIncident = async (type, note = '') => {
  return api.post('/driver/incident', { type, note });
};