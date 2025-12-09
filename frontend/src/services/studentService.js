// src/services/studentService.js
import api, { getMyStudents as apiGetMyStudents } from '../api/apiClient';

/**
 * Lấy danh sách học sinh của phụ huynh hiện tại
 * @returns {Promise<Array>} - students array
 */
/**
 * Backend returns: { status: 'success', data: [students] }
 */
export const getMyStudents = async () => {
  try {
    const response = await apiGetMyStudents();
    return response.data.data || [];
  } catch (error) {
    throw new Error(error.message || 'Không thể lấy danh sách học sinh');
  }
};

/**
 * Đăng ký dữ liệu khuôn mặt cho học sinh (Face ID)
 * @param {string} studentId - ID của học sinh
 * @param {File} imageFile - File ảnh khuôn mặt
 * @returns {Promise<Object>}
 */
export const registerStudentFace = async (studentId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post(`/students/${studentId}/face-data`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  } catch (error) {
    throw new Error(error.message || 'Đăng ký Face ID thất bại');
  }
};

/**
 * Lấy thông tin chi tiết 1 học sinh (Generic API)
 * @param {string} studentId - ID của học sinh
 * @returns {Promise<Object>}
 */
/**
 * Backend returns: { status: 'success', data: student }
 */
export const getStudent = async (studentId) => {
  try {
    const response = await api.get(`/students/${studentId}`);
    return response.data.data || null;
  } catch (error) {
    throw new Error(error.message || 'Không tìm thấy học sinh');
  }
};

/**
 * Lấy tất cả học sinh (Admin/Manager) - Generic API
 * @returns {Promise<Array>}
 */
/**
 * Backend returns: { status: 'success', data: [students] }
 */
export const getAllStudents = async () => {
  try {
    const response = await api.get('/students');
    return response.data.data || [];
  } catch (error) {
    throw new Error(error.message || 'Không thể lấy danh sách học sinh');
  }
};

/**
 * Tạo học sinh mới (Admin/Manager) - Generic API
 * @param {Object} studentData - { name, grade, class, parent, ... }
 * @returns {Promise<Object>}
 */
/**
 * Backend factory returns: { status: 'success', data: student }
 */
export const createStudent = async (studentData) => {
  try {
    const response = await api.post('/students', studentData);
    return response.data.data || null;
  } catch (error) {
    throw new Error(error.message || 'Tạo học sinh thất bại');
  }
};

/**
 * Cập nhật thông tin học sinh (Admin/Manager) - Generic API
 * @param {string} studentId - ID của học sinh
 * @param {Object} studentData - Data cần update
 * @returns {Promise<Object>}
 */
/**
 * Backend factory returns: { status: 'success', data: updatedStudent }
 */
export const updateStudent = async (studentId, studentData) => {
  try {
    const response = await api.patch(`/students/${studentId}`, studentData);
    return response.data.data || null;
  } catch (error) {
    throw new Error(error.message || 'Cập nhật học sinh thất bại');
  }
};

/**
 * Xóa học sinh (Admin/Manager) - Generic API
 * @param {string} studentId - ID của học sinh
 * @returns {Promise<boolean>}
 */
export const deleteStudent = async (studentId) => {
  try {
    await api.delete(`/students/${studentId}`);
    return true;
  } catch (error) {
    throw new Error(error.message || 'Xóa học sinh thất bại');
  }
};

export default {
  getMyStudents,
  registerStudentFace,
  getStudent,
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent
};
