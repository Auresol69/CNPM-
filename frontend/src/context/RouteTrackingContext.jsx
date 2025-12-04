// // src/context/RouteTrackingContext.jsx
// import React, { createContext, useContext, useState, useEffect } from 'react';

// const RouteTrackingContext = createContext();

// export const useRouteTracking = () => useContext(RouteTrackingContext);

// const ROUTE_STATIONS = [
//   { id: 'st1', name: 'Trạm A - Nguyễn Trãi', position: [10.7628, 106.6602], time: '06:35' },
//   { id: 'st2', name: 'Trạm B - Lê Văn Sỹ', position: [10.7640, 106.6670], time: '06:42' },
//   { id: 'st3', name: 'Trạm C - CMT8', position: [10.7715, 106.6780], time: '06:50' },
//   { id: 'st4', name: 'THPT Lê Quý Đôn', position: [10.7800, 106.6950], time: '07:05' },
// ];

// export const RouteTrackingProvider = ({ children }) => {
//   const [isTracking, setIsTracking] = useState(false);
//   const [currentStationIndex, setCurrentStationIndex] = useState(-1);

//   useEffect(() => {
//     if (!isTracking) {
//       setCurrentStationIndex(-1);
//       return;
//     }

//     setCurrentStationIndex(0);

//     const events = [
//       { delay: 30000,  msg: 'ĐÃ ĐẾN: Trạm A - Nguyễn Trãi\nBắt đầu đón học sinh...' },
//       { delay: 75000,  msg: 'ĐÃ ĐẾN: Trạm B - Lê Văn Sỹ\nĐón 10 em...' },
//       { delay: 120000, msg: 'ĐÃ ĐẾN: Trạm C - CMT8\nĐón 6 em...' },
//       { delay: 165000, msg: 'ĐÃ ĐẾN: THPT Lê Quý Đôn\nTrả học sinh – HOÀN THÀNH!' },
//     ];

//     events.forEach((event, idx) => {
//       setTimeout(() => {
//         setCurrentStationIndex(idx + 1);
//         alert(event.msg);
//       }, event.delay);
//     });

//     setTimeout(() => {
//       setIsTracking(false);
//       setCurrentStationIndex(ROUTE_STATIONS.length);
//       alert('HOÀN THÀNH CHUYẾN ĐI!\nChuyến đi đã kết thúc thành công.');
//     }, 180000);
//   }, [isTracking]);

//   const startTracking = () => {
//     setIsTracking(true);
//     alert('BẮT ĐẦU CHUYẾN ĐI!\nXe buýt đang chạy trên đường thật tại TP.HCM');
//   };

//   const stopTracking = () => {
//     setIsTracking(false);
//     setCurrentStationIndex(-1);
//     alert('ĐÃ DỪNG CHUYẾN ĐI');
//   };

//   return (
//     <RouteTrackingContext.Provider value={{
//       isTracking,
//       currentStationIndex,
//       startTracking,
//       stopTracking,
//       stations: ROUTE_STATIONS,
//     }}>
//       {children}
//     </RouteTrackingContext.Provider>
//   );
// };
// src/context/RouteTrackingContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const RouteTrackingContext = createContext();
export const useRouteTracking = () => useContext(RouteTrackingContext);

const ROUTE_STATIONS = [
  { id: 'st1', name: 'Trạm A - Nguyễn Trãi', position: [10.7628, 106.6602], time: '06:35' },
  { id: 'st2', name: 'Trạm B - Lê Văn Sỹ', position: [10.7640, 106.6670], time: '06:42' },
  { id: 'st3', name: 'Trạm C - CMT8', position: [10.7715, 106.6780], time: '06:50' },
  { id: 'st4', name: 'THPT Lê Quý Đôn', position: [10.7800, 106.6950], time: '07:05' },
];

export const RouteTrackingProvider = ({ children }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentStationIndex, setCurrentStationIndex] = useState(-1);
  const [lastStoppedState, setLastStoppedState] = useState(() => {
    const saved = localStorage.getItem('lastStoppedBusState');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (!isTracking) return;

    setCurrentStationIndex(0);
    setLastStoppedState(null);
    localStorage.removeItem('lastStoppedBusState');

    const events = [
      { delay: 30000, station: 0 },
      { delay: 75000, station: 1 },
      { delay: 120000, station: 2 },
      { delay: 165000, station: 3 },
    ];

    events.forEach(e => {
      setTimeout(() => setCurrentStationIndex(e.station + 1), e.delay);
    });

    setTimeout(() => {
      setIsTracking(false);
      setCurrentStationIndex(ROUTE_STATIONS.length);
    }, 180000);
  }, [isTracking]);

  const startTracking = () => {
    setIsTracking(true);
  };

  const stopTracking = () => {
    if (!isTracking) return;

    const currentStation = ROUTE_STATIONS[currentStationIndex] || ROUTE_STATIONS[0];
    const now = new Date().toLocaleString('vi-VN');

    const stoppedData = {
      stationIndex: currentStationIndex,
      stationName: currentStationIndex >= 0 ? currentStation.name : 'Chưa xuất phát',
      position: currentStationIndex >= 0 ? currentStation.position : ROUTE_STATIONS[0].position,
      time: now,
      pickedUpStudents: currentStationIndex >= 0 ? currentStationIndex * 8 + 4 : 0,
    };

    setLastStoppedState(stoppedData);
    localStorage.setItem('lastStoppedBusState', JSON.stringify(stoppedData));
    setIsTracking(false);
    setCurrentStationIndex(-1);

    alert(`ĐÃ DỪNG CHUYẾN!\nDừng tại: ${stoppedData.stationName}\nThời gian: ${now}\nĐã đón: ${stoppedData.pickedUpStudents} em`);
  };

  return (
    <RouteTrackingContext.Provider value={{
      isTracking,
      currentStationIndex,
      stations: ROUTE_STATIONS,
      startTracking,
      stopTracking,
      lastStoppedState,
      lastStoppedPosition: lastStoppedState?.position || null,
    }}>
      {children}
    </RouteTrackingContext.Provider>
  );
};