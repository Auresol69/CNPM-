// // src/services/socketService.js
// import io from 'socket.io-client';
// import { getToken } from './authService';
// import { getTrip } from './tripService'; // ← Import đúng từ tripService

// let socket = null;

// // URL backend – dùng cùng với HTTP API để đảm bảo đồng bộ
// const API_BASE_URL =
//   import.meta.env.VITE_API_URL || 'https://smart-school-bus-api.onrender.com';

// /**
//  * Kết nối Socket.IO với token xác thực
//  * @returns {import('socket.io-client').Socket | null}
//  */
// export const connectSocket = () => {
//   const token = getToken();

//   if (!token) {
//     console.warn('Không có token → Không kết nối Socket.IO');
//     return null;
//   }

//   // Nếu đã kết nối rồi thì không tạo lại
//   if (socket && socket.connected) {
//     return socket;
//   }

//   // Tạo kết nối mới
//   socket = io(API_BASE_URL, {
//     auth: { token },
//     reconnection: true,
//     reconnectionAttempts: 10,
//     reconnectionDelay: 3000,
//     timeout: 15000,
//     transports: ['websocket', 'polling'], // Ưu tiên websocket, fallback polling
//   });

//   // Log trạng thái kết nối
//   socket.on('connect', () => {
//     console.log('Socket.IO đã kết nối thành công:', socket.id);
//   });

//   socket.on('connect_error', (error) => {
//     console.error('Socket.IO kết nối thất bại:', error.message);
//   });

//   socket.on('disconnect', (reason) => {
//     console.warn('Socket.IO ngắt kết nối:', reason);
//     if (reason === 'io server disconnect') {
//       // Server chủ động ngắt → thử kết nối lại
//       socket.connect();
//     }
//   });

//   socket.on('error', (err) => {
//     console.error('Socket.IO lỗi:', err);
//   });

//   return socket;
// };

// /**
//  * Ngắt kết nối Socket.IO
//  */
// export const disconnectSocket = () => {
//   if (socket) {
//     socket.disconnect();
//     socket = null;
//     console.log('Socket.IO đã ngắt kết nối thủ công');
//   }
// };

// /**
//  * Tham gia room của chuyến đi (trip_<id>)
//  * @param {string} tripId
//  */
// export const joinTripRoom = (tripId) => {
//   if (socket && tripId) {
//     socket.emit('join_trip', tripId);
//     console.log(`Đã tham gia room: trip_${tripId}`);
//   }
// };

// /**
//  * Rời room của chuyến đi
//  * @param {string} tripId
//  */
// export const leaveTripRoom = (tripId) => {
//   if (socket && tripId) {
//     socket.emit('leave_trip', tripId);
//     console.log(`Đã rời room: trip_${tripId}`);
//   }
// };

// /**
//  * Fallback: Poll dữ liệu chuyến đi nếu Socket.IO bị mất kết nối
//  * @param {string} tripId
//  * @param {Function} callback - Hàm nhận dữ liệu trip mới
//  * @param {number} interval - Khoảng thời gian poll (ms)
//  * @returns {Function} Hàm để dừng poll
//  */
// export const startPollingTrip = (tripId, callback, interval = 30000) => {
//   if (!tripId || typeof callback !== 'function') return () => {};

//   const poller = setInterval(async () => {
//     try {
//       const tripData = await getTrip(tripId);
//       callback(tripData);
//       console.log('Poll cập nhật trip thành công (fallback)');
//     } catch (err) {
//       console.error('Lỗi poll trip:', err.message || err);
//     }
//   }, interval);

//   console.log(`Bắt đầu poll trip_${tripId} mỗi ${interval / 1000}s`);

//   // Trả về hàm để dừng poll khi cần
//   return () => {
//     clearInterval(poller);
//     console.log(`Đã dừng poll trip_${tripId}`);
//   };
// };

// /**
//  * Kiểm tra trạng thái kết nối Socket.IO
//  * @returns {boolean}
//  */
// export const isSocketConnected = () => {
//   return socket?.connected || false;
// };

// /**
//  * Lấy instance socket hiện tại (dùng trong context nếu cần)
//  * @returns {import('socket.io-client').Socket | null}
//  */
// export const getSocket = () => socket;

// export default {
//   connectSocket,
//   disconnectSocket,
//   joinTripRoom,
//   leaveTripRoom,
//   startPollingTrip,
//   isSocketConnected,
//   getSocket,
// };
// src/services/socketService.js
import io from 'socket.io-client';
import { getToken } from './authService';
import { getTrip } from './tripService';

let socket = null;

// Socket URL - cắt bỏ /api/v1 từ API URL
const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'https://smart-school-bus-api.onrender.com';

/**
 * Kết nối Socket.IO với token xác thực
 */
let authErrorLogged = false; // Tránh spam log

export const connectSocket = () => {
  const token = getToken();

  if (!token) {
    if (!authErrorLogged) {
      console.warn('[Socket] Không có token → Không kết nối');
    }
    return null;
  }

  // Nếu đã kết nối rồi, return socket hiện tại
  if (socket && socket.connected) {
    return socket;
  }

  // Nếu socket đang tồn tại nhưng chưa kết nối, không tạo mới
  if (socket) {
    return socket;
  }

  authErrorLogged = false; // Reset khi tạo socket mới

  socket = io(SOCKET_URL, {
    auth: { token },
    path: '/socket.io',
    reconnection: true,
    reconnectionAttempts: 3, // Giảm từ 10 xuống 3
    reconnectionDelay: 5000, // Tăng delay lên 5s
    timeout: 15000,
    transports: ['websocket', 'polling'],
  });

  // === CONNECTION EVENTS ===
  socket.on('connect', () => {
    authErrorLogged = false;
    console.log('[Socket] Kết nối thành công:', socket.id);
  });

  socket.on('connect_error', (error) => {
    // Nếu lỗi authentication, dừng reconnect ngay
    if (error.message?.includes('Authentication') || error.message?.includes('User not found')) {
      if (!authErrorLogged) {
        console.error('[Socket] Lỗi xác thực, dừng kết nối:', error.message);
        authErrorLogged = true;
      }
      // Dừng reconnection
      socket.disconnect();
      socket = null;
      return;
    }
    // Các lỗi khác vẫn log bình thường
    console.error('[Socket] Kết nối thất bại:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.warn('[Socket] Ngắt kết nối:', reason);
    // Không tự động reconnect nếu server disconnect
  });

  socket.on('error', (err) => {
    console.error('[Socket] Lỗi:', err);
  });

  return socket;
};

/**
 * Ngắt kết nối Socket.IO
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[Socket] Đã ngắt kết nối');
  }
};

// ===========================================
// JOIN/LEAVE TRIP ROOM - Đúng với backend
// ===========================================

/**
 * Tham gia room của chuyến đi (đúng event name từ backend)
 * @param {string} tripId - ID của trip
 */
export const joinTripRoom = (tripId) => {
  if (socket && tripId) {
    socket.emit('join_trip_room', tripId); // ← Đúng với backend
    console.log(`[Socket] Đã gửi yêu cầu join room: trip_${tripId}`);
  }
};

/**
 * Rời room của chuyến đi
 * @param {string} tripId
 */
export const leaveTripRoom = (tripId) => {
  if (socket && tripId) {
    socket.emit('leave_trip_room', tripId);
    console.log(`[Socket] Đã gửi yêu cầu rời room: trip_${tripId}`);
  }
};

// ===========================================
// EVENT LISTENERS - Real-time updates
// ===========================================

/**
 * Đăng ký listener cho vị trí xe bus
 * @param {Function} callback - Nhận {latitude, longitude}
 */
export const onBusLocationChanged = (callback) => {
  if (socket) {
    socket.on('bus:location_changed', callback);
  }
};

/**
 * Đăng ký listener khi xe sắp tới trạm
 * @param {Function} callback - Nhận {stationId, message}
 */
export const onBusApproaching = (callback) => {
  if (socket) {
    socket.on('bus:approaching_station', callback);
  }
};

/**
 * Đăng ký listener khi xe đã tới trạm
 * @param {Function} callback - Nhận {stationId, arrivalTime}
 */
export const onBusArrived = (callback) => {
  if (socket) {
    socket.on('bus:arrived_at_station', callback);
  }
};

/**
 * Đăng ký listener khi xe rời trạm
 * @param {Function} callback - Nhận {stationId, departureTime}
 */
export const onBusDeparted = (callback) => {
  if (socket) {
    socket.on('bus:departed_from_station', callback);
  }
};

/**
 * Đăng ký listener khi chuyến bắt đầu
 * @param {Function} callback
 */
export const onTripStarted = (callback) => {
  if (socket) {
    socket.on('trip:started', callback);
  }
};

/**
 * Đăng ký listener khi chuyến hoàn thành
 * @param {Function} callback
 */
export const onTripCompleted = (callback) => {
  if (socket) {
    socket.on('trip:completed', callback);
  }
};

/**
 * Đăng ký listener khi học sinh bị đánh dấu vắng tự động
 * @param {Function} callback - Nhận {stationId, count}
 */
export const onStudentsMarkedAbsent = (callback) => {
  if (socket) {
    socket.on('trip:students_marked_absent', callback);
  }
};

/**
 * Đăng ký listener cho cảnh báo mới (SOS, trễ, chệch tuyến...)
 * @param {Function} callback - Nhận {type, message, tripId, busId}
 */
export const onAlertNew = (callback) => {
  if (socket) {
    socket.on('alert:new', callback);
  }
};

/**
 * Đăng ký listener cho tin nhắn mới
 * @param {Function} callback - Nhận Message object
 */
export const onChatMessage = (callback) => {
  if (socket) {
    socket.on('chat:receive_message', callback);
  }
};

// ===========================================
// EMIT EVENTS - Send to server
// ===========================================

/**
 * Gửi tin nhắn chat
 * @param {string} receiverId - ID người nhận (null nếu gửi cho Admin)
 * @param {string} content - Nội dung tin nhắn
 */
export const sendChatMessage = (receiverId, content) => {
  if (socket) {
    socket.emit('chat:send_message', { receiverId, content });
  }
};

/**
 * Gửi cảnh báo SOS (Driver)
 * @param {string} type - Loại cảnh báo (SOS, EMERGENCY, etc.)
 * @param {string} message - Nội dung cảnh báo
 */
export const sendDriverAlert = (type, message) => {
  if (socket) {
    socket.emit('driver:send_alert', { type, message });
  }
};

/**
 * Bắt đầu chuyến đi (Driver)
 * @param {string} tripId - ID của trip
 */
export const emitStartTrip = (tripId) => {
  // Ensure socket is connected
  if (!socket) {
    console.warn('[Socket] Socket not connected, attempting to connect...');
    const newSocket = connectSocket();
    if (!newSocket) {
      console.error('[Socket] Cannot emit driver:start_trip - socket connection failed');
      return;
    }
  }

  if (socket && socket.connected) {
    socket.emit('driver:start_trip', { tripId });
    console.log('[Socket] ✅ Đã gửi driver:start_trip:', tripId);
  } else {
    console.error('[Socket] ❌ Cannot emit driver:start_trip - socket not connected');
  }
};

/**
 * Kết thúc chuyến đi (Driver)
 * @param {string} tripId - ID của trip
 */
export const emitEndTrip = (tripId) => {
  // Ensure socket is connected
  if (!socket) {
    console.warn('[Socket] Socket not connected, attempting to connect...');
    const newSocket = connectSocket();
    if (!newSocket) {
      console.error('[Socket] Cannot emit driver:end_trip - socket connection failed');
      return;
    }
  }

  if (socket && socket.connected) {
    socket.emit('driver:end_trip', { tripId });
    console.log('[Socket] ✅ Đã gửi driver:end_trip:', tripId);
  } else {
    console.error('[Socket] ❌ Cannot emit driver:end_trip - socket not connected');
  }
};

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Hủy đăng ký listener
 * @param {string} eventName - Tên event
 */
export const offEvent = (eventName) => {
  if (socket) {
    socket.off(eventName);
  }
};

/**
 * Hủy tất cả listeners cho bus/trip events
 */
export const removeAllTripListeners = () => {
  if (socket) {
    socket.off('bus:location_changed');
    socket.off('bus:approaching_station');
    socket.off('bus:arrived_at_station');
    socket.off('bus:departed_from_station');
    socket.off('trip:started');
    socket.off('trip:completed');
    socket.off('trip:students_marked_absent');
    socket.off('alert:new');
  }
};

/**
 * Fallback: Poll dữ liệu trip nếu Socket bị mất
 */
export const startPollingTrip = (tripId, callback, interval = 30000) => {
  if (!tripId || typeof callback !== 'function') return () => { };

  const poller = setInterval(async () => {
    try {
      const tripData = await getTrip(tripId);
      callback(tripData);
    } catch (err) {
      console.error('[Socket] Poll trip lỗi:', err.message || err);
    }
  }, interval);

  return () => clearInterval(poller);
};

export const isSocketConnected = () => socket?.connected || false;
export const getSocket = () => socket;

export default {
  connectSocket,
  disconnectSocket,
  joinTripRoom,
  leaveTripRoom,
  // Listeners
  onBusLocationChanged,
  onBusApproaching,
  onBusArrived,
  onBusDeparted,
  onTripStarted,
  onTripCompleted,
  onStudentsMarkedAbsent,
  onAlertNew,
  onChatMessage,
  // Emitters
  sendChatMessage,
  sendDriverAlert,
  // Utilities
  offEvent,
  removeAllTripListeners,
  startPollingTrip,
  isSocketConnected,
  getSocket,
};
