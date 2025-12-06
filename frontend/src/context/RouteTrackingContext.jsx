// src/context/RouteTrackingContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';

const RouteTrackingContext = createContext();

export const useRouteTracking = () => {
  const context = useContext(RouteTrackingContext);
  if (!context) throw new Error('useRouteTracking must be used within RouteTrackingProvider');
  return context;
};

// -------------------- Mock data --------------------
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

  const route1Students = [
    STUDENTS_DATABASE.hs1, STUDENTS_DATABASE.hs2, STUDENTS_DATABASE.hs3, STUDENTS_DATABASE.hs4,
    STUDENTS_DATABASE.hs5, STUDENTS_DATABASE.hs6, STUDENTS_DATABASE.hs7,
    STUDENTS_DATABASE.hs8, STUDENTS_DATABASE.hs9,
  ];

  studentsByStation['st1'] = route1Students.slice(0, 4);
  studentsByStation['st2'] = route1Students.slice(4, 7);
  studentsByStation['st3'] = route1Students.slice(7, 9);
  studentsByStation['st4'] = [];

  studentsByStation['st5'] = [];
  studentsByStation['st6'] = route1Students.slice(0, 5);
  studentsByStation['st7'] = route1Students.slice(5, 9);

  return studentsByStation;
};
const STUDENTS_BY_STATION = createStudentsByRoute();

// -------------------- Weekly & daily routes --------------------
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

const createDailyRoutes = (dayLabel = 'Hôm nay') => {
  return [
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
};

const WEEK_DAYS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
const ROUTES_WEEK = WEEK_DAYS.reduce((acc, day) => { acc[day] = createDailyRoutes(day); return acc; }, {});

// -------------------- Constants --------------------
const PRE_ARRIVAL_DELAY_MS = 3000;
const CHECKIN_SECONDS = 60;
const AFTER_ALL_CHECKED_DELAY_MS = 3000;

// travel time config (ms)
const MIN_TRAVEL_MS = 3000;
const MAX_TRAVEL_MS = 45000; // 45s cap
const MS_PER_KM = 8000; // heuristic: 8s per 0.001 km => ~8s per km (adjustable)

// simple Haversine to compute km between two [lat,lng]
function haversineKm(a = [0,0], b = [0,0]) {
  try {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(b[0] - a[0]);
    const dLon = toRad(b[1] - a[1]);
    const lat1 = toRad(a[0]);
    const lat2 = toRad(b[0]);
    const sinDLat = Math.sin(dLat/2) * Math.sin(dLat/2);
    const sinDLon = Math.sin(dLon/2) * Math.sin(dLon/2);
    const z = Math.sqrt(sinDLat + Math.cos(lat1)*Math.cos(lat2)*sinDLon);
    const c = 2 * Math.asin(Math.min(1, z));
    return R * c;
  } catch { return 0; }
}

// -------------------- Provider --------------------
export const RouteTrackingProvider = ({ children }) => {
  // trip state
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

  // transit state: when true, vehicle is moving between stops and check-in must not start
  const [inTransit, setInTransit] = useState(false);
  const [transitTargetIndex, setTransitTargetIndex] = useState(null);
  const transitTimeoutRef = useRef(null);

  // refs for timers and stable read
  const timerRef = useRef(null);
  const delayRef = useRef(null);
  const studentCheckInsRef = useRef(studentCheckIns);

  // guard to avoid double-depart calls
  const departingRef = useRef(false);

  useEffect(() => { studentCheckInsRef.current = studentCheckIns; }, [studentCheckIns]);

  // today's label & routes
  const todayLabel = useMemo(() => {
    const idx = new Date().getDay();
    if (idx === 0) return 'Chủ Nhật';
    return WEEK_DAYS[idx - 1];
  }, []);

  const routesToday = useMemo(() => ROUTES_WEEK[todayLabel] || createDailyRoutes(todayLabel), [todayLabel]);

  // derived current route/station
  const currentRoute = routesToday[currentRouteIndex] || null;
  const stations = currentRoute?.stations || [];
  const currentStation = (stations && currentStationIndex >= 0 && currentStationIndex < stations.length)
    ? stations[currentStationIndex]
    : null;
  const currentStudents = useMemo(() => (currentStation ? (STUDENTS_BY_STATION[currentStation.id] || []) : []), [currentStation]);
  const allStudentsForContact = useMemo(() => Object.values(STUDENTS_DATABASE), []);

  // derived flags
  const isCheckingIn = stationTimer > 0;
  const isMoving = useMemo(() => !!isTracking && !isStationActive && !isCheckingIn && inTransit, [isTracking, isStationActive, isCheckingIn, inTransit]);

  // ---------------- Actions ----------------
  const checkInStudent = useCallback((studentId) => {
    setStudentCheckIns(prev => {
      if (prev[studentId] === 'present') return prev;
      return { ...prev, [studentId]: 'present' };
    });
  }, []);

  // centralized depart function to avoid double increments and to simulate travel
  const departToNextStation = useCallback(() => {
    // prevent double depart within the same cycle
    if (departingRef.current) return;
    departingRef.current = true;

    // clear timers
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (delayRef.current) { clearTimeout(delayRef.current); delayRef.current = null; }

    // if we're already at or beyond last station, handle moveToNextRoute
    const nextIndex = currentStationIndex + 1;
    if (!currentRoute || nextIndex > stations.length) {
      // safety fallback
      departingRef.current = false;
      return;
    }

    // mark leaving: stop active check-in
    setIsStationActive(false);
    setStationTimer(0);

    // if nextIndex equals stations.length -> we've finished route; schedule moveToNextRoute after short transit
    if (nextIndex >= stations.length) {
      // small transit to finish route
      setInTransit(true);
      setTransitTargetIndex(nextIndex);

      const travelMs = MIN_TRAVEL_MS;
      transitTimeoutRef.current = setTimeout(() => {
        setInTransit(false);
        setTransitTargetIndex(null);
        setCurrentStationIndex(nextIndex); // this will trigger moveToNextRoute in effect
        departingRef.current = false;
        transitTimeoutRef.current = null;
      }, travelMs);

      return;
    }

    // Normal transit: compute travel duration based on distance between currentStation and nextStation
    const fromPos = stations[currentStationIndex]?.position || stations[0]?.position || [0,0];
    const toPos = stations[nextIndex]?.position || fromPos;
    const distKm = haversineKm(fromPos, toPos);
    let travelMs = Math.round(distKm * MS_PER_KM);
    if (!travelMs || travelMs < MIN_TRAVEL_MS) travelMs = MIN_TRAVEL_MS;
    if (travelMs > MAX_TRAVEL_MS) travelMs = MAX_TRAVEL_MS;

    // set transit state
    setInTransit(true);
    setTransitTargetIndex(nextIndex);

    // allow map animation/display to move bus — after travelMs we actually "arrive" by setting currentStationIndex
    transitTimeoutRef.current = setTimeout(() => {
      setInTransit(false);
      setTransitTargetIndex(null);

      // arrive: update index — this will trigger the arrival/check-in logic in the main effect
      setCurrentStationIndex(nextIndex);

      // allow future departs
      departingRef.current = false;

      transitTimeoutRef.current = null;
    }, travelMs);
  }, [currentStationIndex, currentRoute, stations]);

  const forceDepart = useCallback(() => {
    if (!currentStation) return;
    const students = STUDENTS_BY_STATION[currentStation.id] || [];

    setStudentCheckIns(prev => {
      const copy = { ...prev };
      students.forEach(s => { if (!copy[s.id]) copy[s.id] = 'absent'; });
      return copy;
    });

    // use centralized depart (this will simulate travel)
    departToNextStation();
  }, [currentStation, departToNextStation]);

  const moveToNextRoute = useCallback(() => {
    // move to next route or stop tracking if last
    if (currentRouteIndex < routesToday.length - 1) {
      setCurrentRouteIndex(i => i + 1);
      setCurrentStationIndex(0);
      setStudentCheckIns({});
      setIsStationActive(false);
      setStationTimer(0);
    } else {
      alert('HOÀN THÀNH TẤT CẢ CÁC TUYẾN TRONG NGÀY NAY!');
      setIsTracking(false);
      setCurrentRouteIndex(0);
      setCurrentStationIndex(-1);
      setStudentCheckIns({});
    }
  }, [currentRouteIndex, routesToday.length]);

  const startTracking = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (delayRef.current) { clearTimeout(delayRef.current); delayRef.current = null; }
    if (transitTimeoutRef.current) { clearTimeout(transitTimeoutRef.current); transitTimeoutRef.current = null; }

    setIsTracking(true);
    setCurrentRouteIndex(0);
    setCurrentStationIndex(0);
    setStudentCheckIns({});
    setStationTimer(0);
    setIsStationActive(false);
    setLastStoppedState(null);
    setInTransit(false);
    setTransitTargetIndex(null);

    try { localStorage.removeItem('lastStoppedBusState'); } catch (e) { console.error(e); }
  }, []);

  const stopTracking = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (delayRef.current) { clearTimeout(delayRef.current); delayRef.current = null; }
    if (transitTimeoutRef.current) { clearTimeout(transitTimeoutRef.current); transitTimeoutRef.current = null; }

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
    setStationTimer(0);
    setIsStationActive(false);
    setInTransit(false);
    setTransitTargetIndex(null);
  }, [currentRouteIndex, currentRoute, currentStationIndex, currentStation, studentCheckIns, todayLabel]);

  const resumeFromLastStopped = useCallback(() => {
    try {
      const saved = localStorage.getItem('lastStoppedBusState');
      if (!saved) return false;
      const data = JSON.parse(saved);
      setLastStoppedState(data);
      if (data.checkInData) setStudentCheckIns(data.checkInData);
      if (typeof data.stationIndex === 'number') setCurrentStationIndex(data.stationIndex);
      if (typeof data.routeIndex === 'number') setCurrentRouteIndex(data.routeIndex);
      setIsTracking(true);
      return true;
    } catch (e) { console.error(e); return false; }
  }, []);

  // ---------------- Core auto logic: arrive -> check-in -> depart ----------------
  useEffect(() => {
    // cleanup previous timers
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (delayRef.current) { clearTimeout(delayRef.current); delayRef.current = null; }

    // If inTransit, do not start ARRIVE/check-in for the transitTarget; wait until transit completes (which will update currentStationIndex)
    if (inTransit) {
      // ensure check-in not active
      setIsStationActive(false);
      setStationTimer(0);
      return;
    }

    // validation
    if (!isTracking || !currentRoute) {
      setIsStationActive(false);
      setStationTimer(0);
      return;
    }

    // if beyond stations -> move to next route
    if (currentStationIndex >= stations.length) {
      moveToNextRoute();
      return;
    }

    // ARRIVE: stop vehicle for check-in sequence at currentStation
    setIsStationActive(true);
    setStationTimer(0);

    // if final station of route: short pause then advance to next route (or finish)
    if (currentStationIndex === stations.length - 1) {
      delayRef.current = setTimeout(() => {
        // depart (which will simulate short transit and then set index beyond length to trigger moveToNextRoute)
        departToNextStation();
      }, 2000);
      return;
    }

    // start check-in after pre-arrival delay
    delayRef.current = setTimeout(() => {
      // ensure studentCheckIns has keys for current station students
      const students = STUDENTS_BY_STATION[currentStation?.id] || [];
      setStudentCheckIns(prev => {
        const copy = { ...prev };
        students.forEach(s => { if (!(s.id in copy)) copy[s.id] = undefined; });
        return copy;
      });

      // init countdown
      setStationTimer(CHECKIN_SECONDS);

      // start timer
      timerRef.current = setInterval(() => {
        setStationTimer(prev => {
          // timer expired -> mark remaining absent and depart
          if (prev <= 1) {
            const studentsNow = STUDENTS_BY_STATION[currentStation?.id] || [];
            studentsNow.forEach(s => {
              setStudentCheckIns(prevMap => {
                if (prevMap[s.id]) return prevMap;
                return { ...prevMap, [s.id]: 'absent' };
              });
            });

            if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

            // central depart (this will set inTransit and simulate travel)
            departToNextStation();
            return 0;
          }

          // early finish: if all present -> depart early
          const studentsForThis = STUDENTS_BY_STATION[currentStation?.id] || [];
          const presentCount = studentsForThis.filter(s => studentCheckInsRef.current[s.id] === 'present').length;

          if (studentsForThis.length > 0 && presentCount === studentsForThis.length) {
            if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

            // depart after small after-all-checked delay
            setTimeout(() => {
              departToNextStation();
            }, AFTER_ALL_CHECKED_DELAY_MS);

            return 0;
          }

          return prev - 1;
        });
      }, 1000);
    }, PRE_ARRIVAL_DELAY_MS);

    // cleanup when deps change
    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      if (delayRef.current) { clearTimeout(delayRef.current); delayRef.current = null; }
    };
  }, [currentStationIndex, isTracking, currentRoute, currentStation, stations.length, moveToNextRoute, departToNextStation, inTransit]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (delayRef.current) clearTimeout(delayRef.current);
      if (transitTimeoutRef.current) clearTimeout(transitTimeoutRef.current);
    };
  }, []);

  // ---------------- Expose context ----------------
  return (
    <RouteTrackingContext.Provider
      value={{
        // status
        isTracking,
        isCheckingIn,
        isMoving,
        inTransit,             // new: biểu thị đang đi tuyến giữa 2 trạm
        transitTargetIndex,    // optional: ai cần biết trạm đích
        currentRouteIndex,
        currentRoute,
        routesToday,
        currentStationIndex,
        currentStation,
        stations,
        currentStudents,
        studentCheckIns,
        stationTimer,
        isStationActive,
        lastStoppedState,
        allStudentsForContact,
        todayLabel,

        // actions
        startTracking,
        stopTracking,
        resumeFromLastStopped,
        checkInStudent,
        forceDepart,
        moveToNextRoute,
        departToNextStation, // exposed if UI wants to trigger depart manually
      }}
    >
      {children}
    </RouteTrackingContext.Provider>
  );
};

export default RouteTrackingContext;
