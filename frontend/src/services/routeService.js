// src/services/routeService.js
import api, {
  createRoute as apiCreateRoute,
  deleteRoute as apiDeleteRoute,
  getAllRoutes as apiGetAllRoutes,
  getRoute as apiGetRoute
} from '../api/apiClient';

/**
 * Lấy tất cả lộ trình
 * Backend returns: { status: 'success', data: [routes] }
 */
export const getAllRoutes = async () => {
  try {
    const response = await apiGetAllRoutes();
    return response.data.data || [];
  } catch (error) {
    throw new Error(error.message || 'Không thể lấy danh sách lộ trình');
  }
};

/**
 * Lấy chi tiết 1 lộ trình
 * Backend returns: { status: 'success', data: route }
 */
export const getRoute = async (routeId) => {
  try {
    const response = await apiGetRoute(routeId);
    return response.data.data || null;
  } catch (error) {
    throw new Error(error.message || 'Không tìm thấy lộ trình');
  }
};

/**
 * Tạo lộ trình mới (Admin/Manager)
 * Backend factory returns: { status: 'success', data: route }
 */
export const createRoute = async (routeData) => {
  try {
    const response = await apiCreateRoute(routeData);
    return response.data.data || null;
  } catch (error) {
    throw new Error(error.message || 'Tạo lộ trình thất bại');
  }
};

/**
 * Xóa lộ trình (Admin/Manager)
 * @param {string} routeId - ID của route
 * @returns {Promise<boolean>}
 */
export const deleteRoute = async (routeId) => {
  try {
    await apiDeleteRoute(routeId);
    return true;
  } catch (error) {
    throw new Error(error.message || 'Xóa lộ trình thất bại');
  }
};

/**
 * Lấy lộ trình hôm nay của tài xế
 * ⚠️ Backend chưa có API này, cần implement: GET /api/v1/trips/my-schedule
 * @returns {Promise<Object>} - { routeId, name, stations: [...] }
 */
export const getTodayRoute = async () => {
  try {
    // Sử dụng API trips/my-schedule thay vì driver/today-route
    const response = await api.get('/trips/my-schedule');
    return response.data.data;
  } catch (error) {
    console.error('Lỗi lấy lộ trình hôm nay:', error);
    throw new Error(error.message || 'Không thể lấy lộ trình hôm nay');
  }
};

/**
 * Báo cáo sự cố
 * ⚠️ Backend chưa có API này, cần implement: POST /api/v1/driver/incident
 * @param {string} type - Loại sự cố
 * @param {string} note - Ghi chú
 * @returns {Promise<Object>}
 */
export const reportIncident = async (type, note = '') => {
  try {
    const response = await api.post('/driver/incident', { type, note });
    return response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Báo cáo sự cố thất bại');
  }
};

export default {
  getAllRoutes,
  getRoute,
  createRoute,
  deleteRoute,
  getTodayRoute,
  reportIncident
};