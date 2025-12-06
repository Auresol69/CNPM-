// src/services/vehicleService.js
import {
    createModel,
    deleteModel,
    getAllModels,
    getOneModel,
    updateModel
} from '../api/apiClient';

const MODEL_NAME = 'buses';

/**
 * Lấy tất cả xe bus
 * @returns {Promise<Array>} - buses array
 */
export const getAllBuses = async () => {
  try {
    const response = await getAllModels(MODEL_NAME);
    return response.data.data.buses || response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Không thể lấy danh sách xe bus');
  }
};

/**
 * Lấy chi tiết 1 xe bus
 * @param {string} busId - ID của bus
 * @returns {Promise<Object>} - bus object
 */
export const getBus = async (busId) => {
  try {
    const response = await getOneModel(MODEL_NAME, busId);
    return response.data.data.bus || response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Không tìm thấy xe bus');
  }
};

/**
 * Tạo xe bus mới (Admin/Manager)
 * @param {Object} busData - { licensePlate, capacity, model, year, status, ... }
 * @returns {Promise<Object>} - created bus
 */
export const createBus = async (busData) => {
  try {
    const response = await createModel(MODEL_NAME, busData);
    return response.data.data.bus || response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Tạo xe bus thất bại');
  }
};

/**
 * Cập nhật thông tin xe bus (Admin/Manager)
 * @param {string} busId - ID của bus
 * @param {Object} busData - Data cần update
 * @returns {Promise<Object>} - updated bus
 */
export const updateBus = async (busId, busData) => {
  try {
    const response = await updateModel(MODEL_NAME, busId, busData);
    return response.data.data.bus || response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Cập nhật xe bus thất bại');
  }
};

/**
 * Xóa xe bus (Admin/Manager)
 * @param {string} busId - ID của bus
 * @returns {Promise<boolean>}
 */
export const deleteBus = async (busId) => {
  try {
    await deleteModel(MODEL_NAME, busId);
    return true;
  } catch (error) {
    throw new Error(error.message || 'Xóa xe bus thất bại');
  }
};

/**
 * Lấy xe bus khả dụng (chưa được assign)
 * @returns {Promise<Array>}
 */
export const getAvailableBuses = async () => {
  try {
    // Có thể thêm query params: ?status=available
    const response = await getAllModels(MODEL_NAME);
    const buses = response.data.data.buses || response.data.data;
    // Filter ở client nếu backend chưa hỗ trợ
    return buses.filter(bus => bus.status === 'available' || bus.status === 'active');
  } catch (error) {
    throw new Error(error.message || 'Không thể lấy danh sách xe khả dụng');
  }
};

/**
 * Cập nhật vị trí xe bus realtime (dùng cho tracking)
 * @param {string} busId - ID của bus
 * @param {Object} locationData - { lat, lng, timestamp }
 * @returns {Promise<Object>}
 */
export const updateBusLocation = async (busId, locationData) => {
  try {
    const response = await updateModel(MODEL_NAME, busId, {
      currentLocation: locationData
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Cập nhật vị trí xe thất bại');
  }
};

export default {
  getAllBuses,
  getBus,
  createBus,
  updateBus,
  deleteBus,
  getAvailableBuses,
  updateBusLocation
};
