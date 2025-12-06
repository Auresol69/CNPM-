// src/api/apiClient.js
import axios from "axios";

// Backend đang chạy trên port 3000 (theo backend/index.js)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// === INTERCEPTOR: TỰ ĐỘNG THÊM TOKEN ===
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// === INTERCEPTOR: XỬ LÝ LỖI TOÀN CỤC ===
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    // Trả về dữ liệu lỗi từ backend (nếu có) hoặc thông báo mặc định
    const errorMessage = error.response?.data?.message || error.message || "Lỗi không xác định";
    return Promise.reject(new Error(errorMessage));
  }
);

// === AUTH API ===
export const signUp = (data) => api.post("/auth/signup", data);
export const signIn = (data) => api.post("/auth/signin", data);
export const logOut = () => api.delete("/auth/logout");
export const refreshToken = () => api.post("/auth/token");

// === GENERIC MODELS (dùng cho các model nhỏ) ===
export const getAllModels = (model) => api.get(`/${model}`);
export const getOneModel = (model, id) => api.get(`/${model}/${id}`);
export const createModel = (model, data) => api.post(`/${model}`, data);
export const updateModel = (model, id, data) => api.patch(`/${model}/${id}`, data);
export const deleteModel = (model, id) => api.delete(`/${model}/${id}`);

// === MESSAGE ===
export const getMyMessages = () => api.get("/messages/me");

// === SCHEDULE ===
export const addStudentsToStop = (scheduleId, stationId, students) =>
  api.patch(`/schedules/${scheduleId}/stopTimes/${stationId}/students`, { students });

export const getScheduleRoute = (id) => api.get(`/schedules/${id}/route`);

// === STUDENT ===
export const getMyStudents = () => api.get("/students/my-students");

// === NOTIFICATION ===
export const getMyNotifications = () => api.get("/notifications/me");
export const deleteMyNotification = (id) => api.delete(`/notifications/${id}`);

// === ROUTE ===
export const createRoute = (data) => api.post("/routes", data);
export const getAllRoutes = () => api.get("/routes");
export const getRoute = (id) => api.get(`/routes/${id}`);
export const deleteRoute = (id) => api.delete(`/routes/${id}`);

// === STATION ===
export const createStation = (data) => api.post("/stations", data);
export const getAllStations = () => api.get("/stations");
export const getWalkingDirectionsToStation = (id, lat, lng) =>
  api.get(`/stations/${id}/walking-directions?lat=${lat}&lng=${lng}`);
export const getStation = (id) => api.get(`/stations/${id}`);
export const deleteStation = (id) => api.delete(`/stations/${id}`);

// === USER ===
export const getMe = () => api.get("/users/me");
export const updateMe = (data) => api.patch("/users/me", data);

// === TRIP ===
export const createTrip = (data) => api.post("/trips", data);
export const updateTrip = (id, data) => api.patch(`/trips/${id}`, data);
export const checkIn = (tripId, data) => api.patch(`/trips/${tripId}/check-in`, data);
export const markAsAbsent = (tripId, studentId) =>
  api.patch(`/trips/${tripId}/mark-absent`, { studentId });

export const getTrip = (id) => api.get(`/trips/${id}`);
export const getAllTrips = () => api.get("/trips");
export const deleteTrip = (id) => api.delete(`/trips/${id}`);

// === XUẤT API ĐỂ DÙNG Ở NƠI KHÁC IMPORT ===
export default api;