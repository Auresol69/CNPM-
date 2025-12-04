// // src/components/maps/RouteMap.jsx
// import React, { useEffect, useState } from 'react';
// import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import '../../fixLeafletIcon.js';

// // Icon xe buýt đẹp
// const busIcon = L.divIcon({
//   html: `<div style="background:#1d4ed8;color:white;padding:10px;border-radius:50%;box-shadow:0 4px 20px rgba(0,0,0,0.4);font-size:20px;">Bus</div>`,
//   className: '',
//   iconSize: [50, 50],
//   iconAnchor: [25, 50],
// });

// // Animation xe chạy mượt theo đường thật
// function AnimatedBus({ path }) {
//   const map = useMap();
//   const [posIndex, setPosIndex] = useState(0);

//   useEffect(() => {
//     if (path.length < 2) return;
//     const totalTime = 180000; // 3 phút
//     const stepTime = totalTime / path.length;

//     const timer = setInterval(() => {
//       setPosIndex(prev => {
//         const next = prev + 1;
//         if (next < path.length) {
//           map.panTo(path[next], { animate: true, duration: 1 });
//           return next;
//         }
//         clearInterval(timer);
//         return prev;
//       });
//     }, stepTime);

//     return () => clearInterval(timer);
//   }, [path, map]);

//   if (path.length === 0) return null;
//   return <Marker position={path[posIndex]} icon={busIcon}>
//     <Popup>Xe buýt đang di chuyển realtime</Popup>
//   </Marker>;
// }

// export default function RouteMap({ center = [10.77, 106.68], zoom = 14, stops = [], currentPosition = null }) {
//   const [realPath, setRealPath] = useState([]);

//   useEffect(() => {
//     if (stops.length < 2) return;

//     const coords = stops.map(s => `${s.position[1]},${s.position[0]}`).join(';');
//     fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`)
//       .then(r => r.json())
//       .then(data => {
//         if (data.routes?.[0]?.geometry?.coordinates) {
//           const route = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
//           setRealPath(route);
//         }
//       })
//       .catch(() => {
//         // Fallback: nối thẳng nếu OSRM lỗi
//         setRealPath(stops.map(s => s.position));
//       });
//   }, [stops]);

//   return (
//     <div className="h-96 w-full rounded-xl overflow-hidden shadow-2xl border-4 border-indigo-100">
//       <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
//         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//         {/* Đường thật từ OSRM */}
//         {realPath.length > 1 && (
//           <Polyline positions={realPath} color="#4f46e5" weight={8} opacity={0.9} />
//         )}

//         {/* Trạm dừng */}
//         {stops.map(stop => (
//           <Marker key={stop.id} position={stop.position}>
//             <Popup>
//               <div className="font-bold text-indigo-600">{stop.name}</div>
//               <div className="text-sm">{stop.time}</div>
//             </Popup>
//           </Marker>
//         ))}

//         {/* Xe chạy animation */}
//         {realPath.length > 0 && <AnimatedBus path={realPath} />}

//         {/* Vị trí GPS thật (nếu có) */}
//         {currentPosition && (
//           <Marker position={currentPosition} icon={busIcon}>
//             <Popup>Vị trí hiện tại</Popup>
//           </Marker>
//         )}
//       </MapContainer>
//     </div>
//   );
// }
// src/components/maps/RouteMap.jsx
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../fixLeafletIcon.js';

// Icon xe buýt siêu đẹp
const busIcon = L.divIcon({
  html: `
    <div style="
      background: linear-gradient(135deg, #1d4ed8, #3b82f6);
      color: white;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 18px;
      border: 6px solid white;
      box-shadow: 0 8px 30px rgba(0,0,0,0.5);
      animation: float 3s ease-in-out infinite;
    ">BUS</div>
    <style>
      @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    </style>
  `,
  className: '',
  iconSize: [56, 56],
  iconAnchor: [28, 56],
});

function AnimatedBus({ 
  path, 
  isTracking, 
  currentStationIndex, 
  totalStations,
  lastStoppedPosition = null 
}) {
  const map = useMap();
  const [position, setPosition] = useState(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedElapsedRef = useRef(0);

  useEffect(() => {
    if (!isTracking || path.length === 0) {
      if (!isTracking && lastStoppedPosition) {
        setPosition(lastStoppedPosition);
        map.panTo(lastStoppedPosition, { animate: true, duration: 1 });
      } else {
        setPosition(null);
      }
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    // Khôi phục từ vị trí đã dừng
    if (!startTimeRef.current && lastStoppedPosition) {
      const closestIndex = path.reduce((best, curr, i) => {
        const dist = Math.hypot(curr[0] - lastStoppedPosition[0], curr[1] - lastStoppedPosition[1]);
        const bestDist = Math.hypot(path[best][0] - lastStoppedPosition[0], path[best][1] - lastStoppedPosition[1]);
        return dist < bestDist ? i : best;
      }, 0);

      const totalDuration = 240000;
      const progressSoFar = closestIndex / path.length;
      pausedElapsedRef.current = progressSoFar * totalDuration;
      startTimeRef.current = Date.now() - pausedElapsedRef.current;

      setPosition(lastStoppedPosition);
      map.panTo(lastStoppedPosition, { animate: true });
    } else if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
      setPosition(path[0]);
      map.panTo(path[0], { animate: true });
    }

    const animate = () => {
      const totalDuration = 240000;
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / totalDuration, 1);
      const targetIndex = Math.floor(progress * path.length);

      if (targetIndex >= path.length - 1) {
        setPosition(path[path.length - 1]);
        map.panTo(path[path.length - 1]);
        return;
      }

      const pos = path[targetIndex];
      setPosition(pos);
      map.panTo(pos, { animate: true, duration: 0.6 });

      const pointsPerStation = Math.floor(path.length / totalStations);
      const currentSegment = Math.floor(targetIndex / pointsPerStation);

      if (currentSegment > currentStationIndex && targetIndex % pointsPerStation < 15) {
        setTimeout(() => {
          animationRef.current = requestAnimationFrame(animate);
        }, 10000); // Dừng 10 giây
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isTracking, path, currentStationIndex, totalStations, lastStoppedPosition, map]);

  if (!isTracking && lastStoppedPosition) {
    return (
      <Marker position={lastStoppedPosition} icon={busIcon}>
        <Popup>
          <div className="font-bold text-orange-600">ĐÃ DỪNG TẠI ĐÂY</div>
          <div className="text-sm">Nhấn BẮT ĐẦU để tiếp tục</div>
        </Popup>
      </Marker>
    );
  }

  if (!isTracking && path.length > 0) {
    return (
      <Marker position={path[0]} icon={busIcon}>
        <Popup>Đang chờ xuất phát</Popup>
      </Marker>
    );
  }

  if (!position) return null;

  return (
    <Marker position={position} icon={busIcon}>
      <Popup>
        <div className="font-bold text-indigo-700">Xe buýt đang di chuyển</div>
        <div className="text-sm">
          {currentStationIndex >= 0 
            ? `Đang dừng tại trạm ${currentStationIndex + 1}` 
            : `Đang đến trạm ${currentStationIndex + 2}`
          }
        </div>
      </Popup>
    </Marker>
  );
}

export default function RouteMap({ 
  center = [10.77, 106.68], 
  zoom = 14, 
  stops = [], 
  isTracking = false, 
  currentStationIndex = -1,
  lastStoppedPosition = null
}) {
  const [realPath, setRealPath] = useState([]);

  useEffect(() => {
    if (stops.length < 2) {
      setRealPath([]);
      return;
    }

    const coords = stops.map(s => `${s.position[1]},${s.position[0]}`).join(';');
    fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .then(data => {
        if (data.routes?.[0]?.geometry?.coordinates) {
          const route = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          setRealPath(route);
        } else {
          setRealPath(stops.map(s => s.position));
        }
      })
      .catch(() => setRealPath(stops.map(s => s.position)));
  }, [stops]);

  const createStopIcon = (index, isCurrent) => L.divIcon({
    html: `
      <div style="
        background: ${isCurrent ? '#8b5cf6' : '#10b981'};
        color: white;
        width: 48px; height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 20px;
        border: 6px solid white;
        box-shadow: 0 8px 25px rgba(0,0,0,0.4);
        animation: ${isCurrent ? 'pulse 2s infinite' : 'none'};
      ">${index + 1}</div>
      <style>@keyframes pulse {0%{box-shadow:0 0 0 0 rgba(139,92,246,0.7)}70%{box-shadow:0 0 0 20px rgba(139,92,246,0)}100%{box-shadow:0 0 0 0 rgba(139,92,246,0)}}</style>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });

  return (
    <div className="h-96 w-full rounded-xl overflow-hidden shadow-2xl border-4 border-indigo-100">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {realPath.length > 1 && (
          <Polyline positions={realPath} color="#4f46e5" weight={9} opacity={0.9} />
        )}

        {stops.map((stop, idx) => (
          <Marker key={stop.id} position={stop.position} icon={createStopIcon(idx, idx === currentStationIndex)}>
            <Popup>
              <div className="text-center">
                <div className="font-bold text-xl text-indigo-700">{stop.name}</div>
                <div className="text-sm text-gray-600">Dự kiến: {stop.time}</div>
                {idx === currentStationIndex && (
                  <div className="mt-3 px-4 py-2 bg-green-500 text-white rounded-full font-bold animate-pulse text-lg">
                    ĐANG ĐÓN HỌC SINH
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        <AnimatedBus 
          path={realPath.length > 0 ? realPath : stops.map(s => s.position)}
          isTracking={isTracking}
          currentStationIndex={currentStationIndex}
          totalStations={stops.length}
          lastStoppedPosition={lastStoppedPosition}
        />
      </MapContainer>
    </div>
  );
}