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

// Mock data imports đã bị loại bỏ - chỉ dùng API thực

/**
 * Lấy tất cả chuyến đi (Manager/Admin)
 * Backend returns: { status: 'success', results: N, data: [trips] }
 */
export const getAllTrips = async () => {
  try {
    const response = await apiGetAllTrips();
    return response.data.data || [];
  } catch (error) {
    console.error('[tripService] getAllTrips failed:', error.message || error);
    throw new Error(error.response?.data?.message || 'Không thể lấy danh sách chuyến đi');
  }
};

/**
 * Lấy chi tiết 1 chuyến đi
 * Backend returns: { status: 'success', data: trip }
 */
export const getTrip = async (tripId) => {
  try {
    const response = await apiGetTrip(tripId);
    return response.data.data || null;
  } catch (error) {
    console.error(`[tripService] getTrip(${tripId}) failed:`, error.message || error);
    throw new Error(error.response?.data?.message || 'Không tìm thấy chuyến đi');
  }
};

/**
 * Lấy danh sách học sinh trong chuyến đi
 * Backend returns: { status: 'success', data: [studentStops] }
 */
export const getTripStudents = async (tripId) => {
  try {
    const response = await api.get(`/trips/${tripId}/students`);
    return response.data.data || [];
  } catch (error) {
    console.error(`[tripService] getTripStudents(${tripId}) failed:`, error.message || error);
    throw new Error(error.response?.data?.message || 'Không thể lấy danh sách học sinh');
  }
};

/**
 * Lấy lịch trình của tài xế hiện tại (Driver) - API quan trọng nhất
 * Backend returns: { status: 'success', results: N, data: [trips] }
 */
export const getMySchedule = async () => {
  try {
    const response = await api.get('/trips/my-schedule');
    return response.data.data || [];
  } catch (error) {
    console.error('[tripService] getMySchedule failed:', error.message || error);
    throw new Error(error.response?.data?.message || 'Không thể lấy lịch trình');
  }
};

/**
 * Tạo chuyến đi mới (Admin/Manager)
 * Backend factory returns: { status: 'success', data: trip }
 */
export const createTrip = async (tripData) => {
  try {
    const response = await apiCreateTrip(tripData);
    return response.data.data || null;
  } catch (error) {
    console.error('[tripService] createTrip failed:', error.message || error);
    throw new Error(error.response?.data?.message || 'Tạo chuyến đi thất bại');
  }
};

/**
 * Cập nhật chuyến đi (Admin/Manager)
 * Backend returns: { status: 'success', data: { data: updatedTrip } }
 */
export const updateTrip = async (tripId, tripData) => {
  try {
    const response = await apiUpdateTrip(tripId, tripData);
    return response.data.data?.data || response.data.data || null;
  } catch (error) {
    console.error(`[tripService] updateTrip(${tripId}) failed:`, error.message || error);
    throw new Error(error.response?.data?.message || 'Cập nhật chuyến đi thất bại');
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
    console.error(`[tripService] checkIn failed:`, error.message || error);
    throw new Error(error.response?.data?.message || 'Check-in thất bại');
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
    console.error('[tripService] checkInWithFace failed:', error.message || error);
    throw new Error(error.response?.data?.message || 'Check-in bằng Face ID thất bại');
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
    console.error(`[tripService] markAsAbsent(${studentId}) failed:`, error.message || error);
    throw new Error(error.response?.data?.message || 'Đánh dấu vắng mặt thất bại');
  }
};

/**
 * Helper: Transform backend trip data sang UI format
 * @param {Object} trip - Raw trip data từ getTrip API
 * @returns {Object} - Transformed data cho UI
 */
export const transformTripToUIFormat = (trip) => {
  if (!trip) return null;

  // Tạo map stationId -> students từ studentStops
  const stationStudentsMap = {};
  console.log('[tripService] studentStops count:', trip.studentStops?.length || 0);

  (trip.studentStops || []).forEach(ss => {
    const stationId = String(ss.stationId?._id || ss.stationId);
    console.log('[tripService] studentStop stationId:', stationId, 'studentId:', ss.studentId?._id || ss.studentId);

    if (!stationStudentsMap[stationId]) {
      stationStudentsMap[stationId] = [];
    }
    stationStudentsMap[stationId].push({
      id: ss.studentId?._id || ss.studentId,
      name: ss.studentId?.name || 'N/A',
      grade: ss.studentId?.grade || '',
      status: ss.action, // PENDING, PICKED_UP, DROPPED_OFF, ABSENT
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${ss.studentId?._id || ss.studentId}`
    });
  });

  console.log('[tripService] stationStudentsMap keys:', Object.keys(stationStudentsMap));

  // Transform orderedStops thành stations array cho map
  const stations = (trip.routeId?.orderedStops || []).map((stop, idx) => {
    // Backend returns [lng, lat], Leaflet needs [lat, lng]
    const coords = stop.address?.location?.coordinates;
    const position = coords && coords.length === 2
      ? [coords[1], coords[0]]
      : [10.77, 106.68]; // Default HCM

    // Lấy thời gian từ scheduleId.stopTimes nếu có
    const stopTime = trip.scheduleId?.stopTimes?.[idx];
    const time = stopTime?.arrivalTime || '--:--';

    const stationId = String(stop._id);

    return {
      id: stationId,
      name: stop.name || `Trạm ${idx + 1}`,
      position,
      time,
      address: stop.address?.fullAddress || '',
      // Thêm danh sách học sinh tại trạm này
      students: stationStudentsMap[stationId] || []
    };
  });

  console.log('[tripService] orderedStops station IDs:', stations.map(s => s.id));

  // Transform studentStops thành students array (flat list)
  const students = (trip.studentStops || []).map(ss => ({
    id: ss.studentId?._id || ss.studentId,
    name: ss.studentId?.name || 'N/A',
    grade: ss.studentId?.grade || '',
    stationId: String(ss.stationId?._id || ss.stationId),
    stationName: ss.stationId?.name || '',
    status: ss.action, // PENDING, PICKED_UP, DROPPED_OFF, ABSENT
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${ss.studentId?._id || ss.studentId}`
  }));

  // Tính số học sinh đã hoàn thành (PICKED_UP hoặc DROPPED_OFF)
  const completedStudents = (trip.studentStops || []).filter(
    ss => ss.action === 'PICKED_UP' || ss.action === 'DROPPED_OFF'
  ).length;

  // Tính số học sinh vắng mặt
  const absentStudents = (trip.studentStops || []).filter(
    ss => ss.action === 'ABSENT'
  ).length;

  return {
    id: trip._id,
    name: trip.routeId?.name || 'Chuyến không tên',
    direction: trip.direction, // PICK_UP | DROP_OFF
    status: trip.status, // NOT_STARTED | IN_PROGRESS | COMPLETED | CANCELLED
    tripDate: trip.tripDate,
    busId: trip.busId?._id || trip.busId,
    busLicensePlate: trip.busId?.licensePlate || 'N/A',
    driverId: trip.driverId?._id || trip.driverId,
    routeShape: trip.routeId?.shape || null,
    distanceMeters: trip.routeId?.distanceMeters || 0,
    durationSeconds: trip.routeId?.durationSeconds || 0,
    stations,
    students,
    totalStudents: trip.studentStops?.length || 0,
    completedStudents, // Số học sinh đã đón/trả
    absentStudents, // Số học sinh vắng mặt
    nextStationIndex: trip.nextStationIndex || 0, // Trạm mục tiêu hiện tại
    rawData: trip // Giữ lại raw data nếu cần
  };
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
  transformTripToUIFormat,
};