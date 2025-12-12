// src/services/scheduleService.js
import api, {
  addStudentsToStop as apiAddStudentsToStop,
  getScheduleRoute as apiGetScheduleRoute
} from '../api/apiClient';

/**
 * Lấy route shape để vẽ map
 * Flow: GET /trips/my-schedule → lấy scheduleId → GET /schedules/:scheduleId/route
 * @param {string} scheduleId - ID của schedule (từ my-schedule response)
 * @returns {Promise<Object>} - { routeName, shape, stops, distance, duration }
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
 * Lấy tất cả schedules
 * Backend returns: { status: 'success', data: [schedules] }
 */
export const getAllSchedules = async () => {
  try {
    const response = await api.get('/schedules');
    return response.data.data || [];
  } catch (error) {
    throw new Error(error.message || 'Không thể lấy danh sách lịch trình');
  }
};

/**
 * Lấy chi tiết 1 schedule
 * Backend returns: { status: 'success', data: schedule }
 */
export const getSchedule = async (scheduleId) => {
  try {
    const response = await api.get(`/schedules/${scheduleId}`);
    return response.data.data || null;
  } catch (error) {
    throw new Error(error.message || 'Không tìm thấy lịch trình');
  }
};

/**
 * Tạo schedule mới (Admin/Manager)
 * Backend factory returns: { status: 'success', data: schedule }
 */
export const createSchedule = async (scheduleData) => {
  try {
    const response = await api.post('/schedules', scheduleData);
    return response.data.data || null;
  } catch (error) {
    throw new Error(error.message || 'Tạo lịch trình thất bại');
  }
};

/**
 * Cập nhật schedule (Admin/Manager)
 * Backend factory returns: { status: 'success', data: updatedSchedule }
 */
export const updateSchedule = async (scheduleId, scheduleData) => {
  try {
    const response = await api.patch(`/schedules/${scheduleId}`, scheduleData);
    return response.data.data || null;
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
