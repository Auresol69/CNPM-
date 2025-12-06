// src/services/userService.js
import { getMe as apiGetMe, updateMe as apiUpdateMe } from '../api/apiClient';

/**
 * Lấy thông tin user hiện tại từ server
 * @returns {Promise<Object>} - user object
 */
export const getMe = async () => {
  try {
    const response = await apiGetMe();
    const user = response.data.data.user;
    
    // Cập nhật localStorage với thông tin mới nhất
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  } catch (error) {
    throw new Error(error.message || 'Không thể lấy thông tin người dùng');
  }
};

/**
 * Cập nhật thông tin user
 * @param {Object} userData - { name, email, phone, avatar, ... }
 * @returns {Promise<Object>} - updated user
 */
export const updateMe = async (userData) => {
  try {
    const response = await apiUpdateMe(userData);
    const user = response.data.data.user;
    
    // Cập nhật localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  } catch (error) {
    throw new Error(error.message || 'Cập nhật thông tin thất bại');
  }
};

export default {
  getMe,
  updateMe
};
