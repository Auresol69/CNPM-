// src/services/notificationService.js
import api, {
    deleteMyNotification as apiDeleteMyNotification,
    getMyNotifications as apiGetMyNotifications
} from '../api/apiClient';

/**
 * Lấy thông báo của user hiện tại
 * @returns {Promise<Array>} - notifications array
 */
export const getMyNotifications = async () => {
  try {
    const response = await apiGetMyNotifications();
    return response.data.data.notifications || response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Không thể lấy danh sách thông báo');
  }
};

/**
 * Xóa 1 thông báo
 * @param {string} notificationId - ID của notification
 * @returns {Promise<boolean>}
 */
export const deleteNotification = async (notificationId) => {
  try {
    await apiDeleteMyNotification(notificationId);
    return true;
  } catch (error) {
    throw new Error(error.message || 'Xóa thông báo thất bại');
  }
};

/**
 * Tạo thông báo mới (Admin/Manager)
 * @param {Object} notificationData - { title, message, recipients, type, ... }
 * @returns {Promise<Object>}
 */
export const createNotification = async (notificationData) => {
  try {
    const response = await api.post('/notifications', notificationData);
    return response.data.data.notification || response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Tạo thông báo thất bại');
  }
};

/**
 * Gửi thông báo đến nhiều người (Admin/Manager)
 * @param {Object} notificationData - { title, message, recipients: [], ... }
 * @returns {Promise<Object>}
 */
export const sendNotification = async (notificationData) => {
  try {
    const response = await api.post('/notifications/send', notificationData);
    return response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Gửi thông báo thất bại');
  }
};

/**
 * Đánh dấu thông báo đã đọc
 * @param {string} notificationId - ID của notification
 * @returns {Promise<Object>}
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`/notifications/${notificationId}`, {
      isRead: true
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Đánh dấu đã đọc thất bại');
  }
};

/**
 * Đánh dấu tất cả thông báo đã đọc
 * @returns {Promise<boolean>}
 */
export const markAllAsRead = async () => {
  try {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Đánh dấu tất cả đã đọc thất bại');
  }
};

export default {
  getMyNotifications,
  deleteNotification,
  createNotification,
  sendNotification,
  markAsRead,
  markAllAsRead
};
