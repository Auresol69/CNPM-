// src/services/scheduleService.js
import api, {
    addStudentsToStop as apiAddStudentsToStop,
    getScheduleRoute as apiGetScheduleRoute
} from '../api/apiClient';

/**
 * Lấy thông tin route của schedule
 * @param {string} scheduleId - ID của schedule
 * @returns {Promise<Object>} - route object with stations
 */
export const getScheduleRoute = async (scheduleId) => {
  try {
    const response = await apiGetScheduleRoute(scheduleId);
    return response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Không thể lấy thông tin lộ trình');
  }
};

/**
 * Thêm học sinh vào trạm dừng của schedule
 * @param {string} scheduleId - ID của schedule
 * @param {string} stationId - ID của station/stopTime
 * @param {Array<string>} studentIds - Mảng ID của học sinh cần thêm
 * @returns {Promise<Object>}
 */
export const addStudentsToStop = async (scheduleId, stationId, studentIds) => {
  try {
    const response = await apiAddStudentsToStop(scheduleId, stationId, studentIds);
    return response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Thêm học sinh vào trạm thất bại');
  }
};

/**
 * Lấy tất cả schedules (Generic API)
 * @returns {Promise<Array>}
 */
export const getAllSchedules = async () => {
  try {
    const response = await api.get('/schedules');
    return response.data.data.schedules || response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Không thể lấy danh sách lịch trình');
  }
};

/**
 * Lấy chi tiết 1 schedule (Generic API)
 * @param {string} scheduleId - ID của schedule
 * @returns {Promise<Object>}
 */
export const getSchedule = async (scheduleId) => {
  try {
    const response = await api.get(`/schedules/${scheduleId}`);
    return response.data.data.schedule || response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Không tìm thấy lịch trình');
  }
};

/**
 * Tạo schedule mới (Admin/Manager) - Generic API
 * @param {Object} scheduleData - { route, bus, driver, startDate, endDate, ... }
 * @returns {Promise<Object>}
 */
export const createSchedule = async (scheduleData) => {
  try {
    const response = await api.post('/schedules', scheduleData);
    return response.data.data.schedule || response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Tạo lịch trình thất bại');
  }
};

/**
 * Cập nhật schedule (Admin/Manager) - Generic API
 * @param {string} scheduleId - ID của schedule
 * @param {Object} scheduleData - Data cần update
 * @returns {Promise<Object>}
 */
export const updateSchedule = async (scheduleId, scheduleData) => {
  try {
    const response = await api.patch(`/schedules/${scheduleId}`, scheduleData);
    return response.data.data.schedule || response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Cập nhật lịch trình thất bại');
  }
};

/**
 * Xóa schedule (Admin/Manager) - Generic API
 * @param {string} scheduleId - ID của schedule
 * @returns {Promise<boolean>}
 */
export const deleteSchedule = async (scheduleId) => {
  try {
    await api.delete(`/schedules/${scheduleId}`);
    return true;
  } catch (error) {
    throw new Error(error.message || 'Xóa lịch trình thất bại');
  }
};

export default {
  getScheduleRoute,
  addStudentsToStop,
  getAllSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule
};
