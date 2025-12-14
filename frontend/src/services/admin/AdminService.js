// src/services/admin/AdminService.js
// Admin API Service - Kết nối Backend
import api from '../../api/apiClient';

// ============================================================
// ADMIN SERVICE - Kết nối Backend
// ============================================================

export const AdminService = {

  // ==================== AUTHENTICATION ====================
  login: async (credentials) => {
    const response = await api.post('/auth/signin', {
      username: credentials.email || credentials.username,
      password: credentials.password
    });
    
    console.log('Admin Login response:', response.data);
    
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('token', response.data.accessToken); // For compatibility
      localStorage.setItem('user', JSON.stringify(response.data.data?.user || {}));
    }
    
    return response.data;
  },

  logout: async () => {
    try {
      await api.delete('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // ==================== USERS ====================
  listUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data.data || [];
  },

  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data.data;
  },

  // ==================== PARENTS ====================
  listParents: async (params = {}) => {
    const response = await api.get('/users', { params });
    const users = response.data.data || [];
    return users
      .filter(u => u.role === 'Parent')
      .map(u => ({
        ...u,
        user_id: u._id,
        phone_number: u.phoneNumber
      }));
  },

  // ==================== DRIVERS ====================
  listDrivers: async (params = {}) => {
    const response = await api.get('/users', { params });
    const users = response.data.data || [];
    return users
      .filter(u => u.role === 'Driver')
      .map(u => ({
        ...u,
        user_id: u._id,
        phone_number: u.phoneNumber,
        is_active: u.isActive !== false
      }));
  },

  createDriver: async (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber || data.phone_number,
      password: data.password || 'Driver123',
      role: 'Driver'
    };
    const response = await api.post('/users', payload);
    return response.data.data;
  },

  updateDriver: async (id, data) => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data.data;
  },

  deleteDriver: async (id) => {
    await api.delete(`/users/${id}`);
    return { success: true };
  },

  // ==================== STUDENTS ====================
  listStudents: async (params = {}) => {
    const response = await api.get('/students', { params });
    const students = response.data.data || [];
    return students.map(s => {
      let parentName = '';
      let parentPhone = '';
      
      if (s.parentId && typeof s.parentId === 'object') {
        parentName = s.parentId.name || '';
        parentPhone = s.parentId.phoneNumber || '';
      }
      
      return {
        ...s,
        student_id: s._id,
        class: s.grade,
        parent_name: parentName,
        parent_phone: parentPhone
      };
    });
  },

  getStudent: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data.data;
  },

  createStudent: async (data) => {
    const payload = {
      name: data.name,
      grade: data.grade || data.class,
      parentId: data.parentId || data.parent_id,
      fullAddress: data.fullAddress || 'Chưa cập nhật',
      location: {
        type: 'Point',
        coordinates: [
          parseFloat(data.longitude) || 106.6942,
          parseFloat(data.latitude) || 10.7725
        ]
      }
    };
    const response = await api.post('/students', payload);
    return response.data.data;
  },

  updateStudent: async (id, data) => {
    const response = await api.patch(`/students/${id}`, data);
    return response.data.data;
  },

  deleteStudent: async (id) => {
    await api.delete(`/students/${id}`);
    return { success: true };
  },

  uploadStudentFace: async (studentId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post(`/students/${studentId}/face-data`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // ==================== BUSES ====================
  listBuses: async (params = {}) => {
    const response = await api.get('/buses', { params });
    const buses = response.data.data || [];
    return buses.map(b => ({
      ...b,
      bus_id: b._id,
      plate_number: b.licensePlate
    }));
  },

  getBus: async (id) => {
    const response = await api.get(`/buses/${id}`);
    return response.data.data;
  },

  createBus: async (data) => {
    const response = await api.post('/buses', {
      licensePlate: data.licensePlate || data.plate_number
    });
    return response.data.data;
  },

  updateBus: async (id, data) => {
    const response = await api.patch(`/buses/${id}`, data);
    return response.data.data;
  },

  deleteBus: async (id) => {
    await api.delete(`/buses/${id}`);
    return { success: true };
  },

  // ==================== STATIONS ====================
  listStations: async (params = {}) => {
    const response = await api.get('/stations', { params });
    const stations = response.data.data || [];
    return stations.map(s => {
      const coords = s.address?.location?.coordinates || [];
      return {
        ...s,
        station_id: s._id,
        longitude: coords[0] || null,
        latitude: coords[1] || null,
        fullAddress: s.address?.fullAddress || '',
        district: s.address?.district || '',
        city: s.address?.city || ''
      };
    });
  },

  getStation: async (id) => {
    const response = await api.get(`/stations/${id}`);
    return response.data.data;
  },

  createStation: async (data) => {
    const lat = parseFloat(data.latitude);
    const lng = parseFloat(data.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Tọa độ không hợp lệ');
    }
    
    const payload = {
      name: data.name,
      address: {
        fullAddress: data.fullAddress || data.address,
        street: data.street || '',
        district: data.district || '',
        city: data.city || 'Hồ Chí Minh',
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      }
    };
    const response = await api.post('/stations', payload);
    return response.data.data;
  },

  updateStation: async (id, data) => {
    const response = await api.patch(`/stations/${id}`, data);
    return response.data.data;
  },

  deleteStation: async (id) => {
    await api.delete(`/stations/${id}`);
    return { success: true };
  },

  // ==================== ROUTES ====================
  listRoutes: async (params = {}) => {
    const response = await api.get('/routes', { params });
    const routes = response.data.data || [];
    return routes.map(r => ({
      ...r,
      route_id: r._id,
      stops: r.orderedStops || [],
      distance: r.distanceMeters ? `${(r.distanceMeters / 1000).toFixed(1)} km` : '—',
      duration: r.durationSeconds ? `${Math.round(r.durationSeconds / 60)} phút` : '—'
    }));
  },

  getRoute: async (id) => {
    const response = await api.get(`/routes/${id}`);
    return response.data.data;
  },

  createRoute: async (data) => {
    const response = await api.post('/routes', {
      name: data.name,
      stationIds: data.stationIds || data.stop_ids || []
    });
    return response.data.data;
  },

  updateRoute: async (id, data) => {
    const response = await api.patch(`/routes/${id}`, data);
    return response.data.data;
  },

  deleteRoute: async (id) => {
    await api.delete(`/routes/${id}`);
    return { success: true };
  },

  // ==================== SCHEDULES ====================
  listSchedules: async (params = {}) => {
    const response = await api.get('/schedules', { params });
    const schedules = response.data.data || [];
    return schedules.map(s => ({
      ...s,
      schedule_id: s._id,
      route_name: s.routeId?.name || '',
      bus_plate: s.busId?.licensePlate || '',
      driver_name: s.driverId?.name || ''
    }));
  },

  getSchedule: async (id) => {
    const response = await api.get(`/schedules/${id}`);
    return response.data.data;
  },

  createSchedule: async (data) => {
    let stopTimes = [];
    
    if (data.routeId) {
      try {
        const routeResponse = await api.get(`/routes/${data.routeId}`);
        const routeData = routeResponse.data.data;
        
        if (routeData?.orderedStops?.length > 0) {
          const baseHour = data.direction === 'PICK_UP' ? 6 : 16;
          
          stopTimes = routeData.orderedStops.map((station, index) => {
            const hour = baseHour + Math.floor(index * 10 / 60);
            const minute = (index * 10) % 60;
            const arrivalTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            
            return {
              stationId: station._id || station,
              arrivalTime: arrivalTime,
              studentIds: []
            };
          });
        }
      } catch (err) {
        console.error('Error fetching route for stopTimes:', err);
        throw new Error('Không thể lấy thông tin tuyến đường.');
      }
    }
    
    const payload = {
      routeId: data.routeId,
      busId: data.busId,
      driverId: data.driverId,
      direction: data.direction || 'PICK_UP',
      daysOfWeek: data.daysOfWeek || [1, 2, 3, 4, 5],
      startDate: data.startDate,
      endDate: data.endDate,
      stopTimes: stopTimes
    };
    
    const response = await api.post('/schedules', payload);
    return response.data.data;
  },

  updateSchedule: async (id, data) => {
    const response = await api.patch(`/schedules/${id}`, data);
    return response.data.data;
  },

  deleteSchedule: async (id) => {
    await api.delete(`/schedules/${id}`);
    return { success: true };
  },

  assignStudentsToStation: async (scheduleId, stationId, studentIds) => {
    const response = await api.patch(
      `/schedules/${scheduleId}/stopTimes/${stationId}/students`,
      { studentIds }
    );
    return response.data.data;
  },

  getScheduleRoute: async (scheduleId) => {
    const response = await api.get(`/schedules/${scheduleId}/route`);
    return response.data.data;
  },

  // ==================== TRIPS ====================
  listTrips: async (params = {}) => {
    const response = await api.get('/trips', { params });
    const trips = response.data.data || [];
    return trips.map(t => ({
      ...t,
      trip_id: t._id,
      route_name: t.routeId?.name || t.scheduleId?.routeId?.name || '',
      bus_plate: t.busId?.licensePlate || '',
      driver_name: t.driverId?.name || ''
    }));
  },

  getTrip: async (id) => {
    const response = await api.get(`/trips/${id}`);
    return response.data.data;
  },

  createTrip: async (data) => {
    const response = await api.post('/trips', data);
    return response.data.data;
  },

  updateTrip: async (id, data) => {
    const response = await api.patch(`/trips/${id}`, data);
    return response.data.data;
  },

  deleteTrip: async (id) => {
    await api.delete(`/trips/${id}`);
    return { success: true };
  },

  // ==================== ALERTS ====================
  listAlerts: async (params = {}) => {
    try {
      const response = await api.get('/alerts', { params });
      const alerts = response.data.data || [];
      
      return alerts.map(alert => ({
        ...alert,
        alert_id: alert._id,
        bus_plate: alert.busId?.licensePlate || '',
        driver_name: alert.driverId?.name || '',
        createdAt: alert.timestamp || alert.createdAt
      }));
    } catch {
      return [];
    }
  },

  // ==================== MESSAGES ====================
  listMessages: async () => {
    try {
      const response = await api.get('/messages/me');
      return response.data.data || [];
    } catch {
      return [];
    }
  },

  sendMessage: async (data) => {
    const response = await api.post('/messages', data);
    return response.data.data;
  },

  // ==================== DASHBOARD STATS ====================
  getDashboardStats: async () => {
    try {
      const [students, drivers, buses, routes, trips] = await Promise.all([
        AdminService.listStudents(),
        AdminService.listDrivers(),
        AdminService.listBuses(),
        AdminService.listRoutes(),
        AdminService.listTrips()
      ]);

      return {
        totalStudents: students.length,
        totalDrivers: drivers.length,
        totalBuses: buses.length,
        totalRoutes: routes.length,
        todayTrips: trips.length
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalStudents: 0,
        totalDrivers: 0,
        totalBuses: 0,
        totalRoutes: 0,
        todayTrips: 0
      };
    }
  }
};

export default AdminService;
