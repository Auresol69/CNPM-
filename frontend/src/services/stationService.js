// src/services/stationService.js
import {
    createStation as apiCreateStation,
    deleteStation as apiDeleteStation,
    getAllStations as apiGetAllStations,
    getStation as apiGetStation,
    getWalkingDirectionsToStation as apiGetWalkingDirections
} from '../api/apiClient';

/**
 * Lấy tất cả trạm dừng
 * @returns {Promise<Array>} - [{ id, name, lat, lng, address, ... }]
 */
export const getAllStations = async () => {
  try {
    const response = await apiGetAllStations();
    return response.data.data.stations || response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Không thể tải danh sách trạm');
  }
};

/**
 * Lấy 1 trạm theo ID
 * @param {string} stationId - ID của trạm
 * @returns {Promise<Object>} - station object
 */
export const getStationById = async (stationId) => {
  try {
    const response = await apiGetStation(stationId);
    return response.data.data.station || response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Không tìm thấy trạm');
  }
};

/**
 * Lấy chỉ đường đi bộ đến trạm
 * @param {string} stationId - ID của trạm
 * @param {number} userLat - Vĩ độ hiện tại của user
 * @param {number} userLng - Kinh độ hiện tại của user
 * @returns {Promise<Object>} - { distance, duration, steps: [...] }
 */
export const getWalkingDirections = async (stationId, userLat, userLng) => {
  try {
    const response = await apiGetWalkingDirections(stationId, userLat, userLng);
    return response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Không thể lấy chỉ đường');
  }
};

/**
 * Tạo trạm mới (Admin/Manager)
 * @param {Object} stationData - { name, address, lat, lng, ... }
 * @returns {Promise<Object>} - created station
 */
export const createStation = async (stationData) => {
  try {
    const response = await apiCreateStation(stationData);
    return response.data.data.station || response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Tạo trạm thất bại');
  }
};

/**
 * Xóa trạm (Admin/Manager)
 * @param {string} stationId - ID của trạm
 * @returns {Promise<boolean>}
 */
export const deleteStation = async (stationId) => {
  try {
    await apiDeleteStation(stationId);
    return true;
  } catch (error) {
    throw new Error(error.message || 'Xóa trạm thất bại');
  }
};

export default {
  getAllStations,
  getStationById,
  getWalkingDirections,
  createStation,
  deleteStation
};