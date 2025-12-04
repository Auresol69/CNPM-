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

export default function useDriverRouteLogic(routeStations = []) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isAtStation, setIsAtStation] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [logs, setLogs] = useState([]);

  const watchIdRef = useRef(null);
  const approachingSentRef = useRef(false);

  const pushLog = useCallback((type, station = null, extra = '') => {
    setLogs(prev => [{
      ts: Date.now(),
      type,
      station,
      message: extra || type.replace('driver:', '').replace('_', ' ').replace('_', ' '),
      distance: typeof extra === 'string' && extra.includes('m') ? extra : undefined
    }, ...prev].slice(0, 200));
  }, []);

  const emit = useCallback((eventName, payload) => {
    if (socket.connected) {
      socket.emit(eventName, payload);
    } else {
      socket.once('connect', () => socket.emit(eventName, payload));
    }
  }, []);

  const getNextStation = useCallback(() => 
    routeStations[currentIndex + 1] || null, 
  [routeStations, currentIndex]);

  const currentStation = routeStations[currentIndex] || null;
  const nextStation = getNextStation();

  const onPosition = useCallback((pos) => {
    if (!pos?.coords) return;

    const { latitude: lat, longitude: lng, accuracy } = pos.coords;
    const newPos = { lat, lng, accuracy, ts: pos.timestamp };
    setCurrentPosition(newPos);

    if (!nextStation) return;

    const distance = getDistanceFromLatLonInMeters(lat, lng, nextStation.lat, nextStation.lng);

    if (distance < APPROACHING_THRESHOLD && !approachingSentRef.current) {
      emit('driver:approaching_station', { station: nextStation, distance: Math.round(distance) });
      pushLog('driver:approaching_station', nextStation, `${Math.round(distance)}m`);
      approachingSentRef.current = true;
    }

    if (distance < ARRIVED_THRESHOLD && !isAtStation) {
      emit('driver:arrived_at_station', { station: nextStation });
      setIsAtStation(true);
      pushLog('driver:arrived_at_station', nextStation);
    }

    if (distance >= ARRIVED_THRESHOLD && isAtStation) {
      emit('driver:departed_at_station', { station: currentStation || nextStation });
      setIsAtStation(false);
      pushLog('driver:departed_at_station', currentStation || nextStation);

      setCurrentIndex(prev => {
        const next = prev + 1 < routeStations.length ? prev + 1 : prev;
        if (next !== prev) approachingSentRef.current = false;
        return next;
      });
    }
  }, [emit, pushLog, nextStation, currentStation, isAtStation, routeStations.length]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị!');
      return;
    }

    if (isTracking) return;

    socket.connect();

    const id = navigator.geolocation.watchPosition(
      onPosition,
      (err) => pushLog('error', null, err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 30000 }
    );

    watchIdRef.current = id;
    setIsTracking(true);
    setCurrentIndex(0);
    setIsAtStation(false);
    approachingSentRef.current = false;
    pushLog('tracking_started');
  }, [isTracking, onPosition, pushLog]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    socket.disconnect();
    setIsTracking(false);
    pushLog('tracking_stopped');
  }, [pushLog]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      socket.disconnect();
    };
  }, []);

  return {
    currentIndex,
    currentStation,
    nextStation,
    isAtStation,
    isTracking,
    currentPosition,
    logs,
    startTracking,
    stopTracking,
  };
}