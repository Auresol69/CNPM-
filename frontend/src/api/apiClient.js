// // src/api/apiClient.js
// import axios from "axios";

// // Backend URL – ưu tiên .env, fallback về production
// const API_BASE_URL =
//   import.meta.env.VITE_API_URL || "https://smart-school-bus-api.onrender.com/api/v1";

// // Tạo instance Axios
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 15000, // tăng timeout lên 15s cho mạng yếu & Face ID
//   // Cho phép gửi cookie nếu backend dùng httpOnly (tương lai)
//   withCredentials: false,
// });

// // === REQUEST INTERCEPTOR: TỰ ĐỘNG GẮN TOKEN ===
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     // Debug nhẹ (chỉ ở dev)
//     if (import.meta.env.DEV) {
//       console.log(`API Request → ${config.method?.toUpperCase()} ${config.url}`);
//     }
//     return config;
//   },
//   (error) => {
//     console.error("Request interceptor error:", error);
//     return Promise.reject(error);
//   }
// );

// // === RESPONSE INTERCEPTOR: XỬ LÝ LỖI TOÀN CỤC + AUTO LOGOUT ===
// api.interceptors.response.use(
//   (response) => {
//     // Debug nhẹ
//     if (import.meta.env.DEV) {
//       console.log(`API Success ← ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
//     }
//     return response;
//   },
//   (error) => {
//     const status = error.response?.status;

//     // Xử lý 401 - Token hết hạn hoặc không hợp lệ
//     if (status === 401) {
//       console.warn("Token hết hạn hoặc không hợp lệ → Đăng xuất tự động");
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       // Chỉ redirect khi không phải đang ở trang login
//       if (window.location.pathname !== "/login") {
//         window.location.href = "/login?session=expired";
//       }
//     }

//     // Xử lý 403 - Không có quyền (có thể thông báo sau)
//     if (status === 403) {
//       console.warn("Không có quyền truy cập:", error.config?.url);
//     }

//     // Log chi tiết lỗi để dev dễ debug
//     console.error("API Error:", {
//       url: error.config?.url,
//       method: error.config?.method,
//       status,
//       message: error.message,
//       data: error.response?.data,
//     });

//     // Luôn reject để service layer có thể catch
//     return Promise.reject(error);
//   }
// );

// // ======================= AUTH =======================
// export const signUp = (data) => api.post("/auth/signup", data);
// export const signIn = (data) => api.post("/auth/signin", data);
// export const logOut = () => api.delete("/auth/logout");
// export const refreshToken = () => api.post("/auth/token");

// // ======================= USER =======================
// export const getMe = () => api.get("/users/me");
// export const updateMe = (data) => api.patch("/users/me", data);

// // ======================= TRIP =======================
// export const getMySchedule = () => api.get("/trips/my-schedule");
// export const getAllTrips = () => api.get("/trips");
// export const getTrip = (id) => api.get(`/trips/${id}`);
// export const getStudents = (tripId) => api.get(`/trips/${tripId}/students`);
// export const createTrip = (data) => api.post("/trips", data);
// export const updateTrip = (id, data) => api.patch(`/trips/${id}`, data);
// export const deleteTrip = (id) => api.delete(`/trips/${id}`);

// // Check-in thường (nút "CÓ")
// export const checkIn = (tripId, data) =>
//   api.patch(`/trips/${tripId}/check-in`, data);

// // Check-in bằng Face ID
// export const checkInWithFace = (tripId, formData) =>
//   api.post(`/trips/${tripId}/check-in-face`, formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//     timeout: 30000, // Face ID có thể lâu hơn
//   });

// // Đánh dấu vắng
// export const markAsAbsent = (tripId, studentId) =>
//   api.patch(`/trips/${tripId}/mark-absent`, { studentId });

// // ======================= ROUTE =======================
// export const createRoute = (data) => api.post("/routes", data);
// export const getAllRoutes = () => api.get("/routes");
// export const getRoute = (id) => api.get(`/routes/${id}`);
// export const deleteRoute = (id) => api.delete(`/routes/${id}`);

// // ======================= STATION =======================
// export const createStation = (data) => api.post("/stations", data);
// export const getAllStations = () => api.get("/stations");
// export const getStation = (id) => api.get(`/stations/${id}`);
// export const deleteStation = (id) => api.delete(`/stations/${id}`);
// export const getWalkingDirectionsToStation = (id, lat, lng) =>
//   api.get(`/stations/${id}/walking-directions?lat=${lat}&lng=${lng}`);

// // ======================= STUDENT =======================
// export const getMyStudents = () => api.get("/students/my-students");

// // ======================= NOTIFICATION =======================
// export const getMyNotifications = () => api.get("/notifications/me");
// export const deleteMyNotification = (id) => api.delete(`/notifications/${id}`);

// // ======================= MESSAGE =======================
// export const getMyMessages = () => api.get("/messages/me");

// // ======================= SCHEDULE =======================
// export const addStudentsToStop = (scheduleId, stationId, students) =>
//   api.patch(`/schedules/${scheduleId}/stopTimes/${stationId}/students`, { students });

// export const getScheduleRoute = (id) => api.get(`/schedules/${id}/route`);

// // ======================= GENERIC CRUD (dùng cho model nhỏ) =======================
// export const getAllModels = (model) => api.get(`/${model}`);
// export const getOneModel = (model, id) => api.get(`/${model}/${id}`);
// export const createModel = (model, data) => api.post(`/${model}`, data);
// export const updateModel = (model, id, data) => api.patch(`/${model}/${id}`, data);
// export const deleteModel = (model, id) => api.delete(`/${model}/${id}`);

// // ======================= EXPORT DEFAULT =======================
// export default api;
// src/api/apiClient.js
import axios from "axios";

// Backend URL – ưu tiên .env, fallback về production
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://smart-school-bus-api.onrender.com/api/v1";

// Tạo instance Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15s cho mạng yếu & Face ID
  withCredentials: false,
});

// === REQUEST INTERCEPTOR: TỰ ĐỘNG GẮN TOKEN ===
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug nhẹ (chỉ ở dev)
    if (import.meta.env.DEV) {
      console.log(`API Request → ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// === RESPONSE INTERCEPTOR: XỬ LÝ LỖI TOÀN CỤC + AUTO LOGOUT ===
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`API Success ← ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;

    // Xử lý 401 - Token hết hạn hoặc không hợp lệ
    if (status === 401) {
      console.warn("Token hết hạn hoặc không hợp lệ → Đăng xuất tự động");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?session=expired";
      }
    }

    // Xử lý 403 - Không có quyền
    if (status === 403) {
      console.warn("Không có quyền truy cập:", error.config?.url);
    }

    // Log chi tiết lỗi
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status,
      message: error.message,
      data: error.response?.data,
    });

    return Promise.reject(error);
  }
);

// ======================= AUTH =======================
export const signUp = (data) => api.post("/auth/signup", data);
export const signIn = (data) => api.post("/auth/signin", data);
export const logOut = () => api.delete("/auth/logout");
export const refreshToken = () => api.post("/auth/token");

// ======================= USER =======================
export const getMe = () => api.get("/users/me");
export const updateMe = (data) => api.patch("/users/me", data);

// ======================= TRIP =======================
export const getMySchedule = () => api.get("/trips/my-schedule");
export const getAllTrips = () => api.get("/trips");
export const getTrip = (id) => api.get(`/trips/${id}`);
export const getStudents = (tripId) => api.get(`/trips/${tripId}/students`);
export const createTrip = (data) => api.post("/trips", data);
export const updateTrip = (id, data) => api.patch(`/trips/${id}`, data);
export const deleteTrip = (id) => api.delete(`/trips/${id}`);

export const checkIn = (tripId, data) =>
  api.patch(`/trips/${tripId}/check-in`, data);

export const checkInWithFace = (tripId, formData) =>
  api.post(`/trips/${tripId}/check-in-face`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 30000,
  });

export const markAsAbsent = (tripId, studentId) =>
  api.patch(`/trips/${tripId}/mark-absent`, { studentId });

// ======================= ROUTE =======================
export const createRoute = (data) => api.post("/routes", data);
export const getAllRoutes = () => api.get("/routes");
export const getRoute = (id) => api.get(`/routes/${id}`);
export const deleteRoute = (id) => api.delete(`/routes/${id}`);

// ======================= STATION =======================
export const createStation = (data) => api.post("/stations", data);
export const getAllStations = () => api.get("/stations");
export const getStation = (id) => api.get(`/stations/${id}`);
export const deleteStation = (id) => api.delete(`/stations/${id}`);
export const getWalkingDirectionsToStation = (id, lat, lng) =>
  api.get(`/stations/${id}/walking-directions?lat=${lat}&lng=${lng}`);

// ======================= STUDENT =======================
export const getMyStudents = () => api.get("/students/my-students");
export const registerStudentFace = (studentId, formData) =>
  api.post(`/students/${studentId}/register-face`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 30000,
  });

// ======================= NOTIFICATION =======================
export const getMyNotifications = () => api.get("/notifications/me");
export const deleteMyNotification = (id) => api.delete(`/notifications/${id}`);
export const createNotification = (data) => api.post("/notifications", data);
export const sendNotification = (data) => api.post("/notifications/send", data);
export const markNotificationAsRead = (id) => api.patch(`/notifications/${id}`, { isRead: true });
export const markAllNotificationsAsRead = () => api.patch("/notifications/mark-all-read");

// ======================= MESSAGE =======================
export const getMyMessages = () => api.get("/messages/me");

// ======================= SCHEDULE =======================
export const addStudentsToStop = (scheduleId, stationId, students) =>
  api.patch(`/schedules/${scheduleId}/stopTimes/${stationId}/students`, { students });

export const getScheduleRoute = (id) => api.get(`/schedules/${id}/route`);

// ======================= GENERIC CRUD =======================
export const getAllModels = (model) => api.get(`/${model}`);
export const getOneModel = (model, id) => api.get(`/${model}/${id}`);
export const createModel = (model, data) => api.post(`/${model}`, data);
export const updateModel = (model, id, data) => api.patch(`/${model}/${id}`, data);
export const deleteModel = (model, id) => api.delete(`/${model}/${id}`);

// ======================= EXPORT DEFAULT =======================
export default api;