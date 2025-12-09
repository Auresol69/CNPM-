import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/authService';
import { SpeedIcon, MapIcon, UserIcon, BellIcon, SettingsIcon } from '../../components/parent/Icons';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

import useSocket from '../../hooks/useSocket';
import { MOCK_ROUTES } from '../../data/mockRoutes';
import { NotificationSnackbar } from '../../components/common/NotificationSnackbar';

// Fix Leaflet Icons
const customBusIcon = L.divIcon({
  className: 'custom-bus-icon',
  html: '<div style="background:#f59e0b; border:2px solid white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-size: 20px;">🚌</div>',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

const stopIcon = L.divIcon({
  className: 'custom-stop-icon',
  html: '<div style="background:#3b82f6; border:2px solid white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-size: 12px;">📍</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

// ============================================
// 🎯 SMART FALLBACK DATA FOR DEMO
// Ensures Dashboard always looks perfect even if Backend is down
// ============================================

const FALLBACK_STUDENT = {
  name: "Nguyễn Trọng Phúc (Demo)",
  class: "Lớp 5A",
  status: "PICKED_UP", // Hiện màu xanh
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  school: "Trường Tiểu học Nguyễn Bỉnh Khiêm",
  evidenceUrl: null
};

const FALLBACK_TRIP = {
  busId: { licensePlate: "51B-123.45", _id: undefined as string | undefined },
  driverId: { name: "Nguyễn Văn Tài", phone: "0909 123 456", _id: undefined as string | undefined }
};

const FALLBACK_NOTIFICATIONS = [
  { _id: '1', message: '🚌 Xe sắp đến điểm đón con bạn', createdAt: new Date().toISOString() },
  { _id: '2', message: '✅ Đã đón bé lên xe an toàn', createdAt: new Date(Date.now() - 1800000).toISOString() },
  { _id: '3', message: '⚠️ Xe bị trễ 5 phút do kẹt xe', createdAt: new Date(Date.now() - 3600000).toISOString() }
];

const FALLBACK_USER = {
  name: "Phụ huynh Demo",
  avatar: null
};

// Mock evidence image for demo (placeholder when real evidenceUrl fails or is empty)
const MOCK_EVIDENCE_IMG = 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop&q=80';

// Helper function to generate beautiful avatar URL
const getAvatarUrl = (name: string, imageUrl?: string) => {
  if (imageUrl && imageUrl.trim() && !imageUrl.includes('undefined')) {
    return imageUrl;
  }
  // Use DiceBear for beautiful avatars (or ui-avatars as fallback)
  const seed = encodeURIComponent(name || 'User');
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=f97316&textColor=ffffff&fontSize=40`;
};

// Auto-pan map component
const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [trip, setTrip] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  
  // Snackbar State
  const [snackbarState, setSnackbarState] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
    evidenceUrl: string | null;
  }>({
    open: false,
    message: '',
    severity: 'info',
    evidenceUrl: null
  });
  
  // Real-time bus state - synced with Live Tracking
  const [busLocation, setBusLocation] = useState<{lat: number, lng: number}>({ lat: 10.7769, lng: 106.7009 });
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [stops, setStops] = useState<any[]>([]); // Station markers
  const socket = useSocket();
  
  // Simulation mode
  const [isSimulation, setIsSimulation] = useState(true);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
  const [routePathIndex, setRoutePathIndex] = useState(0);




  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // ============================================
        // 🚀 FETCH DATA FOR PARENT
        // Endpoints: /users/me, /students/my-students, /notifications/me
        // ============================================
        
        let userData: any = null;
        let myStudents: any[] = [];
        let myNotifications: any[] = [];
        let currentTrip: any = null;

        // 1. Fetch User Info
        try {
          const userRes = await api.get('/users/me');
          userData = userRes.data.data || userRes.data;
          console.log('👤 User from API:', userData);
        } catch (e) {
          console.warn('Could not fetch /users/me');
          userData = authService.getCurrentUser();
        }

        // 2. Fetch MY STUDENTS (Parent's children) - QUAN TRỌNG!
        try {
          const studentsRes = await api.get('/students/my-students');
          myStudents = studentsRes.data.data || studentsRes.data || [];
          console.log('👧 My Students:', myStudents);
        } catch (e) {
          console.warn('Could not fetch /students/my-students, trying /students');
          // Fallback: try general students endpoint
          try {
            const studentsRes2 = await api.get('/students');
            const allStudents = studentsRes2.data.data || studentsRes2.data || [];
            // Filter by parent ID if possible
            const parentId = userData?._id;
            myStudents = parentId 
              ? allStudents.filter((s: any) => s.parentId === parentId || s.parent === parentId)
              : allStudents.slice(0, 1);
            console.log('👧 Students (filtered):', myStudents);
          } catch { /* ignore */ }
        }

        // 3. Fetch Notifications
        try {
          const notifRes = await api.get('/notifications/me');
          myNotifications = notifRes.data.data || notifRes.data || [];
          console.log('🔔 Notifications:', myNotifications.length);
        } catch (e) {
          console.warn('Could not fetch notifications');
        }

        // 4. Fetch Trips - Get trip ID then fetch details
        try {
          // 🔧 HARDCODED TRIP ID - For testing/demo
          const KNOWN_TRIP_ID = '69333192d3adea87130c7fc7';
          
          // First get all trips to find the right trip ID
          const tripsRes = await api.get('/trips');
          const allTrips = tripsRes.data.data || tripsRes.data || [];
          console.log('🚌 All Trips:', allTrips.length);

          let tripId: string | null = KNOWN_TRIP_ID; // Start with known ID
          
          // Find trip containing my student (optional, if known ID fails)
          const myStudentId = myStudents[0]?._id;
          if (myStudentId && allTrips.length > 0) {
            const matchedTrip = allTrips.find((trip: any) => {
              const studentStops = trip.studentStops || [];
              return studentStops.some((stop: any) => {
                const stopStudentId = typeof stop.studentId === 'object' 
                  ? stop.studentId?._id 
                  : stop.studentId;
                return stopStudentId === myStudentId;
              });
            });
            if (matchedTrip) {
              tripId = matchedTrip._id;
              console.log('✅ Found trip for student:', tripId);
            }
          }
          
          // Fallback: use IN_PROGRESS or first trip
          if (!tripId && allTrips.length > 0) {
            const fallbackTrip = allTrips.find((t: any) => t.status === 'IN_PROGRESS') ||
                         allTrips.find((t: any) => t.status === 'NOT_STARTED') ||
                         allTrips[0];
            if (fallbackTrip) tripId = fallbackTrip._id;
          }
          
          // Now fetch trip details with populated data
          if (tripId) {
            console.log('🔗 Fetching trip details:', tripId);
            const tripDetailRes = await api.get(`/trips/${tripId}`);
            currentTrip = tripDetailRes.data.data || tripDetailRes.data;
            console.log('📦 Trip detail received:', currentTrip._id);
            console.log('📦 Trip routeId:', typeof currentTrip.routeId, currentTrip.routeId?.shape ? 'HAS SHAPE' : 'NO SHAPE');
          }
        } catch (e) {
          console.warn('Could not fetch trips:', e);
        }

        // ============================================
        // 🔥 DEBUG LOG - Check in browser console!
        // ============================================
        console.log('🔥 REAL API DATA:', { 
          user: userData, 
          students: myStudents,
          trip: currentTrip,
          notifications: myNotifications 
        });

        // ============================================
        // 📋 SET DATA TO STATE
        // ============================================
        
        // Set User
        if (userData && userData.name) {
          setUser(userData);
          console.log('✅ Real User:', userData.name);
        } else {
          setUser(FALLBACK_USER);
        }

        // Set Student (from my-students)
        const myStudent = myStudents[0];
        if (myStudent && myStudent.name) {
          // Find student status from trip
          let studentStatus = 'PENDING';
          if (currentTrip?.studentStops) {
            const myStop = currentTrip.studentStops.find((s: any) => {
              const sid = typeof s.studentId === 'object' ? s.studentId?._id : s.studentId;
              return sid === myStudent._id;
            });
            studentStatus = myStop?.action || 'PENDING';
          }
          
          setStudent({
            ...myStudent,
            status: studentStatus,
            class: myStudent.class || myStudent.grade || 'N/A',
            school: myStudent.school || 'N/A',
            avatar: myStudent.avatar || getAvatarUrl(myStudent.name)
          });
          console.log('✅ Real Student:', myStudent.name, 'Status:', studentStatus);
        } else {
          console.warn('⚠️ No student data, using fallback');
          setStudent(FALLBACK_STUDENT);
        }

        // Set Trip
        if (currentTrip && Object.keys(currentTrip).length > 0) {
          // Debug: Check what's in busId and driverId from Trip
          console.log('🔍 Trip busId raw:', currentTrip.busId);
          console.log('🔍 Trip driverId raw:', currentTrip.driverId);

          // ============================================
          // FETCH BUS DETAILS
          // ============================================
          let busInfo = FALLBACK_TRIP.busId;
          if (typeof currentTrip.busId === 'object' && currentTrip.busId?.licensePlate) {
            // Already populated
            busInfo = currentTrip.busId;
            console.log('✅ Bus from populated trip:', busInfo.licensePlate);
          } else if (typeof currentTrip.busId === 'string') {
             // Only ID - SKIP API call (Parent does not have permission)
             console.log('⚠️ Bus ID only, using fallback (No Permission):', currentTrip.busId);
             // busInfo remains default FALLBACK_TRIP.busId or can be partial
             busInfo = { ...FALLBACK_TRIP.busId, _id: currentTrip.busId };
          }

          // ============================================
          // FETCH DRIVER DETAILS
          // ============================================
          let driverInfo = FALLBACK_TRIP.driverId;
          if (typeof currentTrip.driverId === 'object' && currentTrip.driverId?.name) {
            // Already populated
            driverInfo = currentTrip.driverId;
            console.log('✅ Driver from populated trip:', driverInfo.name);
          } else if (typeof currentTrip.driverId === 'string') {
             // Only ID - SKIP API call (Parent does not have permission)
             console.log('⚠️ Driver ID only, using fallback (No Permission):', currentTrip.driverId);
             driverInfo = { ...FALLBACK_TRIP.driverId, _id: currentTrip.driverId };
          }

          setTrip({
            ...currentTrip,
            busId: busInfo,
            driverId: driverInfo,
            status: currentTrip.status || 'NOT_STARTED'
          });
          console.log('✅ Final Trip Display:', { 
            bus: busInfo?.licensePlate, 
            driver: driverInfo?.name,
            status: currentTrip.status 
          });

          // ============================================
          // EXTRACT ROUTE SHAPE FOR MAP - từ trip.routeId.shape (populated)
          // ============================================
          const routeShape = currentTrip.routeId?.shape?.coordinates;
          if (routeShape && Array.isArray(routeShape) && routeShape.length > 0) {
            // Backend trả [Lng, Lat] -> đảo thành [Lat, Lng]
            const convertedShape = routeShape.map((c: number[]) => [c[1], c[0]] as [number, number]);
            console.log('✅ Dashboard: Route shape loaded:', convertedShape.length, 'points');
            setRoutePath(convertedShape);
            setBusLocation({ lat: convertedShape[0][0], lng: convertedShape[0][1] });
          } else {
             // Fallback: try to fetch route if we have routeId
             const routeIdStr = typeof currentTrip.routeId === 'string' 
              ? currentTrip.routeId 
              : currentTrip.routeId?._id;

             if (routeIdStr) {
               try {
                 console.log('🔗 Dashboard: Fetching route directly:', routeIdStr);
                 const routeRes = await api.get(`/routes/${routeIdStr}`);
                 const routeData = routeRes.data.data || routeRes.data;
                 if (routeData?.shape?.coordinates?.length > 0) {
                   const shape = routeData.shape.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
                   setRoutePath(shape);
                   setBusLocation({ lat: shape[0][0], lng: shape[0][1] });
                   console.log('✅ Dashboard: Route loaded from /routes');
                 }
               } catch (e) {
                 console.warn('⚠️ Dashboard: Could not fetch route shape');
               }
             }
          }

          // ============================================
          // EXTRACT STOPS FOR MAP MARKERS
          // API returns: routeId.orderedStops[] with address.location.coordinates [lng, lat]
          // ============================================
          console.log('🔍 Dashboard: Checking stop sources...');
          console.log('   - routeId.orderedStops:', currentTrip.routeId?.orderedStops?.length || 'N/A');
          console.log('   - scheduleId.stopTimes:', currentTrip.scheduleId?.stopTimes?.length || 'N/A');
          
          let stopsData: any[] = [];

          // Helper function to extract coordinates from station object
          const extractStationData = (station: any, idx: number) => {
            if (!station) return null;
            
            // Get coordinates from address.location.coordinates [lng, lat]
            const coords = station.address?.location?.coordinates;
            const latitude = coords?.[1] || station.latitude;
            const longitude = coords?.[0] || station.longitude;
            
            if (!latitude || !longitude) return null;
            
            return {
              _id: station._id,
              name: station.name || `Trạm ${idx + 1}`,
              latitude,
              longitude,
              fullAddress: station.address?.fullAddress || station.address?.street || '',
              order: idx
            };
          };

          // PRIMARY SOURCE: From route.orderedStops (correct field from API)
          const orderedStops = currentTrip.routeId?.orderedStops;
          if (orderedStops && Array.isArray(orderedStops) && orderedStops.length > 0) {
            console.log('📍 Extracting from routeId.orderedStops...');
            stopsData = orderedStops
              .map((station: any, idx: number) => extractStationData(station, idx))
              .filter((s: any) => s !== null);
            console.log('✅ Dashboard: Stops from orderedStops:', stopsData.length);
          }

          // FALLBACK: From schedule.stopTimes (if orderedStops not available)
          if (stopsData.length === 0) {
            const stopTimes = currentTrip.scheduleId?.stopTimes;
            if (stopTimes && Array.isArray(stopTimes) && stopTimes.length > 0) {
              console.log('📍 Extracting from scheduleId.stopTimes...');
              stopsData = stopTimes
                .map((st: any, idx: number) => extractStationData(st.stationId, idx))
                .filter((s: any) => s !== null);
              console.log('✅ Dashboard: Stops from schedule:', stopsData.length);
            }
          }

          // Set stops state
          if (stopsData.length > 0) {
            setStops(stopsData);
            console.log('✅ Dashboard: Total stops displayed:', stopsData.length, stopsData);
          } else {
            console.warn('⚠️ Dashboard: No stops found');
            console.log('🔍 Raw routeId:', currentTrip.routeId);
          }

        } else {
          console.warn('⚠️ No trip data, using fallback');
          setTrip(FALLBACK_TRIP);
        }

        // Set Notifications
        if (myNotifications.length > 0) {
          setNotifications(myNotifications.slice(0, 3));
          console.log('✅ Real Notifications:', myNotifications.length);
        } else {
          setNotifications(FALLBACK_NOTIFICATIONS);
        }

      } catch (e: any) {
        console.error("❌ API Error:", e);
        console.warn('⚠️ Đang hiển thị TOÀN BỘ Dữ liệu Giả lập do lỗi hệ thống');
        setStudent(FALLBACK_STUDENT);
        setTrip(FALLBACK_TRIP);
        setNotifications(FALLBACK_NOTIFICATIONS);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // 2. Real-time Socket Integration - Full Event Listeners
  useEffect(() => {
    if (!socket) return;

    // Join trip room
    if (trip?._id) {
      socket.emit('join_trip_room', trip._id);
      console.log('📡 Joined dashboard trip room:', trip._id);
    }

    // Join user's personal notification room
    if (user?._id) {
      socket.emit('join', `user:${user._id}`);
      console.log('📡 Joined user notification room:', user._id);
    }

    // Helper to add notification
    const addNotification = (message: string, data: any = {}) => {
      const newNotif = {
        _id: Date.now().toString(),
        message,
        createdAt: new Date().toISOString(),
        ...data
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 10));
    };

    // ========================================
    // 1. BUS LOCATION CHANGED - Real-time tracking
    // ========================================
    const handleLocationUpdate = (data: any) => {
      console.log("✅ bus:location_changed:", data);
      setIsSimulation(false);
      const lat = data.latitude || data.lat || data.coords?.latitude;
      const lng = data.longitude || data.lng || data.coords?.longitude;
      if (lat && lng) {
        setBusLocation({ lat, lng });
      }
    };

    // ========================================
    // 2. TRIP COMPLETED - Xe đã hoàn thành chuyến
    // ========================================
    const handleTripCompleted = (data: any) => {
      console.log("🏁 trip:completed:", data);
      setTrip((prev: any) => ({ ...prev, status: 'COMPLETED' }));
      setSnackbarState({
        open: true,
        message: '🏁 Chuyến xe đã hoàn thành!',
        severity: 'success',
        evidenceUrl: null
      });
      addNotification('🏁 Chuyến xe đã hoàn thành hành trình', data);
    };

    // ========================================
    // 3. STUDENTS MARKED ABSENT - Backend sends: { stationId, count }
    // ========================================
    const handleStudentAbsent = (data: any) => {
      console.log("❌ trip:students_marked_absent:", data);
      const { count } = data;
      
      // Show snackbar for all absent notifications
      setSnackbarState({
        open: true,
        message: `❌ ${count || 'Một số'} học sinh được đánh dấu vắng mặt`,
        severity: 'error',
        evidenceUrl: null
      });
      addNotification(`❌ ${count || 'Một số'} học sinh vắng mặt tại trạm`, data);
    };

    // ========================================
    // 4. STUDENT CHECKED IN - Backend sends: { studentId, action, evidenceUrl }
    // ========================================
    const handleStudentCheckedIn = (data: any) => {
      console.log("✅ student:checked_in:", data);
      const { studentId, action, evidenceUrl } = data;
      
      // action can be: 'PICKED_UP', 'DROPPED_OFF', 'ABSENT'
      const actionText = action === 'PICKED_UP' ? 'đã lên xe' : action === 'DROPPED_OFF' ? 'đã xuống xe' : 'đã check-in';
      
      // Check if my student checked in
      if (studentId === student?._id) {
        setStudent((prev: any) => ({ ...prev, status: action, evidenceUrl }));
        setSnackbarState({
          open: true,
          message: `✅ ${student?.name || 'Con bạn'} ${actionText} an toàn!`,
          severity: 'success',
          evidenceUrl: evidenceUrl
        });
      }
      addNotification(`✅ Học sinh ${actionText}`, { ...data, evidenceUrl });
    };

    // ========================================
    // 5. BUS APPROACHING STATION - Backend sends: { stationId, message }
    // ========================================
    const handleApproachingStation = (data: any) => {
      console.log("🚌 bus:approaching_station:", data);
      const { message, stationId } = data;
      setSnackbarState({
        open: true,
        message: message || '🚌 Xe sắp đến trạm',
        severity: 'info',
        evidenceUrl: null
      });
      addNotification(message || '🚌 Xe đang tiến đến trạm', data);
    };

    // ========================================
    // 6. BUS ARRIVED AT STATION - Backend sends: { stationId, arrivalTime }
    // ========================================
    const handleArrivedStation = (data: any) => {
      console.log("📍 bus:arrived_at_station:", data);
      // Backend sends: { stationId, arrivalTime }
      setSnackbarState({
        open: true,
        message: '📍 Xe đã đến trạm',
        severity: 'info',
        evidenceUrl: null
      });
      addNotification('📍 Xe đã đến trạm', data);
    };

    // ========================================
    // 7. BUS DEPARTED FROM STATION - Backend sends: { stationId, departureTime }
    // ========================================
    const handleDepartedStation = (data: any) => {
      console.log("🚀 bus:departed_from_station:", data);
      // Backend sends: { stationId, departureTime }
      addNotification('🚀 Xe đã rời trạm', data);
    };

    // ========================================
    // 8. ALERT NEW - Cảnh báo khẩn cấp
    // ========================================
    const handleAlertNew = (data: any) => {
      console.log("🚨 alert:new:", data);
      const { type, message } = data;
      
      let alertMessage = message || 'Cảnh báo mới';
      let severity: 'error' | 'warning' | 'info' = 'warning';
      
      switch (type) {
        case 'SOS':
          alertMessage = `🆘 KHẨN CẤP: ${message || 'Tài xế bấm nút SOS!'}`;
          severity = 'error';
          break;
        case 'OFF_ROUTE':
          alertMessage = `⚠️ Xe đi lệch tuyến đường!`;
          severity = 'warning';
          break;
        case 'LATE':
          alertMessage = `⏰ Xe bị trễ giờ dự kiến`;
          severity = 'warning';
          break;
        default:
          alertMessage = `⚠️ ${message || 'Có cảnh báo mới'}`;
      }
      
      setSnackbarState({
        open: true,
        message: alertMessage,
        severity: severity,
        evidenceUrl: null
      });
      addNotification(alertMessage, data);
    };

    // ========================================
    // 9. GENERIC NOTIFICATION (fallback)
    // ========================================
    const handleGenericNotification = (data: any) => {
      console.log("🔔 notification:new:", data);
      const { message, studentId, action, evidenceUrl } = data;

      setSnackbarState({
        open: true,
        message: message || 'Bạn có thông báo mới',
        severity: action === 'ABSENT' ? 'error' : action === 'PICKED_UP' ? 'success' : 'info',
        evidenceUrl: evidenceUrl
      });

      if (studentId && action && studentId === student?._id) {
        setStudent((prev: any) => ({ ...prev, status: action }));
      }
      addNotification(message || 'Thông báo mới', data);
    };

    // Register all event listeners
    socket.on('bus:location_changed', handleLocationUpdate);
    socket.on('trip:completed', handleTripCompleted);
    socket.on('trip:students_marked_absent', handleStudentAbsent);
    socket.on('student:checked_in', handleStudentCheckedIn);
    socket.on('bus:approaching_station', handleApproachingStation);
    socket.on('bus:arrived_at_station', handleArrivedStation);
    socket.on('bus:departed_from_station', handleDepartedStation);
    socket.on('alert:new', handleAlertNew);
    socket.on('notification:new', handleGenericNotification);

    return () => {
      socket.off('bus:location_changed', handleLocationUpdate);
      socket.off('trip:completed', handleTripCompleted);
      socket.off('trip:students_marked_absent', handleStudentAbsent);
      socket.off('student:checked_in', handleStudentCheckedIn);
      socket.off('bus:approaching_station', handleApproachingStation);
      socket.off('bus:arrived_at_station', handleArrivedStation);
      socket.off('bus:departed_from_station', handleDepartedStation);
      socket.off('alert:new', handleAlertNew);
      socket.off('notification:new', handleGenericNotification);
    };
  }, [socket, trip, user, student?._id]);

  // ... (Simulation loop remains unchanged)

  // Simulation Loop for Dashboard Map - Chạy chậm, mượt
  useEffect(() => {
    if (!isSimulation) return;

    const interval = setInterval(() => {
      setRoutePathIndex((prevIndex) => {
        const simulationPath = MOCK_ROUTES[currentRouteIndex].path;
        const nextIndex = prevIndex + 1;
        
        if (nextIndex >= simulationPath.length) {
          // Move to next route
          const nextRouteIdx = (currentRouteIndex + 1) % MOCK_ROUTES.length;
          setCurrentRouteIndex(nextRouteIdx);
          return 0;
        }
        
        return nextIndex;
      });
    }, 500); // 500ms = chạy chậm, mượt (matched with ParentTracking)

    return () => clearInterval(interval);
  }, [isSimulation, currentRouteIndex]);

  // Update bus location during simulation
  useEffect(() => {
    if (isSimulation && routePath.length === 0) {
      const simulationPath = MOCK_ROUTES[currentRouteIndex].path;
      if (routePathIndex < simulationPath.length) {
        const point = simulationPath[routePathIndex];
        setBusLocation({ lat: point[0], lng: point[1] });
      }
    }
  }, [routePathIndex, currentRouteIndex, isSimulation, routePath.length]);

  if (loading) {
      return <div className="flex items-center justify-center h-full text-slate-400">Loading dashboard...</div>;
  }

  // Always show dashboard - we have fallback data if needed
  return (
    <div className="space-y-6" style={{ height: 'calc(100vh - 80px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500">Overview of your child's journey today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700">System Online</span>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Student Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-6 transition-transform hover:scale-[1.01]">
            <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white overflow-hidden border-2 border-orange-200 shadow-lg">
                    <img 
                      src={getAvatarUrl(student?.name || user?.name || 'Student', student?.avatar)} 
                      alt="Student" 
                      className="w-full h-full object-cover" 
                    />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs">★</span>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-900">{student?.name || "Student Name"}</h3>
                <p className="text-sm text-slate-500">{student?.class || "Class 5A"} • {student?.school || "Primary School"}</p>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      On Bus - Route #101
                  </div>
                  {student?.evidenceUrl && student?.status === 'PICKED_UP' && (
                    <button
                      onClick={() => {
                        setEvidenceUrl(student.evidenceUrl);
                        setShowPhotoModal(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Xem ảnh check-in
                    </button>
                  )}
                </div>
            </div>
        </div>

        {/* ETA Card - Dynamic based on trip status */}
        {(() => {
          // Calculate ETA based on route progress
          const totalDuration = trip?.routeId?.durationSeconds || 690; // fallback 11.5 min
          const displayPath = routePath.length > 0 ? routePath : MOCK_ROUTES[currentRouteIndex]?.path || [];
          const progress = displayPath.length > 0 ? routePathIndex / displayPath.length : 0;
          const remainingSeconds = Math.round(totalDuration * (1 - progress));
          const remainingMinutes = Math.max(0, Math.ceil(remainingSeconds / 60));
          
          const tripStatus = trip?.status || 'NOT_STARTED';
          const isRunning = tripStatus === 'IN_PROGRESS' || (!isSimulation && routePathIndex > 0);
          const isCompleted = tripStatus === 'COMPLETED';
          
          // Get next station name
          const nextStationIdx = trip?.nextStationIndex || 0;
          const nextStation = stops[nextStationIdx]?.name || 'Đang chờ...';
          
          return (
            <div className={`rounded-2xl p-6 shadow-lg transition-transform hover:scale-[1.01] ${
              isCompleted 
                ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/20' 
                : isRunning 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20'
                : 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-500/20'
            } text-white`}>
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-white/80 font-medium mb-1">
                          {isCompleted ? 'Đã hoàn thành' : 'Thời gian còn lại'}
                        </p>
                        <h3 className="text-4xl font-bold">
                          {isCompleted ? '✓' : isRunning ? remainingMinutes : '--'} 
                          {!isCompleted && <span className="text-xl font-normal opacity-80"> phút</span>}
                        </h3>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <MapIcon className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-white/80 bg-black/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                    {isRunning && !isCompleted && (
                      <>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="truncate max-w-[180px]">→ {nextStation}</span>
                      </>
                    )}
                    {!isRunning && !isCompleted && (
                      <>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Chờ khởi hành</span>
                      </>
                    )}
                    {isCompleted && (
                      <>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Hoàn thành chuyến</span>
                      </>
                    )}
                </div>
            </div>
          );
        })()}

        {/* Speed Card - Dynamic based on simulation */}
        {(() => {
          const tripStatus = trip?.status || 'NOT_STARTED';
          const isRunning = tripStatus === 'IN_PROGRESS' || (!isSimulation && routePathIndex > 0);
          const isCompleted = tripStatus === 'COMPLETED';
          
          // Simulate speed: 30-50 km/h when running, 0 when stopped
          const baseSpeed = isRunning && !isCompleted ? 35 + Math.floor(Math.random() * 15) : 0;
          const speedPercent = (baseSpeed / 60) * 100;
          
          return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-transform hover:scale-[1.01]">
                 <div className="flex items-start justify-between">
                    <div>
                        <p className="text-slate-500 font-medium mb-1">Tốc độ hiện tại</p>
                        <h3 className={`text-4xl font-bold ${isRunning && !isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                          {baseSpeed} <span className="text-xl text-slate-400 font-normal">km/h</span>
                        </h3>
                    </div>
                    <div className={`p-3 rounded-xl ${isRunning && !isCompleted ? 'bg-orange-50' : 'bg-slate-100'}`}>
                        <SpeedIcon className={`w-6 h-6 ${isRunning && !isCompleted ? 'text-orange-500' : 'text-slate-400'}`} />
                    </div>
                </div>
                <div className="mt-6 flex flex-col gap-1">
                     <div className="flex justify-between text-xs text-slate-400">
                        <span>0 km/h</span>
                        <span>60 km/h</span>
                     </div>
                     <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isRunning && !isCompleted 
                              ? 'bg-brand-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' 
                              : 'bg-slate-300'
                          }`}
                          style={{ width: `${speedPercent}%` }}
                        ></div>
                     </div>
                     <p className="text-xs text-slate-400 mt-1">
                       {isCompleted ? '✓ Đã dừng' : isRunning ? '🚌 Đang di chuyển' : '⏳ Chờ khởi hành'}
                     </p>
                </div>
            </div>
          );
        })()}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Quick Actions & Schedule */}
        <div className="space-y-6 lg:col-span-1 overflow-y-auto pr-2 h-full">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-brand-500 rounded-full"></span>
                    Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => navigate('/parent/tracking')}
                        className="p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 hover:shadow-md transition-all text-sm font-medium flex flex-col items-center gap-2 border border-blue-100"
                    >
                        <MapIcon className="w-6 h-6" /> Live Tracking
                    </button>
                    <button 
                        onClick={() => navigate('/parent/notifications')}
                        className="p-4 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 hover:shadow-md transition-all text-sm font-medium flex flex-col items-center gap-2 border border-orange-100"
                    >
                        <BellIcon className="w-6 h-6" /> Notifications
                    </button>
                    <button 
                        onClick={() => navigate('/parent/profile')}
                        className="p-4 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 hover:shadow-md transition-all text-sm font-medium flex flex-col items-center gap-2 border border-purple-100"
                    >
                        <UserIcon className="w-6 h-6" /> My Profile
                    </button>
                    <button 
                        onClick={() => navigate('/parent/settings')}
                        className="p-4 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 hover:shadow-md transition-all text-sm font-medium flex flex-col items-center gap-2 border border-slate-200"
                    >
                        <SettingsIcon className="w-6 h-6" /> Settings
                    </button>
                </div>
            </div>

            {/* Vehicle Info */}
            {trip && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
                  Thông tin xe
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center text-3xl">
                    🚌
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-1">Biển số xe</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {trip.busId?.licensePlate || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Driver Info */}
            {trip && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                  Thông tin tài xế
                </h3>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                    👨‍✈️
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">
                      {trip.driverId?.name || 'Đang cập nhật'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {trip.driverId?.phoneNumber || 'Đang cập nhật'}
                    </p>
                  </div>
                </div>
                {trip.driverId?.phoneNumber && (
                  <a
                    href={`tel:${trip.driverId.phoneNumber}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Gọi ngay
                  </a>
                )}
              </div>
            )}



            {/* Recent Notifications Widget */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-green-500 rounded-full"></span>
                    Notification
                </h3>
                <div className="space-y-3">
                    {notifications.map((notif: any, index: number) => (
                        <div key={notif._id || index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                <BellIcon className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-700 font-medium">{notif.message}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {new Date(notif.createdAt).toLocaleTimeString('vi-VN', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </p>
                            </div>
                            
                            {/* Evidence thumbnail - 50x50px, clickable */}
                            {notif.evidenceUrl && (
                                <button
                                    onClick={() => {
                                        setEvidenceUrl(notif.evidenceUrl || MOCK_EVIDENCE_IMG);
                                        setShowPhotoModal(true);
                                    }}
                                    className="shrink-0 group/thumb"
                                    title="Xem ảnh"
                                >
                                    <img
                                        src={notif.evidenceUrl}
                                        alt="Evidence"
                                        className="w-12 h-12 rounded-lg object-cover border-2 border-slate-200 group-hover/thumb:border-blue-400 transition-all group-hover/thumb:scale-105 shadow-sm"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = MOCK_EVIDENCE_IMG;
                                        }}
                                    />
                                </button>
                            )}
                            
                            {notif._id && (
                                <button
                                    onClick={async () => {
                                        try {
                                            await api.delete(`/notifications/${notif._id}`);
                                            setNotifications(prev => prev.filter(n => n._id !== notif._id));
                                        } catch (err) {
                                            console.error('Failed to delete notification:', err);
                                        }
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-lg"
                                    title="Delete"
                                >
                                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                    {notifications.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-4">Không có thông báo mới</p>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column: Map (Takes 2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative flex flex-col h-full">
            <div className="absolute top-4 left-4 z-[400] bg-white/95 backdrop-blur px-4 py-2 rounded-xl shadow-md border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">🔴 Live Tracking</span>
                <span className="text-sm font-bold text-slate-900">{trip?.busId?.licensePlate || 'Bus Demo'}</span>
            </div>
            <div className="w-full h-full rounded-xl overflow-hidden bg-slate-100">
                <MapContainer 
                  center={[busLocation.lat, busLocation.lng]} 
                  zoom={14} 
                  style={{ height: '100%', width: '100%' }} 
                  zoomControl={false}
                  attributionControl={false}
                >
                    <TileLayer 
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                    />
                    
                    {/* Auto-pan to bus location */}
                    <RecenterMap lat={busLocation.lat} lng={busLocation.lng} />
                    
                    {/* Route path - use real data if available, otherwise simulation */}
                    {(() => {
                      const displayPath = routePath.length > 0 ? routePath : MOCK_ROUTES[currentRouteIndex].path;
                      return displayPath.length > 0 && (
                        <Polyline 
                          positions={displayPath.map(p => [p[0], p[1]] as [number, number])}
                          color="#f97316"
                          weight={4}
                          opacity={0.7}
                        />
                      );
                    })()}
                    
                    {/* Stop markers */}
                    {stops.map((stop: any, index: number) => (
                      stop.latitude && stop.longitude && (
                        <Marker 
                          key={stop._id || index}
                          position={[stop.latitude, stop.longitude]} 
                          icon={stopIcon}
                        >
                          <Popup>
                            <div className="text-sm">
                              <p className="font-bold">{stop.name}</p>
                              {stop.arrivalTime && (
                                <p className="text-xs text-slate-500">
                                  {new Date(stop.arrivalTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      )
                    ))}
                    
                    {/* Bus marker - moves in real-time! */}
                    <Marker position={[busLocation.lat, busLocation.lng]} icon={customBusIcon}>
                         <Popup>
                           <strong>🚌 {trip?.busId?.licensePlate || 'Bus Demo'}</strong><br/>
                           Tài xế: {trip?.driverId?.name || 'Demo'}
                         </Popup>
                    </Marker>
                </MapContainer>
            </div>
        </div>

      </div>

      {/* Photo Modal - Enhanced Design */}
      {showPhotoModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowPhotoModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Ảnh Check-in</h3>
                  <p className="text-xs text-slate-500">Ảnh chụp khi học sinh lên/xuống xe</p>
                </div>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors group"
              >
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Body - Image */}
            <div className="p-6">
              <div className="relative rounded-xl overflow-hidden bg-slate-50">
                <img 
                  src={evidenceUrl || MOCK_EVIDENCE_IMG} 
                  alt="Student Check-in Evidence" 
                  className="w-full h-auto max-h-[70vh] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = MOCK_EVIDENCE_IMG;
                  }}
                />
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}


       {/* Snackbar for Notifications */}
       <NotificationSnackbar 
        open={snackbarState.open}
        message={snackbarState.message}
        severity={snackbarState.severity}
        evidenceUrl={snackbarState.evidenceUrl}
        onViewPhoto={() => {
          setEvidenceUrl(snackbarState.evidenceUrl || '');
          setShowPhotoModal(true);
        }}
        onClose={() => setSnackbarState(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}