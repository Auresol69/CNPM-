// // src/context/RouteTrackingContext.jsx
// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useRef,
//   useCallback,
//   useMemo,
// } from 'react';
// import {
//   getMySchedule,
//   getTrip,
//   getTripStudents,
//   checkIn,
//   markAsAbsent,
// } from '../services/tripService';
// import {
//   connectSocket,
//   disconnectSocket,
//   joinTripRoom,
//   leaveTripRoom,
//   startPollingTrip,
//   getSocket,
// } from '../services/socketService';
// import { getCurrentUser } from '../services/authService';

// const RouteTrackingContext = createContext();

// export const useRouteTracking = () => {
//   const context = useContext(RouteTrackingContext);
//   if (!context) throw new Error('useRouteTracking must be used within RouteTrackingProvider');
//   return context;
// };

// // -------------------- Mock data (giữ nguyên như cũ) --------------------
// const STUDENTS_DATABASE = {
//   hs1: { id: 'hs1', name: 'Nguyễn Văn An', class: '6A1', stop: 'st1', parentName: 'Cô Lan', parentPhone: '0901234567', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=An' },
//   hs2: { id: 'hs2', name: 'Trần Thị Bé', class: '6A2', stop: 'st1', parentName: 'Anh Hùng', parentPhone: '0902345678', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Be' },
//   hs3: { id: 'hs3', name: 'Lê Minh Cường', class: '7A1', stop: 'st1', parentName: 'Cô Mai', parentPhone: '0903456789', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cuong' },
//   hs4: { id: 'hs4', name: 'Phạm Ngọc Dũng', class: '8A3', stop: 'st1', parentName: 'Chú Tuấn', parentPhone: '0904567890', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dung' },
//   hs5: { id: 'hs5', name: 'Hoàng Thị Em', class: '9A1', stop: 'st2', parentName: 'Chị Hoa', parentPhone: '0905678901', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Em' },
//   hs6: { id: 'hs6', name: 'Vũ Văn Bình', class: '7A2', stop: 'st2', parentName: 'Anh Nam', parentPhone: '0906789012', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Binh' },
//   hs7: { id: 'hs7', name: 'Đỗ Thị Hương', class: '8A1', stop: 'st2', parentName: 'Cô Ngọc', parentPhone: '0907890123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Huong' },
//   hs8: { id: 'hs8', name: 'Ngô Minh Khang', class: '9A2', stop: 'st3', parentName: 'Chú Long', parentPhone: '0908901234', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khang' },
//   hs9: { id: 'hs9', name: 'Bùi Thị Lan', class: '6A3', stop: 'st3', parentName: 'Cô Thảo', parentPhone: '0909012345', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lan' },
// };

// const ROUTES_BASE_STATIONS = [
//   { id: 'st1', name: 'Trạm A - Nguyễn Trãi', position: [10.7628, 106.6602], time: '06:35' },
//   { id: 'st2', name: 'Trạm B - Lê Văn Sỹ', position: [10.7640, 106.6670], time: '06:42' },
//   { id: 'st3', name: 'Trạm C - CMT8', position: [10.7715, 106.6780], time: '06:50' },
//   { id: 'st4', name: 'THPT Lê Quý Đôn', position: [10.7800, 106.6950], time: '07:05' },
// ];

// const createStudentsByRoute = () => {
//   const studentsByStation = {};
//   ROUTES_BASE_STATIONS.forEach(station => { studentsByStation[station.id] = []; });

//   const route1Students = Object.values(STUDENTS_DATABASE);
//   studentsByStation['st1'] = route1Students.slice(0, 4);
//   studentsByStation['st2'] = route1Students.slice(4, 7);
//   studentsByStation['st3'] = route1Students.slice(7, 9);
//   studentsByStation['st4'] = [];

//   return studentsByStation;
// };
// const STUDENTS_BY_STATION = createStudentsByRoute();

// // -------------------- Weekly & daily routes (giữ nguyên) --------------------
// function addMinutesToTimeStr(timeStr, minutesToAdd) {
//   try {
//     const [hh, mm] = timeStr.split(':').map(Number);
//     const d = new Date();
//     d.setHours(hh, mm, 0, 0);
//     d.setMinutes(d.getMinutes() + minutesToAdd);
//     return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
//   } catch {
//     return timeStr;
//   }
// }

// const createDailyRoutes = (dayLabel = 'Hôm nay') => [
//   {
//     id: `${dayLabel}-morning`,
//     name: 'Tuyến - Sáng',
//     time: '06:30 - 07:30',
//     totalStudents: 28,
//     stations: ROUTES_BASE_STATIONS,
//   },
//   {
//     id: `${dayLabel}-noon`,
//     name: 'Tuyến - Trưa',
//     time: '11:30 - 12:30',
//     totalStudents: 22,
//     stations: ROUTES_BASE_STATIONS.map(s => ({ ...s, time: addMinutesToTimeStr(s.time, 60) })),
//   },
//   {
//     id: `${dayLabel}-afternoon`,
//     name: 'Tuyến - Chiều',
//     time: '16:00 - 17:00',
//     totalStudents: 25,
//     stations: ROUTES_BASE_STATIONS.map(s => ({ ...s, time: addMinutesToTimeStr(s.time, 600) })),
//   },
// ];

// const WEEK_DAYS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
// const ROUTES_WEEK = WEEK_DAYS.reduce((acc, day) => { acc[day] = createDailyRoutes(day); return acc; }, {});

// // -------------------- Constants --------------------
// const PRE_ARRIVAL_DELAY_MS = 3000;
// const CHECKIN_SECONDS = 60;
// const AFTER_ALL_CHECKED_DELAY_MS = 3000;
// const MIN_TRAVEL_MS = 3000;
// const MAX_TRAVEL_MS = 45000;
// const MS_PER_KM = 8000;

// function haversineKm(a = [0,0], b = [0,0]) {
//   try {
//     const toRad = (v) => (v * Math.PI) / 180;
//     const R = 6371;
//     const dLat = toRad(b[0] - a[0]);
//     const dLon = toRad(b[1] - a[1]);
//     const lat1 = toRad(a[0]);
//     const lat2 = toRad(b[0]);
//     const sinDLat = Math.sin(dLat/2) * Math.sin(dLat/2);
//     const sinDLon = Math.sin(dLon/2) * Math.sin(dLon/2);
//     const z = Math.sqrt(sinDLat + Math.cos(lat1)*Math.cos(lat2)*sinDLon);
//     const c = 2 * Math.asin(Math.min(1, z));
//     return R * c;
//   } catch { return 0; }
// }

// // -------------------- Provider --------------------
// export const RouteTrackingProvider = ({ children }) => {
//   const user = getCurrentUser();

//   // === State chính ===
//   const [isTracking, setIsTracking] = useState(false);
//   const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
//   const [currentStationIndex, setCurrentStationIndex] = useState(-1);
//   const [studentCheckIns, setStudentCheckIns] = useState({});
//   const [stationTimer, setStationTimer] = useState(0);
//   const [isStationActive, setIsStationActive] = useState(false);
//   const [lastStoppedState, setLastStoppedState] = useState(() => {
//     try {
//       const s = localStorage.getItem('lastStoppedBusState');
//       return s ? JSON.parse(s) : null;
//     } catch { return null; }
//   });

//   const [inTransit, setInTransit] = useState(false);
//   const [transitTargetIndex, setTransitTargetIndex] = useState(null);
//   const [currentTripId, setCurrentTripId] = useState(null); // ← Mới: ID chuyến thực tế từ backend

//   // === Refs ===
//   const timerRef = useRef(null);
//   const delayRef = useRef(null);
//   const transitTimeoutRef = useRef(null);
//   const departingRef = useRef(false);
//   const studentCheckInsRef = useRef(studentCheckIns);
//   const pollCleanupRef = useRef(() => {});

//   useEffect(() => { studentCheckInsRef.current = studentCheckIns; }, [studentCheckIns]);

//   // === Tải lịch trình thực tế + fallback mock ===
//   const todayLabel = useMemo(() => {
//     const idx = new Date().getDay();
//     return idx === 0 ? 'Chủ Nhật' : WEEK_DAYS[idx - 1];
//   }, []);

//   const routesToday = useMemo(() => ROUTES_WEEK[todayLabel] || createDailyRoutes(todayLabel), [todayLabel]);

//   const currentRoute = routesToday[currentRouteIndex] || null;
//   const stations = currentRoute?.stations || [];
//   const currentStation = currentStationIndex >= 0 && currentStationIndex < stations.length ? stations[currentStationIndex] : null;
//   const currentStudents = useMemo(() => currentStation ? (STUDENTS_BY_STATION[currentStation.id] || []) : [], [currentStation]);
//   const allStudentsForContact = useMemo(() => Object.values(STUDENTS_DATABASE), []);

//   const isCheckingIn = stationTimer > 0;
//   const isMoving = useMemo(() => isTracking && !isStationActive && !isCheckingIn && inTransit, [isTracking, isStationActive, isCheckingIn, inTransit]);

//   // === Socket.IO + Fallback Poll ===
//   useEffect(() => {
//     if (!user || !currentTripId) return;

//     const socket = connectSocket();
//     if (socket) {
//       joinTripRoom(currentTripId);

//       const handleLocationUpdate = (data) => {
//         // Cập nhật vị trí xe trên map (nếu bạn có state location)
//         console.log('Vị trí xe cập nhật:', data);
//       };

//       const handleStudentCheckIn = (data) => {
//         setStudentCheckIns(prev => ({ ...prev, [data.studentId]: 'present' }));
//       };

//       const handleAbsentMarked = (data) => {
//         setStudentCheckIns(prev => {
//           const copy = { ...prev };
//           data.studentIds.forEach(id => { copy[id] = 'absent'; });
//           return copy;
//         });
//       };

//       const handleTripCompleted = () => {
//         alert('Chuyến đi đã kết thúc từ server!');
//         setIsTracking(false);
//       };

//       socket.on('trip:location_update', handleLocationUpdate);
//       socket.on('trip:student_checkin', handleStudentCheckIn);
//       socket.on('trip:students_marked_absent', handleAbsentMarked);
//       socket.on('trip:completed', handleTripCompleted);

//       // Fallback poll nếu mất kết nối
//       const cleanupPoll = startPollingTrip(currentTripId, (tripData) => {
//         // Cập nhật toàn bộ trạng thái từ backend
//         if (tripData.studentStops) {
//           const checkIns = {};
//           tripData.studentStops.forEach(s => {
//             if (s.action === 'PRESENT') checkIns[s.studentId] = 'present';
//             if (s.action === 'ABSENT') checkIns[s.studentId] = 'absent';
//           });
//           setStudentCheckIns(checkIns);
//         }
//       }, 30000);

//       pollCleanupRef.current = cleanupPoll;

//       return () => {
//         socket.off('trip:location_update', handleLocationUpdate);
//         socket.off('trip:student_checkin', handleStudentCheckIn);
//         socket.off('trip:students_marked_absent', handleAbsentMarked);
//         socket.off('trip:completed', handleTripCompleted);
//         leaveTripRoom(currentTripId);
//         cleanupPoll();
//       };
//     }
//   }, [user, currentTripId]);

//   // === Actions ===
//   const checkInStudent = useCallback(async (studentId) => {
//     setStudentCheckIns(prev => ({ ...prev, [studentId]: 'present' }));

//     if (currentTripId) {
//       try {
//         await checkIn(currentTripId, {
//           studentId,
//           stationId: currentStation?.id,
//           timestamp: new Date().toISOString(),
//         });
//       } catch (err) {
//         console.error('Check-in thất bại (fallback vẫn hoạt động):', err);
//       }
//     }
//   }, [currentTripId, currentStation]);

//   const forceDepart = useCallback(async () => {
//     if (!currentStation) return;

//     const students = STUDENTS_BY_STATION[currentStation.id] || [];
//     const absentIds = students.filter(s => !studentCheckInsRef.current[s.id]).map(s => s.id);

//     setStudentCheckIns(prev => {
//       const copy = { ...prev };
//       absentIds.forEach(id => { copy[id] = 'absent'; });
//       return copy;
//     });

//     if (currentTripId && absentIds.length > 0) {
//       try {
//         await markAsAbsent(currentTripId, absentIds[0]); // backend chỉ nhận 1, hoặc loop
//       } catch (err) {
//         console.error('Mark absent fail:', err);
//       }
//     }

//     departToNextStation();
//   }, [currentStation, currentTripId]);

//   const departToNextStation = useCallback(() => {
//     if (departingRef.current) return;
//     departingRef.current = true;

//     if (timerRef.current) clearInterval(timerRef.current);
//     if (delayRef.current) clearTimeout(delayRef.current);

//     setIsStationActive(false);
//     setStationTimer(0);

//     const nextIndex = currentStationIndex + 1;
//     if (nextIndex >= stations.length) {
//       setTimeout(() => {
//         setCurrentStationIndex(nextIndex);
//         departingRef.current = false;
//       }, MIN_TRAVEL_MS);
//       return;
//     }

//     const fromPos = stations[currentStationIndex]?.position || [0,0];
//     const toPos = stations[nextIndex]?.position || fromPos;
//     const distKm = haversineKm(fromPos, toPos);
//     let travelMs = Math.round(distKm * MS_PER_KM);
//     travelMs = Math.max(MIN_TRAVEL_MS, Math.min(travelMs, MAX_TRAVEL_MS));

//     setInTransit(true);
//     setTransitTargetIndex(nextIndex);

//     transitTimeoutRef.current = setTimeout(() => {
//       setInTransit(false);
//       setTransitTargetIndex(null);
//       setCurrentStationIndex(nextIndex);
//       departingRef.current = false;
//     }, travelMs);
//   }, [currentStationIndex, stations]);

//   const startTracking = useCallback(async () => {
//     // Tải lịch trình thực tế
//     try {
//       const schedule = await getMySchedule();
//       const activeTrip = schedule.find(t => t.status === 'IN_PROGRESS') || schedule[0];
//       if (activeTrip?._id) {
//         setCurrentTripId(activeTrip._id);
//       }
//     } catch (err) {
//       console.warn('Dùng mock vì không tải được lịch trình');
//     }

//     // Reset mock state
//     setIsTracking(true);
//     setCurrentRouteIndex(0);
//     setCurrentStationIndex(0);
//     setStudentCheckIns({});
//     setStationTimer(0);
//     setIsStationActive(false);
//     setLastStoppedState(null);
//     setInTransit(false);
//   }, []);

//   const stopTracking = useCallback(() => {
//     // Cleanup
//     if (timerRef.current) clearInterval(timerRef.current);
//     if (delayRef.current) clearTimeout(delayRef.current);
//     if (transitTimeoutRef.current) clearTimeout(transitTimeoutRef.current);
//     pollCleanupRef.current();

//     const now = new Date().toLocaleString('vi-VN');
//     const pickedUp = Object.values(studentCheckIns).filter(v => v === 'present').length;

//     const stoppedData = {
//       routeIndex: currentRouteIndex,
//       routeName: currentRoute?.name || 'Chưa xuất phát',
//       stationIndex: currentStationIndex,
//       stationName: currentStation?.name || 'Chưa xuất phát',
//       position: currentStation?.position || null,
//       time: now,
//       pickedUpStudents: pickedUp,
//       checkInData: studentCheckIns,
//       dayLabel: todayLabel,
//     };

//     setLastStoppedState(stoppedData);
//     try { localStorage.setItem('lastStoppedBusState', JSON.stringify(stoppedData)); } catch (e) { console.error(e); }

//     setIsTracking(false);
//     setCurrentRouteIndex(0);
//     setCurrentStationIndex(-1);
//     setStudentCheckIns({});
//     setIsStationActive(false);
//     setInTransit(false);
//     setCurrentTripId(null);
//   }, [currentRouteIndex, currentRoute, currentStationIndex, currentStation, studentCheckIns, todayLabel]);

//   // === Auto logic (giữ nguyên như cũ) ===
//   useEffect(() => {
//     if (!isTracking || inTransit) {
//       setIsStationActive(false);
//       setStationTimer(0);
//       return;
//     }

//     if (currentStationIndex >= stations.length) {
//       // Chuyển tuyến
//       if (currentRouteIndex < routesToday.length - 1) {
//         setCurrentRouteIndex(i => i + 1);
//         setCurrentStationIndex(0);
//         setStudentCheckIns({});
//       } else {
//         alert('HOÀN THÀNH TẤT CẢ CÁC TUYẾN!');
//         stopTracking();
//       }
//       return;
//     }

//     setIsStationActive(true);
//     setStationTimer(0);

//     if (currentStationIndex === stations.length - 1) {
//       delayRef.current = setTimeout(departToNextStation, 2000);
//       return;
//     }

//     delayRef.current = setTimeout(() => {
//       setStationTimer(CHECKIN_SECONDS);
//       timerRef.current = setInterval(() => {
//         setStationTimer(prev => {
//           if (prev <= 1) {
//             forceDepart();
//             return 0;
//           }
//           const students = STUDENTS_BY_STATION[currentStation?.id] || [];
//           const present = students.filter(s => studentCheckInsRef.current[s.id] === 'present').length;
//           if (students.length > 0 && present === students.length) {
//             clearInterval(timerRef.current);
//             setTimeout(departToNextStation, AFTER_ALL_CHECKED_DELAY_MS);
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//     }, PRE_ARRIVAL_DELAY_MS);

//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current);
//       if (delayRef.current) clearTimeout(delayRef.current);
//     };
//   }, [currentStationIndex, isTracking, currentRoute, inTransit, forceDepart, departToNextStation]);

//   // === Cleanup on unmount ===
//   useEffect(() => {
//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current);
//       if (delayRef.current) clearTimeout(delayRef.current);
//       if (transitTimeoutRef.current) clearTimeout(transitTimeoutRef.current);
//       pollCleanupRef.current();
//     };
//   }, []);

//   return (
//     <RouteTrackingContext.Provider
//       value={{
//         // State
//         isTracking,
//         isCheckingIn,
//         isMoving,
//         inTransit,
//         transitTargetIndex,
//         currentRouteIndex,
//         currentRoute,
//         routesToday,
//         currentStationIndex,
//         currentStation,
//         stations,
//         currentStudents,
//         studentCheckIns,
//         stationTimer,
//         isStationActive,
//         lastStoppedState,
//         allStudentsForContact,
//         todayLabel,
//         currentTripId,

//         // Actions
//         startTracking,
//         stopTracking,
//         checkInStudent,
//         forceDepart,
//       }}
//     >
//       {children}
//     </RouteTrackingContext.Provider>
//   );
// };

// export default RouteTrackingContext;
// src/context/RouteTrackingContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  getMySchedule,
  getTrip,
  getTripStudents,
  checkIn,
  markAsAbsent,
} from '../services/tripService';
import {
  connectSocket,
  disconnectSocket,
  joinTripRoom,
  leaveTripRoom,
  startPollingTrip,
  getSocket,
} from '../services/socketService';
import { getCurrentUser } from '../services/authService';
import {
  getMyNotifications,
  deleteNotification,
  markAsRead,
} from '../services/notificationService';
import {
  getMyMessages,
} from '../services/messageService';
import {
  getMyStudents,
} from '../services/studentService';
import {
  getAllStations,
} from '../services/stationService';
import {
  getAllRoutes,
} from '../services/routeService';
import {
  getScheduleRoute,
} from '../services/scheduleService';

const RouteTrackingContext = createContext();

export const useRouteTracking = () => {
  const context = useContext(RouteTrackingContext);
  if (!context) throw new Error('useRouteTracking must be used within RouteTrackingProvider');
  return context;
};

// -------------------- Mock data (giữ nguyên như cũ) --------------------
const STUDENTS_DATABASE = {
  hs1: { id: 'hs1', name: 'Nguyễn Văn An', class: '6A1', stop: 'st1', parentName: 'Cô Lan', parentPhone: '0901234567', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=An' },
  hs2: { id: 'hs2', name: 'Trần Thị Bé', class: '6A2', stop: 'st1', parentName: 'Anh Hùng', parentPhone: '0902345678', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Be' },
  hs3: { id: 'hs3', name: 'Lê Minh Cường', class: '7A1', stop: 'st1', parentName: 'Cô Mai', parentPhone: '0903456789', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cuong' },
  hs4: { id: 'hs4', name: 'Phạm Ngọc Dũng', class: '8A3', stop: 'st1', parentName: 'Chú Tuấn', parentPhone: '0904567890', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dung' },
  hs5: { id: 'hs5', name: 'Hoàng Thị Em', class: '9A1', stop: 'st2', parentName: 'Chị Hoa', parentPhone: '0905678901', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Em' },
  hs6: { id: 'hs6', name: 'Vũ Văn Bình', class: '7A2', stop: 'st2', parentName: 'Anh Nam', parentPhone: '0906789012', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Binh' },
  hs7: { id: 'hs7', name: 'Đỗ Thị Hương', class: '8A1', stop: 'st2', parentName: 'Cô Ngọc', parentPhone: '0907890123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Huong' },
  hs8: { id: 'hs8', name: 'Ngô Minh Khang', class: '9A2', stop: 'st3', parentName: 'Chú Long', parentPhone: '0908901234', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khang' },
  hs9: { id: 'hs9', name: 'Bùi Thị Lan', class: '6A3', stop: 'st3', parentName: 'Cô Thảo', parentPhone: '0909012345', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lan' },
};

const ROUTES_BASE_STATIONS = [
  { id: 'st1', name: 'Trạm A - Nguyễn Trãi', position: [10.7628, 106.6602], time: '06:35' },
  { id: 'st2', name: 'Trạm B - Lê Văn Sỹ', position: [10.7640, 106.6670], time: '06:42' },
  { id: 'st3', name: 'Trạm C - CMT8', position: [10.7715, 106.6780], time: '06:50' },
  { id: 'st4', name: 'THPT Lê Quý Đôn', position: [10.7800, 106.6950], time: '07:05' },
];

const createStudentsByRoute = () => {
  const studentsByStation = {};
  ROUTES_BASE_STATIONS.forEach(station => { studentsByStation[station.id] = []; });

  const route1Students = Object.values(STUDENTS_DATABASE);
  studentsByStation['st1'] = route1Students.slice(0, 4);
  studentsByStation['st2'] = route1Students.slice(4, 7);
  studentsByStation['st3'] = route1Students.slice(7, 9);
  studentsByStation['st4'] = [];

  return studentsByStation;
};
const STUDENTS_BY_STATION = createStudentsByRoute();

// -------------------- Weekly & daily routes (giữ nguyên) --------------------
function addMinutesToTimeStr(timeStr, minutesToAdd) {
  try {
    const [hh, mm] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(hh, mm, 0, 0);
    d.setMinutes(d.getMinutes() + minutesToAdd);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return timeStr;
  }
}

const createDailyRoutes = (dayLabel = 'Hôm nay') => [
  {
    id: `${dayLabel}-morning`,
    name: 'Tuyến - Sáng',
    time: '06:30 - 07:30',
    totalStudents: 28,
    stations: ROUTES_BASE_STATIONS,
  },
  {
    id: `${dayLabel}-noon`,
    name: 'Tuyến - Trưa',
    time: '11:30 - 12:30',
    totalStudents: 22,
    stations: ROUTES_BASE_STATIONS.map(s => ({ ...s, time: addMinutesToTimeStr(s.time, 60) })),
  },
  {
    id: `${dayLabel}-afternoon`,
    name: 'Tuyến - Chiều',
    time: '16:00 - 17:00',
    totalStudents: 25,
    stations: ROUTES_BASE_STATIONS.map(s => ({ ...s, time: addMinutesToTimeStr(s.time, 600) })),
  },
];

const WEEK_DAYS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
const ROUTES_WEEK = WEEK_DAYS.reduce((acc, day) => { acc[day] = createDailyRoutes(day); return acc; }, {});

// -------------------- Constants --------------------
const PRE_ARRIVAL_DELAY_MS = 3000;
const CHECKIN_SECONDS = 60;
const AFTER_ALL_CHECKED_DELAY_MS = 3000;
const MIN_TRAVEL_MS = 3000;
const MAX_TRAVEL_MS = 45000;
const MS_PER_KM = 8000;

function haversineKm(a = [0, 0], b = [0, 0]) {
  try {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b[0] - a[0]);
    const dLon = toRad(b[1] - a[1]);
    const lat1 = toRad(a[0]);
    const lat2 = toRad(b[0]);
    const sinDLat = Math.sin(dLat / 2) * Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const z = Math.sqrt(sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon);
    const c = 2 * Math.asin(Math.min(1, z));
    return R * c;
  } catch {
    return 0;
  }
}

// -------------------- Provider --------------------
export const RouteTrackingProvider = ({ children }) => {
  const user = getCurrentUser();

  // === State chính ===
  const [isTracking, setIsTracking] = useState(false);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
  const [currentStationIndex, setCurrentStationIndex] = useState(-1);
  const [studentCheckIns, setStudentCheckIns] = useState({});
  const [stationTimer, setStationTimer] = useState(0);
  const [isStationActive, setIsStationActive] = useState(false);
  const [lastStoppedState, setLastStoppedState] = useState(() => {
    try {
      const s = localStorage.getItem('lastStoppedBusState');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [inTransit, setInTransit] = useState(false);
  const [transitTargetIndex, setTransitTargetIndex] = useState(null);
  const [currentTripId, setCurrentTripId] = useState(null); // ID chuyến từ backend
  const [notifications, setNotifications] = useState([]); // Thêm state cho thông báo
  const [messages, setMessages] = useState([]); // Thêm state cho tin nhắn
  const [students, setStudents] = useState([]); // Thêm state cho học sinh
  const [stations, setStations] = useState(ROUTES_BASE_STATIONS); // Thêm state cho trạm
  const [routes, setRoutes] = useState([]); // Thêm state cho tuyến đường
  const [scheduleRoute, setScheduleRoute] = useState(null); // Thêm state cho tuyến lịch trình

  // === Refs ===
  const timerRef = useRef(null);
  const delayRef = useRef(null);
  const transitTimeoutRef = useRef(null);
  const departingRef = useRef(false);
  const studentCheckInsRef = useRef(studentCheckIns);
  const pollCleanupRef = useRef(() => { });

  useEffect(() => { studentCheckInsRef.current = studentCheckIns; }, [studentCheckIns]);

  // === Tải dữ liệu thực tế + fallback mock ===
  const todayLabel = useMemo(() => {
    const idx = new Date().getDay();
    return idx === 0 ? 'Chủ Nhật' : WEEK_DAYS[idx - 1];
  }, []);

  const routesToday = useMemo(() => ROUTES_WEEK[todayLabel] || createDailyRoutes(todayLabel), [todayLabel]);

  const currentRoute = routesToday[currentRouteIndex] || null;
  const currentStation = currentStationIndex >= 0 && currentStationIndex < stations.length ? stations[currentStationIndex] : null;
  const currentStudentsMemo = useMemo(() => currentStation ? STUDENTS_BY_STATION[currentStation.id] || [] : [], [currentStation]);
  const allStudentsForContact = useMemo(() => Object.values(STUDENTS_DATABASE), []);

  const isCheckingIn = stationTimer > 0;
  const isMoving = useMemo(() => isTracking && !isStationActive && !isCheckingIn && inTransit, [isTracking, isStationActive, isCheckingIn, inTransit]);

  // === Sync dữ liệu từ backend ===
  const syncDataFromBackend = useCallback(async () => {
    if (user && currentTripId) {
      try {
        // Tải thông báo
        const notifs = await getMyNotifications();
        setNotifications(notifs);

        // Tải tin nhắn
        const msgs = await getMyMessages();
        setMessages(msgs);

        // Tải học sinh
        const studentData = await getMyStudents();
        setStudents(studentData);

        // Tải trạm
        const stationData = await getAllStations();
        setStations(stationData.data?.stations || ROUTES_BASE_STATIONS);

        // Tải tuyến đường
        const routeData = await getAllRoutes();
        setRoutes(routeData.data?.routes || []);

        // Tải tuyến lịch trình
        if (currentTripId) {
          const scheduleRouteData = await getScheduleRoute(currentTripId);
          setScheduleRoute(scheduleRouteData.data);
        }
      } catch (error) {
        console.warn('Sync dữ liệu từ backend thất bại → dùng mock', error);
        // Fallback không cần thiết vì state đã có mock ban đầu
      }
    }
  }, [user, currentTripId]);

  // === Socket.IO + Fallback Poll ===
  useEffect(() => {
    if (!user || !currentTripId) return;

    const socket = connectSocket();
    if (!socket) return;

    joinTripRoom(currentTripId);

    const handleLocationUpdate = (data) => {
      console.log('Vị trí xe cập nhật:', data);
      // Cập nhật vị trí nếu có state map
    };

    const handleStudentCheckIn = (data) => {
      setStudentCheckIns(prev => ({ ...prev, [data.studentId]: 'present' }));
    };

    const handleAbsentMarked = (data) => {
      setStudentCheckIns(prev => {
        const copy = { ...prev };
        (data.studentIds || []).forEach(id => { copy[id] = 'absent'; });
        return copy;
      });
    };

    const handleTripCompleted = () => {
      alert('Chuyến đi đã kết thúc từ server!');
      setIsTracking(false);
    };

    const handleNewNotification = (data) => {
      setNotifications(prev => [data, ...prev].slice(0, 10)); // Giới hạn 10 thông báo
    };

    socket.on('trip:location_update', handleLocationUpdate);
    socket.on('trip:student_checkin', handleStudentCheckIn);
    socket.on('trip:students_marked_absent', handleAbsentMarked);
    socket.on('trip:completed', handleTripCompleted);
    socket.on('trip:notification', handleNewNotification);

    const cleanupPoll = startPollingTrip(currentTripId, (tripData) => {
      if (tripData?.studentStops) {
        const checkIns = {};
        tripData.studentStops.forEach(s => {
          if (s.action === 'PRESENT') checkIns[s.studentId] = 'present';
          if (s.action === 'ABSENT') checkIns[s.studentId] = 'absent';
        });
        setStudentCheckIns(checkIns);
      }
    }, 30000);

    pollCleanupRef.current = cleanupPoll;

    // Sync dữ liệu ban đầu
    syncDataFromBackend();

    return () => {
      socket.off('trip:location_update', handleLocationUpdate);
      socket.off('trip:student_checkin', handleStudentCheckIn);
      socket.off('trip:students_marked_absent', handleAbsentMarked);
      socket.off('trip:completed', handleTripCompleted);
      socket.off('trip:notification', handleNewNotification);
      leaveTripRoom(currentTripId);
      cleanupPoll();
    };
  }, [user, currentTripId, syncDataFromBackend]);

  // === Actions ===
  const checkInStudent = useCallback(async (studentId) => {
    setStudentCheckIns(prev => ({ ...prev, [studentId]: 'present' }));

    if (currentTripId) {
      try {
        await checkIn(currentTripId, {
          studentId,
          stationId: currentStation?.id,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Check-in thất bại (fallback vẫn hoạt động):', err);
      }
    }
  }, [currentTripId, currentStation]);

  const forceDepart = useCallback(async () => {
    if (!currentStation) return;

    const students = STUDENTS_BY_STATION[currentStation.id] || [];
    const absentIds = students.filter(s => !studentCheckInsRef.current[s.id]).map(s => s.id);

    setStudentCheckIns(prev => {
      const copy = { ...prev };
      absentIds.forEach(id => { copy[id] = 'absent'; });
      return copy;
    });

    if (currentTripId && absentIds.length > 0) {
      try {
        for (const id of absentIds) {
          await markAsAbsent(currentTripId, id);
        }
      } catch (err) {
        console.error('Mark absent fail:', err);
      }
    }

    departToNextStation();
  }, [currentStation, currentTripId]);

  const departToNextStation = useCallback(() => {
    if (departingRef.current) return;
    departingRef.current = true;

    if (timerRef.current) clearInterval(timerRef.current);
    if (delayRef.current) clearTimeout(delayRef.current);

    setIsStationActive(false);
    setStationTimer(0);

    const nextIndex = currentStationIndex + 1;
    if (nextIndex >= stations.length) {
      setTimeout(() => {
        setCurrentStationIndex(nextIndex);
        departingRef.current = false;
      }, MIN_TRAVEL_MS);
      return;
    }

    const fromPos = stations[currentStationIndex]?.position || [0, 0];
    const toPos = stations[nextIndex]?.position || fromPos;
    const distKm = haversineKm(fromPos, toPos);
    let travelMs = Math.round(distKm * MS_PER_KM);
    travelMs = Math.max(MIN_TRAVEL_MS, Math.min(travelMs, MAX_TRAVEL_MS));

    setInTransit(true);
    setTransitTargetIndex(nextIndex);

    transitTimeoutRef.current = setTimeout(() => {
      setInTransit(false);
      setTransitTargetIndex(null);
      setCurrentStationIndex(nextIndex);
      departingRef.current = false;
    }, travelMs);
  }, [currentStationIndex, stations]);

  const startTracking = useCallback(async () => {
    try {
      const schedule = await getMySchedule();
      const activeTrip = schedule.find(t => t.status === 'IN_PROGRESS') || schedule[0];
      if (activeTrip?._id) {
        setCurrentTripId(activeTrip._id);
      }
    } catch (err) {
      console.warn('Dùng mock vì không tải được lịch trình:', err);
    }

    setIsTracking(true);
    setCurrentRouteIndex(0);
    setCurrentStationIndex(0);
    setStudentCheckIns({});
    setStationTimer(0);
    setIsStationActive(false);
    setLastStoppedState(null);
    setInTransit(false);
    await syncDataFromBackend(); // Sync data khi bắt đầu
  }, [syncDataFromBackend]);

  const stopTracking = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (delayRef.current) clearTimeout(delayRef.current);
    if (transitTimeoutRef.current) clearTimeout(transitTimeoutRef.current);
    pollCleanupRef.current();

    const now = new Date().toLocaleString('vi-VN');
    const pickedUp = Object.values(studentCheckIns).filter(v => v === 'present').length;

    const stoppedData = {
      routeIndex: currentRouteIndex,
      routeName: currentRoute?.name || 'Chưa xuất phát',
      stationIndex: currentStationIndex,
      stationName: currentStation?.name || 'Chưa xuất phát',
      position: currentStation?.position || null,
      time: now,
      pickedUpStudents: pickedUp,
      checkInData: studentCheckIns,
      dayLabel: todayLabel,
    };

    setLastStoppedState(stoppedData);
    try { localStorage.setItem('lastStoppedBusState', JSON.stringify(stoppedData)); } catch (e) { console.error(e); }

    setIsTracking(false);
    setCurrentRouteIndex(0);
    setCurrentStationIndex(-1);
    setStudentCheckIns({});
    setIsStationActive(false);
    setInTransit(false);
    setCurrentTripId(null);
  }, [currentRouteIndex, currentRoute, currentStationIndex, currentStation, studentCheckIns, todayLabel]);

  // === Auto logic (giữ nguyên như cũ) ===
  useEffect(() => {
    if (!isTracking || inTransit) {
      setIsStationActive(false);
      setStationTimer(0);
      return;
    }

    if (currentStationIndex >= stations.length) {
      if (currentRouteIndex < routesToday.length - 1) {
        setCurrentRouteIndex(i => i + 1);
        setCurrentStationIndex(0);
        setStudentCheckIns({});
      } else {
        alert('HOÀN THÀNH TẤT CẢ CÁC TUYẾN!');
        stopTracking();
      }
      return;
    }

    setIsStationActive(true);
    setStationTimer(0);

    if (currentStationIndex === stations.length - 1) {
      delayRef.current = setTimeout(departToNextStation, 2000);
      return;
    }

    delayRef.current = setTimeout(() => {
      setStationTimer(CHECKIN_SECONDS);
      timerRef.current = setInterval(() => {
        setStationTimer(prev => {
          if (prev <= 1) {
            forceDepart();
            return 0;
          }
          const students = STUDENTS_BY_STATION[currentStation?.id] || [];
          const present = students.filter(s => studentCheckInsRef.current[s.id] === 'present').length;
          if (students.length > 0 && present === students.length) {
            clearInterval(timerRef.current);
            setTimeout(departToNextStation, AFTER_ALL_CHECKED_DELAY_MS);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, PRE_ARRIVAL_DELAY_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (delayRef.current) clearTimeout(delayRef.current);
    };
  }, [currentStationIndex, isTracking, currentRoute, inTransit, forceDepart, departToNextStation]);

  // === Cleanup on unmount ===
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (delayRef.current) clearTimeout(delayRef.current);
      if (transitTimeoutRef.current) clearTimeout(transitTimeoutRef.current);
      pollCleanupRef.current();
    };
  }, []);

  return (
    <RouteTrackingContext.Provider
      value={{
        // State
        isTracking,
        isCheckingIn,
        isMoving,
        inTransit,
        transitTargetIndex,
        currentRouteIndex,
        currentRoute,
        routesToday,
        currentStationIndex,
        currentStation,
        stations,
        currentStudents: currentStudentsMemo, // Sử dụng memoized value
        studentCheckIns,
        stationTimer,
        isStationActive,
        lastStoppedState,
        allStudentsForContact,
        todayLabel,
        currentTripId,
        notifications,
        messages,
        students,
        routes,
        scheduleRoute,

        // Actions
        startTracking,
        stopTracking,
        checkInStudent,
        forceDepart,
        syncDataFromBackend, // Thêm hàm sync để component gọi khi cần
      }}
    >
      {children}
    </RouteTrackingContext.Provider>
  );
};

export default RouteTrackingContext;