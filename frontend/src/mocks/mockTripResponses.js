// // src/mocks/mockTripResponses.js
// import mockCurrentTrip from './mockCurrentTrip';
// import mockSchedule from './mockSchedule';

// /**
//  * Dữ liệu mock đầy đủ để fallback khi gọi API thất bại
//  * Đảm bảo cấu trúc giống hệt response từ backend
//  */

// /** 1. getMySchedule – /trips/my-schedule */
// export const mockMyScheduleResponse = {
//   success: true,
//   statusCode: 200,
//   message: "Lấy lịch trình thành công",
//   data: mockSchedule, // danh sách các chuyến (hôm nay, đang chạy, sắp tới...)
// };

// /** 2. getTrip – /trips/:id */
// export const mockGetTripResponse = {
//   success: true,
//   statusCode: 200,
//   message: "Lấy thông tin chuyến đi thành công",
//   data: {
//     trip: mockCurrentTrip, // dùng mockCurrentTrip làm chi tiết chuyến hiện tại
//   },
// };

// /** 3. getTripStudents – /trips/:tripId/students */
// export const mockGetTripStudentsResponse = {
//   success: true,
//   statusCode: 200,
//   message: "Lấy danh sách học sinh thành công",
//   data: {
//     students: mockCurrentTrip.students.map(s => ({
//       id: s.id,
//       name: s.name,
//       avatar: s.avatar,
//       class: s.class || "Chưa có lớp", // nếu backend có trả thêm class
//       parentName: s.parentName || "Phụ huynh", // fallback tên phụ huynh
//       parentPhone: s.parentPhone || "0901234567",
//       status: s.status || null, // present | absent | null (chưa check-in)
//     })),
//   },
// };

// /** 4. checkIn – PATCH /trips/:tripId/check-in */
// export const mockCheckInResponse = {
//   success: true,
//   statusCode: 200,
//   message: "Check-in thành công",
//   data: {
//     studentId: null, // sẽ được fill động khi gọi
//     status: "present",
//     checkInTime: new Date().toISOString(),
//     stationId: null,
//     stationName: "Trạm hiện tại",
//   },
// };

// /** 5. checkInWithFace – POST /trips/:tripId/check-in-face */
// export const mockCheckInWithFaceResponse = {
//   success: true,
//   statusCode: 200,
//   message: "Nhận diện khuôn mặt và check-in thành công",
//   data: {
//     student: {
//       id: "s10",
//       name: "Trương Bảo Châu",
//     },
//     confidence: 0.98,
//     status: "present",
//     checkInTime: new Date().toISOString(),
//   },
// };

// /** 6. markAsAbsent – PATCH /trips/:tripId/mark-absent */
// export const mockMarkAsAbsentResponse = {
//   success: true,
//   statusCode: 200,
//   message: "Đánh dấu vắng mặt thành công",
//   data: {
//     studentId: null,
//     status: "absent",
//     markedAt: new Date().toISOString(),
//   },
// };

// /** 7. getAllTrips – /trips (dành cho Manager/Admin) */
// export const mockGetAllTripsResponse = {
//   success: true,
//   statusCode: 200,
//   message: "Lấy danh sách chuyến đi thành công",
//   data: {
//     trips: mockSchedule,
//     total: mockSchedule.length,
//   },
// };

// /** 8. Fallback chung khi không xác định được response */
// export const mockGenericSuccess = {
//   success: true,
//   statusCode: 200,
//   message: "Thao tác thành công (mock fallback)",
//   data: {},
// };

// export default {
//   mockMyScheduleResponse,
//   mockGetTripResponse,
//   mockGetTripStudentsResponse,
//   mockCheckInResponse,
//   mockCheckInWithFaceResponse,
//   mockMarkAsAbsentResponse,
//   mockGetAllTripsResponse,
//   mockGenericSuccess,
// };
// src/mocks/mockTripResponses.js
import mockCurrentTrip from './mockCurrentTrip';
import mockSchedule from './mockSchedule';

/**
 * Dữ liệu mock đầy đủ để fallback khi gọi API thất bại
 * Đảm bảo cấu trúc giống hệt response từ backend
 */

/** 1. getMySchedule – /trips/my-schedule */
export const mockMyScheduleResponse = {
  success: true,
  statusCode: 200,
  message: "Lấy lịch trình thành công",
  data: mockSchedule,
};

/** 2. getTrip – /trips/:id */
export const mockGetTripResponse = {
  success: true,
  statusCode: 200,
  message: "Lấy thông tin chuyến đi thành công",
  data: {
    trip: mockCurrentTrip,
  },
};

/** 3. getTripStudents – /trips/:tripId/students */
export const mockGetTripStudentsResponse = {
  success: true,
  statusCode: 200,
  message: "Lấy danh sách học sinh thành công",
  data: {
    students: mockCurrentTrip.students.map(s => ({
      id: s.id,
      name: s.name,
      avatar: s.avatar,
      class: s.class || "Chưa có lớp",
      parentName: s.parentName || "Phụ huynh",
      parentPhone: s.parentPhone || "0901234567",
      status: s.status || null,
    })),
  },
};

/** 4. checkIn – PATCH /trips/:tripId/check-in */
export const mockCheckInResponse = {
  success: true,
  statusCode: 200,
  message: "Check-in thành công",
  data: {
    studentId: null,
    status: "present",
    checkInTime: new Date().toISOString(),
    stationId: null,
    stationName: "Trạm hiện tại",
  },
};

/** 5. checkInWithFace – POST /trips/:tripId/check-in-face */
export const mockCheckInWithFaceResponse = {
  success: true,
  statusCode: 200,
  message: "Nhận diện khuôn mặt và check-in thành công",
  data: {
    student: {
      id: "s10",
      name: "Trương Bảo Châu",
    },
    confidence: 0.98,
    status: "present",
    checkInTime: new Date().toISOString(),
  },
};

/** 6. markAsAbsent – PATCH /trips/:tripId/mark-absent */
export const mockMarkAsAbsentResponse = {
  success: true,
  statusCode: 200,
  message: "Đánh dấu vắng mặt thành công",
  data: {
    studentId: null,
    status: "absent",
    markedAt: new Date().toISOString(),
  },
};

/** 7. getAllTrips – /trips */
export const mockGetAllTripsResponse = {
  success: true,
  statusCode: 200,
  message: "Lấy danh sách chuyến đi thành công",
  data: {
    trips: mockSchedule,
    total: mockSchedule.length,
  },
};

/** 8. getMyNotifications – /notifications/me */
export const mockMyNotificationsResponse = {
  success: true,
  statusCode: 200,
  message: "Lấy thông báo thành công",
  data: {
    notifications: [
      {
        _id: "notif001",
        title: "Xe đang đến trạm",
        message: "Xe buýt đang đến trạm A - Nguyễn Trãi",
        type: "info",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        _id: "notif002",
        title: "Học sinh vắng",
        message: "Em Nguyễn Văn An chưa lên xe hôm nay",
        type: "warning",
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        _id: "notif003",
        title: "Chuyến đi hoàn thành",
        message: "Xe đã đưa các em về nhà an toàn",
        type: "success",
        isRead: true,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
  },
};

/** 9. getMyMessages – /messages/me */
export const mockGetMyMessagesResponse = {
  success: true,
  statusCode: 200,
  message: "Lấy tin nhắn thành công",
  data: [
    {
      _id: "msg001",
      senderId: "admin001",
      senderName: "Quản lý",
      receiverId: "driver001",
      text: "Chuyến đi hôm nay thế nào anh?",
      createdAt: new Date(Date.now() - 600000).toISOString(),
    },
    {
      _id: "msg002",
      senderId: "driver001",
      senderName: "Tài xế",
      receiverId: "admin001",
      text: "Dạ đang chạy tốt ạ!",
      createdAt: new Date(Date.now() - 300000).toISOString(),
    },
  ],
};

/** 10. getMyStudents – /students/my-students */
export const mockGetMyStudentsResponse = {
  success: true,
  statusCode: 200,
  message: "Lấy danh sách học sinh thành công",
  data: [
    {
      _id: "hs1",
      name: "Nguyễn Văn An",
      class: "6A1",
      parentName: "Cô Lan",
      parentPhone: "0901234567",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=An",
    },
    {
      _id: "hs2",
      name: "Trần Thị Bé",
      class: "6A2",
      parentName: "Anh Hùng",
      parentPhone: "0902345678",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Be",
    },
  ],
};

/** 11. getAllStations – /stations */
export const mockGetAllStationsResponse = {
  success: true,
  statusCode: 200,
  message: "Lấy danh sách trạm thành công",
  data: {
    stations: [
      {
        _id: "st1",
        name: "Trạm A - Nguyễn Trãi",
        address: {
          location: { coordinates: [106.6602, 10.7628] },
        },
      },
      {
        _id: "st2",
        name: "Trạm B - Lê Văn Sỹ",
        address: {
          location: { coordinates: [106.6670, 10.7640] },
        },
      },
    ],
  },
};

/** 12. getAllRoutes – /routes */
export const mockGetAllRoutesResponse = {
  success: true,
  statusCode: 200,
  message: "Lấy danh sách tuyến đường thành công",
  data: {
    routes: [
      {
        _id: "route001",
        name: "Tuyến A1 - Quận 7 → Lê Quý Đôn",
        distanceMeters: 8500,
        durationSeconds: 1800,
        shape: {
          type: "LineString",
          coordinates: [[106.6602, 10.7628], [106.6670, 10.7640], [106.6950, 10.7800]],
        },
      },
    ],
  },
};

/** 13. Fallback chung khi không xác định được response */
export const mockGenericSuccess = {
  success: true,
  statusCode: 200,
  message: "Thao tác thành công (mock fallback)",
  data: {},
};

export default {
  mockMyScheduleResponse,
  mockGetTripResponse,
  mockGetTripStudentsResponse,
  mockCheckInResponse,
  mockCheckInWithFaceResponse,
  mockMarkAsAbsentResponse,
  mockGetAllTripsResponse,
  mockMyNotificationsResponse,
  mockGetMyMessagesResponse,
  mockGetMyStudentsResponse,
  mockGetAllStationsResponse,
  mockGetAllRoutesResponse,
  mockGenericSuccess,
};