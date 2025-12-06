// src/services/tripService.js
import api, {
    checkIn as apiCheckIn,
    createTrip as apiCreateTrip,
    deleteTrip as apiDeleteTrip,
    getAllTrips as apiGetAllTrips,
    getTrip as apiGetTrip,
    markAsAbsent as apiMarkAsAbsent,
    updateTrip as apiUpdateTrip
} from '../api/apiClient';

/**
 * Lấy tất cả chuyến đi
 * @returns {Promise<Array>} - trips array
 */
export const getAllTrips = async () => {
  try {
    const response = await apiGetAllTrips();
    return response.data.data.trips || response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Không thể lấy danh sách chuyến đi');
  }
};

/**
 * Lấy chi tiết 1 chuyến đi
 * @param {string} tripId - ID của trip
 * @returns {Promise<Object>} - trip object
 */
export const getTrip = async (tripId) => {
  try {
    const response = await apiGetTrip(tripId);
    return response.data.data.trip || response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Không tìm thấy chuyến đi');
  }
};

/**
 * Lấy danh sách học sinh trong chuyến đi
 * @param {string} tripId - ID của trip
 * @returns {Promise<Array>} - students array
 */
export const getTripStudents = async (tripId) => {
  try {
    const response = await api.get(`/trips/${tripId}/students`);
    return response.data.data.students || response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Không thể lấy danh sách học sinh');
  }
};

/**
 * Lấy lịch trình của tài xế hiện tại
 * @returns {Promise<Object>} - schedule object
 */
export const getMySchedule = async () => {
  try {
    const response = await api.get('/trips/my-schedule');
    return response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Không thể lấy lịch trình');
  }
};

/**
 * Tạo chuyến đi mới (Admin/Manager)
 * @param {Object} tripData - { schedule, bus, driver, date, type, ... }
 * @returns {Promise<Object>} - created trip
 */
export const createTrip = async (tripData) => {
  try {
    const response = await apiCreateTrip(tripData);
    return response.data.data.trip || response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Tạo chuyến đi thất bại');
  }
};

/**
 * Cập nhật chuyến đi (Admin/Manager)
 * @param {string} tripId - ID của trip
 * @param {Object} tripData - Data cần update
 * @returns {Promise<Object>} - updated trip
 */
export const updateTrip = async (tripId, tripData) => {
  try {
    const response = await apiUpdateTrip(tripId, tripData);
    return response.data.data.trip || response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Cập nhật chuyến đi thất bại');
  }
};

/**
 * Xóa chuyến đi (Admin/Manager)
 * @param {string} tripId - ID của trip
 * @returns {Promise<boolean>}
 */
export const deleteTrip = async (tripId) => {
  try {
    await apiDeleteTrip(tripId);
    return true;
  } catch (error) {
    throw new Error(error.message || 'Xóa chuyến đi thất bại');
  }
};

/**
 * Check-in học sinh thông thường
 * @param {string} tripId - ID của trip
 * @param {Object} data - { studentId, stationId, timestamp }
 * @returns {Promise<Object>}
 */
export const checkIn = async (tripId, data) => {
  try {
    const response = await apiCheckIn(tripId, data);
    return response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Check-in thất bại');
  }
};

/**
 * Check-in học sinh bằng Face ID
 * @param {string} tripId - ID của trip
 * @param {File} imageFile - File ảnh để nhận diện khuôn mặt
 * @param {string} stationId - ID của trạm đang check-in
 * @returns {Promise<Object>}
 */
export const checkInWithFace = async (tripId, imageFile, stationId) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (stationId) {
      formData.append('stationId', stationId);
    }

    const response = await api.post(`/trips/${tripId}/check-in-face`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Check-in bằng Face ID thất bại');
  }
};

/**
 * Đánh dấu học sinh vắng mặt
 * @param {string} tripId - ID của trip
 * @param {string} studentId - ID của học sinh
 * @returns {Promise<Object>}
 */
export const markAsAbsent = async (tripId, studentId) => {
  try {
    const response = await apiMarkAsAbsent(tripId, studentId);
    return response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Đánh dấu vắng mặt thất bại');
  }
};

export default {
  getAllTrips,
  getTrip,
  getTripStudents,
  getMySchedule,
  createTrip,
  updateTrip,
  deleteTrip,
  checkIn,
  checkInWithFace,
  markAsAbsent
};
