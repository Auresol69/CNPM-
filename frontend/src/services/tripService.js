// // src/services/tripService.js
// import api, {
//     checkIn as apiCheckIn,
//     createTrip as apiCreateTrip,
//     deleteTrip as apiDeleteTrip,
//     getAllTrips as apiGetAllTrips,
//     getTrip as apiGetTrip,
//     markAsAbsent as apiMarkAsAbsent,
//     updateTrip as apiUpdateTrip
// } from '../api/apiClient';

// /**
//  * Lấy tất cả chuyến đi
//  * @returns {Promise<Array>} - trips array
//  */
// export const getAllTrips = async () => {
//   try {
//     const response = await apiGetAllTrips();
//     return response.data.data.trips || response.data.data;
//   } catch (error) {
//     throw new Error(error.message || 'Không thể lấy danh sách chuyến đi');
//   }
// };

// /**
//  * Lấy chi tiết 1 chuyến đi
//  * @param {string} tripId - ID của trip
//  * @returns {Promise<Object>} - trip object
//  */
// export const getTrip = async (tripId) => {
//   try {
//     const response = await apiGetTrip(tripId);
//     return response.data.data.trip || response.data.data;
//   } catch (error) {
//     throw new Error(error.message || 'Không tìm thấy chuyến đi');
//   }
// };

// /**
//  * Lấy danh sách học sinh trong chuyến đi
//  * @param {string} tripId - ID của trip
//  * @returns {Promise<Array>} - students array
//  */
// export const getTripStudents = async (tripId) => {
//   try {
//     const response = await api.get(`/trips/${tripId}/students`);
//     return response.data.data.students || response.data.data;
//   } catch (error) {
//     throw new Error(error.message || 'Không thể lấy danh sách học sinh');
//   }
// };

// /**
//  * Lấy lịch trình của tài xế hiện tại
//  * @returns {Promise<Object>} - schedule object
//  */
// export const getMySchedule = async () => {
//   try {
//     const response = await api.get('/trips/my-schedule');
//     return response.data.data;
//   } catch (error) {
//     throw new Error(error.message || 'Không thể lấy lịch trình');
//   }
// };

// /**
//  * Tạo chuyến đi mới (Admin/Manager)
//  * @param {Object} tripData - { schedule, bus, driver, date, type, ... }
//  * @returns {Promise<Object>} - created trip
//  */
// export const createTrip = async (tripData) => {
//   try {
//     const response = await apiCreateTrip(tripData);
//     return response.data.data.trip || response.data.data;
//   } catch (error) {
//     throw new Error(error.message || 'Tạo chuyến đi thất bại');
//   }
// };

// /**
//  * Cập nhật chuyến đi (Admin/Manager)
//  * @param {string} tripId - ID của trip
//  * @param {Object} tripData - Data cần update
//  * @returns {Promise<Object>} - updated trip
//  */
// export const updateTrip = async (tripId, tripData) => {
//   try {
//     const response = await apiUpdateTrip(tripId, tripData);
//     return response.data.data.trip || response.data.data;
//   } catch (error) {
//     throw new Error(error.message || 'Cập nhật chuyến đi thất bại');
//   }
// };

// /**
//  * Xóa chuyến đi (Admin/Manager)
//  * @param {string} tripId - ID của trip
//  * @returns {Promise<boolean>}
//  */
// export const deleteTrip = async (tripId) => {
//   try {
//     await apiDeleteTrip(tripId);
//     return true;
//   } catch (error) {
//     throw new Error(error.message || 'Xóa chuyến đi thất bại');
//   }
// };

// /**
//  * Check-in học sinh thông thường
//  * @param {string} tripId - ID của trip
//  * @param {Object} data - { studentId, stationId, timestamp }
//  * @returns {Promise<Object>}
//  */
// export const checkIn = async (tripId, data) => {
//   try {
//     const response = await apiCheckIn(tripId, data);
//     return response.data.data;
//   } catch (error) {
//     throw new Error(error.message || 'Check-in thất bại');
//   }
// };

// /**
//  * Check-in học sinh bằng Face ID
//  * @param {string} tripId - ID của trip
//  * @param {File} imageFile - File ảnh để nhận diện khuôn mặt
//  * @param {string} stationId - ID của trạm đang check-in
//  * @returns {Promise<Object>}
//  */
// export const checkInWithFace = async (tripId, imageFile, stationId) => {
//   try {
//     const formData = new FormData();
//     formData.append('image', imageFile);
//     if (stationId) {
//       formData.append('stationId', stationId);
//     }

//     const response = await api.post(`/trips/${tripId}/check-in-face`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });

//     return response.data.data;
//   } catch (error) {
//     throw new Error(error.message || 'Check-in bằng Face ID thất bại');
//   }
// };

// /**
//  * Đánh dấu học sinh vắng mặt
//  * @param {string} tripId - ID của trip
//  * @param {string} studentId - ID của học sinh
//  * @returns {Promise<Object>}
//  */
// export const markAsAbsent = async (tripId, studentId) => {
//   try {
//     const response = await apiMarkAsAbsent(tripId, studentId);
//     return response.data.data;
//   } catch (error) {
//     throw new Error(error.message || 'Đánh dấu vắng mặt thất bại');
//   }
// };

// export default {
//   getAllTrips,
//   getTrip,
//   getTripStudents,
//   getMySchedule,
//   createTrip,
//   updateTrip,
//   deleteTrip,
//   checkIn,
//   checkInWithFace,
//   markAsAbsent
// };
// src/services/tripService.js
import api, {
  checkIn as apiCheckIn,
  createTrip as apiCreateTrip,
  deleteTrip as apiDeleteTrip,
  getAllTrips as apiGetAllTrips,
  getTrip as apiGetTrip,
  markAsAbsent as apiMarkAsAbsent,
  updateTrip as apiUpdateTrip,
} from '../api/apiClient';

// Import tất cả mock response đã chuẩn bị
import {
  mockMyScheduleResponse,
  mockGetTripResponse,
  mockGetTripStudentsResponse,
  mockCheckInResponse,
  mockCheckInWithFaceResponse,
  mockMarkAsAbsentResponse,
  mockGetAllTripsResponse,
} from '../mocks/mockTripResponses';

/**
 * Lấy tất cả chuyến đi (Manager/Admin)
 * Backend returns: { status: 'success', results: N, data: [trips] }
 */
export const getAllTrips = async () => {
  try {
    const response = await apiGetAllTrips();
    // Backend trả về response.data.data là array trips trực tiếp
    return response.data.data || [];
  } catch (error) {
    console.warn('[tripService] getAllTrips failed → using mock data', error.message || error);
    return mockGetAllTripsResponse.data.trips || mockGetAllTripsResponse.data;
  }
};

/**
 * Lấy chi tiết 1 chuyến đi
 * Backend returns: { status: 'success', data: trip }
 */
export const getTrip = async (tripId) => {
  try {
    const response = await apiGetTrip(tripId);
    // Backend trả về response.data.data là trip object trực tiếp
    return response.data.data || null;
  } catch (error) {
    console.warn(`[tripService] getTrip(${tripId}) failed → using mock`, error.message || error);
    return mockGetTripResponse.data.trip;
  }
};

/**
 * Lấy danh sách học sinh trong chuyến đi
 * Backend returns: { status: 'success', data: [studentStops] }
 */
export const getTripStudents = async (tripId) => {
  try {
    const response = await api.get(`/trips/${tripId}/students`);
    // Backend trả về response.data.data là array studentStops trực tiếp
    return response.data.data || [];
  } catch (error) {
    console.warn(`[tripService] getTripStudents(${tripId}) failed → using mock`, error.message || error);
    return mockGetTripStudentsResponse.data.students;
  }
};

/**
 * Lấy lịch trình của tài xế hiện tại (Driver) - API quan trọng nhất
 * Backend returns: { status: 'success', results: N, data: [trips] }
 */
export const getMySchedule = async () => {
  try {
    const response = await api.get('/trips/my-schedule');
    // Backend trả về response.data.data là array trips của driver
    return response.data.data || [];
  } catch (error) {
    console.warn('[tripService] getMySchedule failed → using mock schedule', error.message || error);
    return mockMyScheduleResponse.data;
  }
};

/**
 * Tạo chuyến đi mới (Admin/Manager)
 * Backend factory returns: { status: 'success', data: trip }
 */
export const createTrip = async (tripData) => {
  try {
    const response = await apiCreateTrip(tripData);
    // Factory trả về response.data.data là trip object trực tiếp
    return response.data.data || null;
  } catch (error) {
    console.warn('[tripService] createTrip failed → returning mock', error.message || error);
    return mockGetTripResponse.data.trip;
  }
};

/**
 * Cập nhật chuyến đi (Admin/Manager)
 * Backend returns: { status: 'success', data: { data: updatedTrip } }
 */
export const updateTrip = async (tripId, tripData) => {
  try {
    const response = await apiUpdateTrip(tripId, tripData);
    // updateTrip custom trả về response.data.data.data là trip object
    return response.data.data?.data || response.data.data || null;
  } catch (error) {
    console.warn(`[tripService] updateTrip(${tripId}) failed → returning mock`, error.message || error);
    return mockGetTripResponse.data.trip;
  }
};

/**
 * Xóa chuyến đi (Admin/Manager)
 */
export const deleteTrip = async (tripId) => {
  try {
    await apiDeleteTrip(tripId);
    return true;
  } catch (error) {
    console.warn(`[tripService] deleteTrip(${tripId}) failed → still return true (mock)`, error.message || error);
    return true; // vẫn cho phép xóa ở UI
  }
};

/**
 * Check-in học sinh thông thường (nút "CÓ")
 */
export const checkIn = async (tripId, data) => {
  try {
    const response = await apiCheckIn(tripId, data);
    return response.data.data;
  } catch (error) {
    console.warn(`[tripService] checkIn failed → mock success`, error.message || error);
    return {
      ...mockCheckInResponse.data,
      studentId: data.studentId,
      stationId: data.stationId,
      checkInTime: new Date().toISOString(),
    };
  }
};

/**
 * Check-in bằng Face ID
 */
export const checkInWithFace = async (tripId, imageFile, stationId) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (stationId) formData.append('stationId', stationId);

    const response = await api.post(`/trips/${tripId}/check-in-face`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data;
  } catch (error) {
    console.warn('[tripService] checkInWithFace failed → mock face recognition success', error.message || error);
    return mockCheckInWithFaceResponse.data;
  }
};

/**
 * Đánh dấu học sinh vắng mặt
 */
export const markAsAbsent = async (tripId, studentId) => {
  try {
    const response = await apiMarkAsAbsent(tripId, studentId);
    return response.data.data;
  } catch (error) {
    console.warn(`[tripService] markAsAbsent(${studentId}) failed → mock absent`, error.message || error);
    return {
      ...mockMarkAsAbsentResponse.data,
      studentId,
      markedAt: new Date().toISOString(),
    };
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
  markAsAbsent,
};