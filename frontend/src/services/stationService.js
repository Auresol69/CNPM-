// src/services/stationService.js
import api from './api';

// 1. Lấy tất cả trạm dừng
export const getAllStations = async () => {
  try {
    const response = await api.get('/stations');
    return response.data.data; // [{ id, name, lat, lng, address, ... }]
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể tải danh sách trạm');
  }
};

// 2. Lấy 1 trạm theo ID
export const getStationById = async (stationId) => {
  try {
    const response = await api.get(`/stations/${stationId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không tìm thấy trạm');
  }
};

// 3. Lấy chỉ đường đi bộ đến trạm
export const getWalkingDirections = async (stationId, userLat, userLng) => {
  try {
    const response = await api.get(`/stations/${stationId}/walking-directions`, {
      params: { lat: userLat, lng: userLng }
    });
    return response.data.data; // { distance, duration, steps: [...] }
  } catch (error) {
    throw new Error('Không thể lấy chỉ đường', error);
  }
};

// 4. Tạo trạm mới (Admin/Manager)
export const createStation = async (stationData) => {
  try {
    const response = await api.post('/stations', stationData);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Tạo trạm thất bại');
  }
};

// 5. Xóa trạm (Admin/Manager)
export const deleteStation = async (stationId) => {
  try {
    await api.delete(`/stations/${stationId}`);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Xóa thất bại');
  }
};