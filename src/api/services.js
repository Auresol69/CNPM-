import api from './client'

// ============================================================
// ADMIN SERVICE - Kết nối Backend của Bao
// Base URL: https://smart-school-bus-api.onrender.com/api/v1
// ============================================================

export const AdminService = {

  // ==================== AUTHENTICATION ====================
  login: async (credentials) => {
    const response = await api.post('/auth/signin', {
      username: credentials.email || credentials.username,
      password: credentials. password
    })
    
    console.log('Login response:', response.data)
    
    if (response.data. accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('user', JSON.stringify(response.data.data?. user || {}))
    }
    
    return response.data
  },

  refreshToken: async () => {
    const response = await api.post('/auth/token')
    if (response.data. accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken)
    }
    return response.data
  },

  logout: async () => {
    try {
      await api.delete('/auth/logout')
    } finally {
      localStorage. removeItem('accessToken')
      localStorage. removeItem('user')
    }
  },

  // ==================== USERS ====================
  listUsers: async (params = {}) => {
    const response = await api.get('/users', { params })
    return response.data. data || []
  },

  getMe: async () => {
    const response = await api.get('/users/me')
    return response.data.data
  },

  updateMe:  async (data) => {
    const response = await api.patch('/users/me', data)
    return response.data.data
  },

  createUser: async (data) => {
    const response = await api.post('/users', data)
    return response.data.data
  },

  deleteUser: async (id) => {
    await api.delete(`/users/${id}`)
    return { success: true }
  },

  // ==================== DRIVERS ====================
  listDrivers: async (params = {}) => {
    const response = await api.get('/users', { params })
    const users = response.data.data || []
    return users
      .filter(u => u.role === 'Driver')
      .map(u => ({
        ... u,
        user_id: u._id,
        phone_number: u.phoneNumber,
        is_active: u. isActive !== false
      }))
  },

  createDriver: async (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber || data.phone_number,
      password: data.password || 'Driver123',
      role: 'Driver'
    }
    const response = await api.post('/users', payload)
    return response.data.data
  },

  updateDriver: async (id, data) => {
    // FIX: Thử dùng PUT vì PATCH /users/:id trả về 404
    try {
      const response = await api.patch(`/users/${id}`, data)
      return response.data.data
    } catch (error) {
      // Nếu 404, thử fallback sang PUT hoặc endpoint khác nếu cần
      if (error.response?.status === 404) {
        console.warn('PATCH /users/:id failed (404), trying PUT...')
        const response = await api.put(`/users/${id}`, data)
        return response.data.data
      }
      throw error
    }
  },

  deleteDriver:  async (id) => {
    await api.delete(`/users/${id}`)
    return { success:  true }
  },

  // ==================== PARENTS ====================
  listParents: async () => {
    const response = await api. get('/users')
    const users = response.data.data || []
    return users. filter(u => u. role === 'Parent')
  },

  // ==================== STUDENTS ====================
  // 🔴 FIX LỖI 1: parentId là object đã populate từ backend
  listStudents: async (params = {}) => {
    const response = await api.get('/students', { params })
    const students = response.data.data || []
    return students. map(s => {
      // Backend populate parentId thành object User
      let parentName = ''
      let parentPhone = ''
      
      if (s. parentId && typeof s.parentId === 'object') {
        parentName = s.parentId. name || ''
        parentPhone = s. parentId.phoneNumber || ''
      }
      
      return {
        ... s,
        student_id: s._id,
        class:  s.grade,
        parent_name:  parentName,
        parent_phone: parentPhone
      }
    })
  },

  getStudent: async (id) => {
    const response = await api. get(`/students/${id}`)
    return response.data. data
  },

  createStudent: async (data) => {
    const payload = {
      name:  data.name,
      grade: data. grade || data.class,
      parentId: data. parentId || data.parent_id,
      fullAddress: data.fullAddress || 'Chưa cập nhật',
      location:  {
        type: 'Point',
        coordinates: [
          parseFloat(data.longitude) || 106.6942,  // longitude trước
          parseFloat(data.latitude) || 10.7725     // latitude sau
        ]
      }
    }
    const response = await api.post('/students', payload)
    return response.data. data
  },

  updateStudent: async (id, data) => {
    const response = await api. patch(`/students/${id}`, data)
    return response. data.data
  },

  deleteStudent: async (id) => {
    await api.delete(`/students/${id}`)
    return { success: true }
  },

  uploadStudentFace: async (studentId, imageFile) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    
    const response = await api.post(`/students/${studentId}/face-data`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // ==================== BUSES ====================
  listBuses: async (params = {}) => {
    const response = await api.get('/buses', { params })
    const buses = response.data. data || []
    return buses.map(b => ({
      ...b,
      bus_id: b._id,
      plate_number: b.licensePlate
    }))
  },

  getBus: async (id) => {
    const response = await api. get(`/buses/${id}`)
    return response.data. data
  },

  createBus:  async (data) => {
    const response = await api.post('/buses', {
      licensePlate: data. licensePlate || data.plate_number
    })
    return response.data.data
  },

  updateBus: async (id, data) => {
    const response = await api. patch(`/buses/${id}`, data)
    return response. data.data
  },

  deleteBus: async (id) => {
    await api.delete(`/buses/${id}`)
    return { success: true }
  },

  // ==================== STATIONS ====================
  // 🔴 FIX LỖI 3: address.location. coordinates = [longitude, latitude]
  listStations: async (params = {}) => {
    const response = await api.get('/stations', { params })
    const stations = response.data. data || []
    return stations.map(s => {
      // Backend:  address.location.coordinates = [lng, lat]
      const coords = s.address?. location?.coordinates || []
      return {
        ...s,
        station_id:  s._id,
        longitude: coords[0] || null,  // index 0 = longitude
        latitude: coords[1] || null,   // index 1 = latitude
        fullAddress: s.address?.fullAddress || '',
        district: s.address?. district || '',
        city: s.address?.city || ''
      }
    })
  },

  getStation: async (id) => {
    const response = await api.get(`/stations/${id}`)
    return response.data.data
  },

  getWalkingDirections: async (stationId, lat, lng) => {
    const response = await api. get(`/stations/${stationId}/walking-directions`, {
      params: { lat, lng }
    })
    return response.data.data
  },

  // 🔴 FIX LỖI 3:  Gửi đúng format cho backend
  createStation: async (data) => {
    const lat = parseFloat(data.latitude)
    const lng = parseFloat(data. longitude)
    
    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Tọa độ không hợp lệ')
    }
    
    const payload = {
      name: data.name,
      address: {
        fullAddress: data.fullAddress || data.address,
        street: data.street || '',
        district: data.district || '',
        city:  data.city || 'Hồ Chí Minh',
        location: {
          type: 'Point',
          coordinates: [lng, lat]  // Backend yêu cầu [longitude, latitude]
        }
      }
    }
    const response = await api. post('/stations', payload)
    return response.data.data
  },

  updateStation: async (id, data) => {
    const response = await api.patch(`/stations/${id}`, data)
    return response.data. data
  },

  deleteStation: async (id) => {
    await api. delete(`/stations/${id}`)
    return { success: true }
  },

  // ==================== ROUTES ====================
  listRoutes: async (params = {}) => {
    const response = await api.get('/routes', { params })
    const routes = response.data. data || []
    return routes.map(r => ({
      ...r,
      route_id: r._id,
      stops: r.orderedStops || [],
      distance: r.distanceMeters ?  `${(r.distanceMeters / 1000).toFixed(1)} km` : '—',
      duration: r.durationSeconds ? `${Math.round(r. durationSeconds / 60)} phút` : '—'
    }))
  },

  getRoute: async (id) => {
    const response = await api.get(`/routes/${id}`)
    return response. data.data
  },

  createRoute: async (data) => {
    const response = await api. post('/routes', {
      name: data.name,
      stationIds: data.stationIds || data.stop_ids || []
    })
    return response.data. data
  },

  updateRoute: async (id, data) => {
    const response = await api. patch(`/routes/${id}`, data)
    return response. data.data
  },

  deleteRoute: async (id) => {
    await api.delete(`/routes/${id}`)
    return { success: true }
  },

  // ==================== SCHEDULES ====================
  listSchedules: async (params = {}) => {
    const response = await api.get('/schedules', { params })
    const schedules = response. data.data || []
    return schedules.map(s => ({
      ...s,
      schedule_id: s._id,
      route_name: s.routeId?. name || '',
      bus_plate: s.busId?.licensePlate || '',
      driver_name: s. driverId?.name || ''
    }))
  },

  getSchedule: async (id) => {
    const response = await api.get(`/schedules/${id}`)
    return response.data.data
  },

  getScheduleRoute: async (id) => {
    const response = await api.get(`/schedules/${id}/route`)
    return response.data.data
  },

  assignStudentsToStation: async (scheduleId, stationId, studentIds) => {
    const response = await api.patch(
      `/schedules/${scheduleId}/stopTimes/${stationId}/students`,
      { studentIds }
    )
    return response.data.data
  },

  // 🔴 FIX LỖI 4: Backend yêu cầu stopTimes với stationId và arrivalTime
  createSchedule: async (data) => {
    // Lấy route để tạo stopTimes
    let stopTimes = []
    
    if (data. routeId) {
      try {
        const routeResponse = await api.get(`/routes/${data.routeId}`)
        const routeData = routeResponse. data.data
        
        if (routeData?. orderedStops && routeData.orderedStops.length > 0) {
          // Tạo stopTimes với arrivalTime mặc định
          const baseHour = data.direction === 'PICK_UP' ? 6 : 16 // 6:00 sáng hoặc 4:00 chiều
          
          stopTimes = routeData.orderedStops.map((station, index) => {
            const hour = baseHour + Math.floor(index * 10 / 60)
            const minute = (index * 10) % 60
            const arrivalTime = `${hour. toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            
            return {
              stationId: station._id || station,
              arrivalTime:  arrivalTime,
              studentIds: []
            }
          })
        }
      } catch (err) {
        console.error('Error fetching route for stopTimes:', err)
        throw new Error('Không thể lấy thông tin tuyến đường.  Vui lòng thử lại.')
      }
    }
    
    if (stopTimes. length === 0) {
      throw new Error('Tuyến đường không có trạm dừng.  Vui lòng chọn tuyến khác.')
    }
    
    const payload = {
      routeId: data. routeId,
      busId: data.busId,
      driverId: data. driverId,
      direction: data. direction || 'PICK_UP',
      daysOfWeek:  data.daysOfWeek || [1, 2, 3, 4, 5],
      startDate:  data.startDate,
      endDate:  data.endDate,
      stopTimes: stopTimes
    }
    
    const response = await api.post('/schedules', payload)
    return response.data.data
  },

  updateSchedule: async (id, data) => {
    const response = await api.patch(`/schedules/${id}`, data)
    return response.data. data
  },

  deleteSchedule:  async (id) => {
    await api.delete(`/schedules/${id}`)
    return { success: true }
  },

  // ==================== TRIPS ====================
  listTrips: async (params = {}) => {
    const response = await api.get('/trips', { params })
    const trips = response.data. data || []
    return trips.map(t => ({
      ...t,
      trip_id: t._id,
      route_name: t.routeId?. name || t.scheduleId?.routeId?.name || '',
      bus_plate: t.busId?.licensePlate || '',
      driver_name: t.driverId?.name || ''
    }))
  },

  getMySchedule: async () => {
    const response = await api.get('/trips/my-schedule')
    return response. data.data || []
  },

  // 🔴 FIX LỖI 5: Trả về data đầy đủ cho TripDetail
  getTrip: async (id) => {
    const response = await api.get(`/trips/${id}`)
    return response.data.data
  },

  getTripStudents: async (tripId) => {
    const response = await api. get(`/trips/${tripId}/students`)
    return response. data.data || []
  },

  createTrip: async (data) => {
    const response = await api.post('/trips', data)
    return response.data.data
  },

  checkInStudent: async (tripId, studentId, stationId) => {
    const response = await api.patch(`/trips/${tripId}/check-in`, {
      studentId,
      stationId
    })
    return response. data
  },

  checkInWithFace: async (tripId, imageFile) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    
    const response = await api.post(`/trips/${tripId}/check-in-face`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  markStudentAbsent: async (tripId, studentId) => {
    const response = await api.patch(`/trips/${tripId}/mark-absent`, { studentId })
    return response.data
  },

  updateTrip: async (id, data) => {
    const response = await api.patch(`/trips/${id}`, data)
    return response.data.data
  },

  deleteTrip: async (id) => {
    await api.delete(`/trips/${id}`)
    return { success: true }
  },

  // ==================== NOTIFICATIONS ====================
  listNotifications: async (params = {}) => {
    const response = await api.get('/notifications/me', { params })
    return response.data.data || []
  },

  deleteNotification: async (id) => {
    await api.delete(`/notifications/${id}`)
    return { success: true }
  },

  // ==================== MESSAGES ====================
  listMessages: async () => {
    try {
      const response = await api.get('/messages/me')
      return response.data.data || []
    } catch {
      return []
    }
  },

  sendMessage:  async (data) => {
    const response = await api.post('/messages', data)
    return response. data.data
  },

  // ==================== ALERTS ====================
  // 🔴 FIX LỖI 6: Backend Alert có busId (ref), driverId (ref), timestamp
  listAlerts: async (params = {}) => {
    try {
      const response = await api.get('/alerts', { params })
      const alerts = response.data.data || []
      
      return alerts.map(alert => ({
        ...alert,
        alert_id:  alert._id,
        // busId đã được populate thành object
        bus_plate: alert.busId?.licensePlate || '',
        driver_name: alert. driverId?.name || '',
        // Backend dùng 'timestamp', không phải 'createdAt'
        createdAt: alert. timestamp || alert.createdAt
      }))
    } catch {
      return []
    }
  },

  // ==================== DASHBOARD STATS ====================
  getDashboardStats: async () => {
    try {
      const [students, drivers, buses, routes, trips] = await Promise.all([
        AdminService.listStudents(),
        AdminService.listDrivers(),
        AdminService.listBuses(),
        AdminService.listRoutes(),
        AdminService. listTrips()
      ])

      const today = new Date().toISOString().split('T')[0]
      const todayTrips = trips.filter(t => t.tripDate?. startsWith(today))
      const activeTrips = todayTrips.filter(t => t. status === 'IN_PROGRESS')
      const completedTrips = todayTrips.filter(t => t.status === 'COMPLETED')

      return {
        totalStudents: students. length,
        totalDrivers: drivers. length,
        totalBuses: buses. length,
        totalRoutes: routes. length,
        todayTrips: todayTrips.length,
        activeTrips: activeTrips.length,
        completedTrips:  completedTrips. length
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        totalStudents: 0,
        totalDrivers:  0,
        totalBuses: 0,
        totalRoutes: 0,
        todayTrips: 0,
        activeTrips: 0,
        completedTrips: 0
      }
    }
  }
}

export default AdminService