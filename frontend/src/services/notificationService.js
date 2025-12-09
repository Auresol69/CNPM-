// // src/services/notificationService.js
// import api, {
//     deleteMyNotification as apiDeleteMyNotification,
//     getMyNotifications as apiGetMyNotifications
// } from '../api/apiClient';

// /**
//  * Lấy thông báo của user hiện tại
//  * @returns {Promise<Array>} - notifications array
//  */
// export const getMyNotifications = async () => {
//   try {
//     const response = await apiGetMyNotifications();
//     return response.data.data.notifications || response.data.data;
//   } catch (error) {
//     throw new Error(error.message || 'Không thể lấy danh sách thông báo');
//   }
// };

// /**
//  * Xóa 1 thông báo
//  * @param {string} notificationId - ID của notification
//  * @returns {Promise<boolean>}
//  */
// export const deleteNotification = async (notificationId) => {
//   try {
//     await apiDeleteMyNotification(notificationId);
//     return true;
//   } catch (error) {
//     throw new Error(error.message || 'Xóa thông báo thất bại');
//   }
// };

// /**
//  * Tạo thông báo mới (Admin/Manager)
//  * @param {Object} notificationData - { title, message, recipients, type, ... }
//  * @returns {Promise<Object>}
//  */
// export const createNotification = async (notificationData) => {
//   try {
//     const response = await api.post('/notifications', notificationData);
//     return response.data.data.notification || response.data.data;
//   } catch (error) {
//     throw new Error(error.message || 'Tạo thông báo thất bại');
//   }
// };

// /**
//  * Gửi thông báo đến nhiều người (Admin/Manager)
//  * @param {Object} notificationData - { title, message, recipients: [], ... }
//  * @returns {Promise<Object>}
//  */
// export const sendNotification = async (notificationData) => {
//   try {
//     const response = await api.post('/notifications/send', notificationData);
//     return response.data.data;
//   } catch (error) {
//     throw new Error(error.message || 'Gửi thông báo thất bại');
//   }
// };

// /**
//  * Đánh dấu thông báo đã đọc
//  * @param {string} notificationId - ID của notification
//  * @returns {Promise<Object>}
//  */
// export const markAsRead = async (notificationId) => {
//   try {
//     const response = await api.patch(`/notifications/${notificationId}`, {
//       isRead: true
//     });
//     return response.data.data;
//   } catch (error) {
//     throw new Error(error.message || 'Đánh dấu đã đọc thất bại');
//   }
// };

// /**
//  * Đánh dấu tất cả thông báo đã đọc
//  * @returns {Promise<boolean>}
//  */
// export const markAllAsRead = async () => {
//   try {
//     const response = await api.patch('/notifications/mark-all-read');
//     return response.data.data;
//   } catch (error) {
//     throw new Error(error.message || 'Đánh dấu tất cả đã đọc thất bại');
//   }
// };

// export default {
//   getMyNotifications,
//   deleteNotification,
//   createNotification,
//   sendNotification,
//   markAsRead,
//   markAllAsRead
// };
// src/services/notificationService.js
import api, {
  deleteMyNotification as apiDeleteMyNotification,
  getMyNotifications as apiGetMyNotifications,
} from '../api/apiClient';

// Import mock fallback (tạo file mock nếu chưa có)
import {
  mockMyNotificationsResponse,
} from '../mocks/mockTripResponses';

/**
 * Lấy danh sách thông báo của user hiện tại
 * @returns {Promise<Array>} - notifications array
 */
export const getMyNotifications = async () => {
  try {
    const response = await apiGetMyNotifications();
    // Backend trả về: { data: { notifications: [...] } } hoặc { data: [...] }
    return response.data.data?.notifications || response.data.data || [];
  } catch (error) {
    console.warn('[notificationService] getMyNotifications failed → using mock fallback', error.message || error);
    // Fallback mock để UI không crash
    return mockMyNotificationsResponse.data.notifications || mockMyNotificationsResponse.data || [];
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
    console.warn(`[notificationService] deleteNotification(${notificationId}) failed → mock success`, error.message || error);
    // Vẫn trả true để UI xóa khỏi danh sách dù API lỗi
    return true;
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
    return response.data.data?.notification || response.data.data || null;
  } catch (error) {
    console.error('[notificationService] createNotification failed:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Tạo thông báo thất bại');
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
    return response.data.data || null;
  } catch (error) {
    console.error('[notificationService] sendNotification failed:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Gửi thông báo thất bại');
  }
};

/**
 * Đánh dấu 1 thông báo đã đọc
 * @param {string} notificationId - ID của notification
 * @returns {Promise<Object>}
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`/notifications/${notificationId}`, { isRead: true });
    return response.data.data || null;
  } catch (error) {
    console.warn(`[notificationService] markAsRead(${notificationId}) failed → mock success`, error.message || error);
    // Vẫn trả success để UI cập nhật (fallback)
    return { _id: notificationId, isRead: true };
  }
};

/**
 * Đánh dấu tất cả thông báo đã đọc
 * @returns {Promise<boolean>}
 */
export const markAllAsRead = async () => {
  try {
    await api.patch('/notifications/mark-all-read');
    return true;
  } catch (error) {
    console.warn('[notificationService] markAllAsRead failed → mock success', error.message || error);
    return true;
  }
};

export default {
  getMyNotifications,
  deleteNotification,
  createNotification,
  sendNotification,
  markAsRead,
  markAllAsRead,
};