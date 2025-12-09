// import { useEffect, useRef, useState, useCallback } from 'react';
// import { getDistanceFromLatLonInMeters } from '../utils/distance';
// import { socket } from '../utils/socket';

// const APPROACHING_THRESHOLD = 100;
// const ARRIVED_THRESHOLD = 50;

// export default function useDriverRouteLogic(routeStations = []) {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isTracking, setIsTracking] = useState(false);
//   const [isAtStation, setIsAtStation] = useState(false);
//   const [currentPosition, setCurrentPosition] = useState(null);
//   const [logs, setLogs] = useState([]);

//   const watchIdRef = useRef(null);
//   const approachingSentRef = useRef(false);

//   const pushLog = useCallback((type, station = null, extra = '') => {
//     setLogs(prev => [{
//       ts: Date.now(),
//       type,
//       station,
//       message: extra || type.replace('driver:', '').replace('_', ' '),
//       distance: type === 'driver:approaching_station' ? extra : undefined
//     }, ...prev].slice(0, 200));
//   }, []);

//   const emit = useCallback((eventName, payload) => {
//     if (socket.connected) {
//       socket.emit(eventName, payload);
//     } else {
//       socket.once('connect', () => socket.emit(eventName, payload));
//     }
//   }, []);

//   const getNextStation = useCallback(() => routeStations[currentIndex + 1] || null, [routeStations, currentIndex]);

//   const currentStation = routeStations[currentIndex] || null;
//   const nextStation = getNextStation();

//   const onPosition = useCallback((pos) => {
//     if (!pos?.coords) return;

//     const { latitude: lat, longitude: lng, accuracy } = pos.coords;
//     const newPos = { lat, lng, accuracy, ts: pos.timestamp };
//     setCurrentPosition(newPos);

//     if (!nextStation) return;

//     const distance = getDistanceFromLatLonInMeters(lat, lng, nextStation.lat, nextStation.lng);

//     if (distance < APPROACHING_THRESHOLD && !approachingSentRef.current) {
//       emit('driver:approaching_station', { station: nextStation, distance: Math.round(distance) });
//       pushLog('driver:approaching_station', nextStation, Math.round(distance) + 'm');
//       approachingSentRef.current = true;
//     }

//     if (distance < ARRIVED_THRESHOLD && !isAtStation) {
//       emit('driver:arrived_at_station', { station: nextStation });
//       setIsAtStation(true);
//       pushLog('driver:arrived_at_station', nextStation);
//     }

//     if (distance >= ARRIVED_THRESHOLD && isAtStation) {
//       emit('driver:departed_at_station', { station: currentStation || nextStation });
//       setIsAtStation(false);
//       pushLog('driver:departed_at_station', currentStation || nextStation);

//       setCurrentIndex(prev => {
//         const next = prev + 1 < routeStations.length ? prev + 1 : prev;
//         if (next !== prev) approachingSentRef.current = false;
//         return next;
//       });
//     }
//   }, [emit, pushLog, nextStation, currentStation, isAtStation, routeStations.length]);

//   const startTracking = useCallback(() => {
//     if (!navigator.geolocation) return;

//     if (isTracking) return;

//     socket.connect();

//     const id = navigator.geolocation.watchPosition(
//       onPosition,
//       (err) => pushLog('error', null, err.message),
//       { enableHighAccuracy: true, maximumAge: 5000, timeout: 30000 }
//     );

//     watchIdRef.current = id;
//     setIsTracking(true);
//     setCurrentIndex(0);
//     setIsAtStation(false);
//     approachingSentRef.current = false;
//     pushLog('tracking_started');
//   }, [isTracking, onPosition, pushLog]);

//   const stopTracking = useCallback(() => {
//     if (watchIdRef.current) {
//       navigator.geolocation.clearWatch(watchIdRef.current);
//       watchIdRef.current = null;
//     }
//     socket.disconnect();
//     setIsTracking(false);
//     pushLog('tracking_stopped');
//   }, [pushLog]);

//   useEffect(() => {
//     return () => {
//       if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
//       socket.disconnect();
//     };
//   }, []);

//   return {
//     currentIndex,
//     currentStation,
//     nextStation,
//     isAtStation,
//     isTracking,
//     currentPosition,
//     logs,
//     startTracking,
//     stopTracking,
//   };
// }
// src/hooks/useDriverRouteLogic.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { getDistanceFromLatLonInMeters } from '../utils/distance';
import { socket } from '../utils/socket';

const APPROACHING_THRESHOLD = 100;
const ARRIVED_THRESHOLD = 50;
const CHECKIN_DURATION = 20000; // 20 giây check-in tại mỗi trạm

export default function useDriverRouteLogic(routeStations = []) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isAtStation, setIsAtStation] = useState(false);

  // 🆕 Check-in states
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInEndTime, setCheckInEndTime] = useState(null);
  const [checkedStudents, setCheckedStudents] = useState(0);
  const [missingStudents, setMissingStudents] = useState([]);

  const [lastStoppedPosition, setLastStoppedPosition] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [logs, setLogs] = useState([]);

  const watchIdRef = useRef(null);
  const approachingSentRef = useRef(false);

  const pushLog = useCallback((msg) => {
    setLogs((prev) => [msg, ...prev].slice(0, 200));
  }, []);

  const emit = (event, data) => {
    if (socket.connected) socket.emit(event, data);
  };

  const currentStation = routeStations[currentIndex] || null;
  const nextStation = routeStations[currentIndex + 1] || null;

  /* =========================================================
     🛑 LOGIC CHECK-IN
  ========================================================== */
  useEffect(() => {
    if (!isCheckingIn || !checkInEndTime) return;

    const interval = setInterval(() => {
      if (Date.now() >= checkInEndTime) {
        // HẾT CHECK-IN
        const unChecked = currentStation?.students?.filter(
          (s) => !s.checked && !missingStudents.includes(s.id)
        ) || [];

        if (unChecked.length > 0) {
          setMissingStudents((prev) => [...prev, ...unChecked.map((s) => s.id)]);

          // Gửi noti lên server
          emit('driver:student_absent', {
            station: currentStation,
            absent: unChecked
          });
        }

        pushLog(`⏱ Hết thời gian check-in tại ${currentStation?.name}`);
        setIsCheckingIn(false);
        setIsAtStation(false);

        // Cho xe đi tiếp
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isCheckingIn, checkInEndTime, currentStation]);

  /* =========================================================
     📍 NHẬN VỊ TRÍ GPS + XỬ LÝ TIẾP CẬN TRẠM
  ========================================================== */
  const onPosition = (pos) => {
    if (!pos.coords) return;
    const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    setCurrentPosition(newPos);

    // Nếu đang check-in → xe đứng yên
    if (isCheckingIn) {
      setLastStoppedPosition(newPos);
      return;
    }

    if (!nextStation) return;

    const distance = getDistanceFromLatLonInMeters(
      newPos.lat, newPos.lng, nextStation.lat, nextStation.lng
    );

    // Gần tới trạm
    if (distance < APPROACHING_THRESHOLD && !approachingSentRef.current) {
      emit('driver:approaching_station', { station: nextStation });
      approachingSentRef.current = true;
    }

    // ĐẾN TRẠM – BẮT ĐẦU CHECK-IN
    if (distance < ARRIVED_THRESHOLD && !isAtStation) {
      setIsAtStation(true);

      emit('driver:arrived_at_station', { station: nextStation });

      setCurrentIndex((i) => i + 1);
      setIsCheckingIn(true);
      setCheckInEndTime(Date.now() + CHECKIN_DURATION);
      setLastStoppedPosition({
        lat: nextStation.lat,
        lng: nextStation.lng
      });
      return;
    }
  };

  const startTracking = () => {
    if (isTracking) return;
    setIsTracking(true);

    socket.connect();
    pushLog("▶ Bắt đầu chuyến đi");

    watchIdRef.current = navigator.geolocation.watchPosition(onPosition, console.error, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000
    });
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setIsCheckingIn(false);
    socket.disconnect();
  };

  return {
    // STATES
    currentIndex,
    currentStation,
    nextStation,
    isTracking,
    isAtStation,
    isCheckingIn,
    checkInEndTime,
    checkedStudents,
    missingStudents,
    currentPosition,
    lastStoppedPosition,

    // ACTIONS
    startTracking,
    stopTracking,
    setCheckedStudents,
  };
}
