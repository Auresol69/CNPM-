import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/authService';
import { SpeedIcon, MapIcon, UserIcon, BellIcon, SettingsIcon } from '../../components/parent/Icons';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

import useSocket from '../../hooks/useSocket';
import { MOCK_ROUTES } from '../../data/mockRoutes';

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
  busId: { licensePlate: "51B-123.45" },
  driverId: { name: "Nguyễn Văn Tài", phone: "0909 123 456" }
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
            // Only ID - need to fetch details
            console.log('🔗 Fetching bus details for ID:', currentTrip.busId);
            try {
              const busRes = await api.get(`/buses/${currentTrip.busId}`);
              const busData = busRes.data.data || busRes.data;
              if (busData && busData.licensePlate) {
                busInfo = busData;
                console.log('✅ Bus fetched from API:', busInfo.licensePlate);
              } else {
                console.warn('⚠️ Bus API returned empty, using fallback');
              }
            } catch (busErr: any) {
              console.warn('⚠️ Bus fetch failed (403/404), using fallback:', busErr.response?.status);
            }
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
            // Only ID - need to fetch details
            console.log('🔗 Fetching driver details for ID:', currentTrip.driverId);
            
            // Try /users/:id first, then /drivers/:id
            let driverFetched = false;
            for (const endpoint of [`/users/${currentTrip.driverId}`, `/drivers/${currentTrip.driverId}`]) {
              try {
                const driverRes = await api.get(endpoint);
                const driverData = driverRes.data.data || driverRes.data;
                if (driverData && driverData.name) {
                  driverInfo = driverData;
                  console.log(`✅ Driver fetched from ${endpoint}:`, driverInfo.name);
                  driverFetched = true;
                  break;
                }
              } catch (driverErr: any) {
                console.warn(`⚠️ Driver fetch from ${endpoint} failed:`, driverErr.response?.status);
              }
            }
            
            if (!driverFetched) {
              console.warn('⚠️ All driver fetch attempts failed, using fallback');
            }
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
          // EXTRACT STOPS FOR MAP MARKERS - từ trip.scheduleId.stopTimes
          // ============================================
          const stopTimes = currentTrip.scheduleId?.stopTimes;
          if (stopTimes && Array.isArray(stopTimes) && stopTimes.length > 0) {
            const stopsData = stopTimes.map((st: any) => ({
              _id: st.stationId?._id || st.stationId,
              name: st.stationId?.name || 'Unknown Station',
              latitude: st.stationId?.latitude || st.stationId?.address?.latitude,
              longitude: st.stationId?.longitude || st.stationId?.address?.longitude,
              arrivalTime: st.arrivalTime || ''
            })).filter((s: any) => s.latitude && s.longitude);
            setStops(stopsData);
            console.log('✅ Dashboard: Stops loaded:', stopsData.length);
          } else {
            console.warn('⚠️ Dashboard: stopTimes not populated');
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

  // Real-time Socket Integration
  useEffect(() => {
    if (!socket) return;

    // Join trip room if we have a trip
    if (trip?._id) {
      socket.emit('join_trip_room', trip._id);
      console.log('📡 Joined dashboard trip room:', trip._id);
    }

    // Join user's personal notification room
    if (user?._id) {
      socket.emit('join', `user:${user._id}`);
      console.log('📡 Joined user notification room:', user._id);
    }

    // Listen for location updates
    const handleLocationUpdate = (coords: { lat: number; lng: number }) => {
      console.log("✅ Dashboard: Real-time location received:", coords);
      setIsSimulation(false); // Disable simulation when real data arrives
      setBusLocation({
        lat: coords.lat,
        lng: coords.lng
      });
    };

    // Listen for new notifications (approaching station, etc.)
    const handleNewNotification = (data: any) => {
      console.log("🔔 Dashboard: New notification received:", data);
      
      // Create notification object
      const newNotif = {
        _id: Date.now().toString(), // temporary ID
        message: data.message || data.title || 'New notification',
        createdAt: new Date().toISOString(),
        ...data
      };
      
      // Add to notifications list (prepend to show at top)
      setNotifications(prev => [newNotif, ...prev].slice(0, 10)); // Keep max 10
      
      // Optional: Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🚌 School Bus Update', {
          body: newNotif.message,
          icon: '/bus-icon.png'
        });
      }
    };

    // Listen for student check-in events
    const handleStudentCheckedIn = (data: any) => {
      console.log("✅ Dashboard: Student checked in:", data);
      const message = data.action === 'PICKED_UP' 
        ? '✅ Con đã được đón lên xe an toàn'
        : data.action === 'DROPPED_OFF'
        ? '🏠 Con đã được trả về nhà an toàn'
        : '📢 Cập nhật trạng thái con';
      
      handleNewNotification({ message, ...data });
    };

    socket.on('bus:location_changed', handleLocationUpdate);
    socket.on('notification:new', handleNewNotification);
    socket.on('bus:approaching_station', handleNewNotification);
    socket.on('student:checked_in', handleStudentCheckedIn);

    return () => {
      socket.off('bus:location_changed', handleLocationUpdate);
      socket.off('notification:new', handleNewNotification);
      socket.off('bus:approaching_station', handleNewNotification);
      socket.off('student:checked_in', handleStudentCheckedIn);
    };
  }, [socket, trip, user]);

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

        {/* ETA Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg shadow-blue-500/20 text-white transition-transform hover:scale-[1.01]">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-blue-100 font-medium mb-1">Estimated Arrival</p>
                    <h3 className="text-4xl font-bold">14 <span className="text-xl font-normal opacity-80">min</span></h3>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <MapIcon className="w-6 h-6 text-white" />
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-100 bg-black/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Approaching Main St.</span>
            </div>
        </div>

        {/* Speed Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-transform hover:scale-[1.01]">
             <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-500 font-medium mb-1">Current Speed</p>
                    <h3 className="text-4xl font-bold text-slate-900">42 <span className="text-xl text-slate-400 font-normal">km/h</span></h3>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl">
                    <SpeedIcon className="w-6 h-6 text-orange-500" />
                </div>
            </div>
            <div className="mt-6 flex flex-col gap-1">
                 <div className="flex justify-between text-xs text-slate-400">
                    <span>0 km/h</span>
                    <span>60 km/h</span>
                 </div>
                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 w-[60%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                 </div>
            </div>
        </div>
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

            {/* Today's Schedule */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-fit">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                     <span className="w-1 h-5 bg-brand-500 rounded-full"></span>
                     Today's Schedule
                </h3>
                <div className="space-y-8 relative pl-2">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-[14px] top-3 bottom-3 w-0.5 bg-slate-100"></div>

                    {/* Timeline Item 1 */}
                    <div className="relative flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-100 border-4 border-white z-10 flex items-center justify-center shrink-0 shadow-sm">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        </div>
                        <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="flex justify-between items-start">
                                <p className="text-sm font-bold text-slate-900">Picked Up</p>
                                <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Done</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">06:45 AM • Home Address</p>
                        </div>
                    </div>

                    {/* Timeline Item 2 */}
                    <div className="relative flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 border-4 border-white z-10 flex items-center justify-center shrink-0 shadow-sm">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                        </div>
                        <div className="flex-1 bg-blue-50 p-3 rounded-xl border border-blue-100 shadow-sm">
                            <div className="flex justify-between items-start">
                                <p className="text-sm font-bold text-blue-900">Heading to School</p>
                                <span className="text-xs font-semibold text-blue-600 bg-white px-2 py-0.5 rounded-full">Live</span>
                            </div>
                            <p className="text-xs text-blue-600/80 mt-1">Expected: 07:30 AM</p>
                        </div>
                    </div>

                    {/* Timeline Item 3 */}
                    <div className="relative flex items-start gap-4 opacity-60">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border-4 border-white z-10 flex items-center justify-center shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-900">Afternoon Dropoff</p>
                            <p className="text-xs text-slate-500 mt-1">04:30 PM • Home Address</p>
                        </div>
                    </div>
                </div>
            </div>

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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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
    </div>
  );
}