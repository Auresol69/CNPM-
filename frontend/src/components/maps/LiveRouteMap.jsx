// src/components/maps/LiveRouteMap.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../fixLeafletIcon.js';

const busIcon = L.divIcon({
  html: `<div style="background:#1e40af; padding:8px; border-radius:50%; box-shadow:0 4px 10px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 16 16"><path d="M4 4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4z"/></svg></div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function AnimatedBus({ path }) {
  const map = useMap();
  const [position, setPosition] = useState(path[0]);

  useEffect(() => {
    if (path.length < 2) return;

    let i = 0;
    const total = path.length;
    const durationPerSegment = 3000; // 3 giây mỗi đoạn → tổng ~3 phút cho 60 đoạn

    const timer = setInterval(() => {
      i += 2;
      if (i < total) {
        setPosition(path[i]);
        map.panTo(path[i], { animate: true });
      } else {
        clearInterval(timer);
      }
    }, durationPerSegment);

    return () => clearInterval(timer);
  }, [path, map]);

  return <Marker position={position} icon={busIcon}>
    <Popup>Xe buýt đang di chuyển</Popup>
  </Marker>;
}

export default function LiveRouteMap({ route, routeShape = null }) {
  const [realPath, setRealPath] = useState([]);

  useEffect(() => {
    // Priority 1: Use backend route shape if available
    if (routeShape?.coordinates && Array.isArray(routeShape.coordinates) && routeShape.coordinates.length > 0) {
      const coords = routeShape.coordinates.map(c => [c[1], c[0]]);
      setRealPath(coords);
      console.log('[LiveRouteMap] Using backend route shape:', coords.length, 'points');
      return;
    }

    // Priority 2: Fallback to OSRM
    console.log('[LiveRouteMap] No backend shape, falling back to OSRM');
    const points = route.rawPath.map(p => `${p[1]},${p[0]}`).join(';');
    fetch(`https://router.project-osrm.org/route/v1/driving/${points}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .then(data => {
        if (data.routes?.[0]?.geometry?.coordinates) {
          const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          setRealPath(coords);
        }
      })
      .catch(() => setRealPath(route.rawPath)); // fallback nếu OSRM lỗi
  }, [route, routeShape]);

  const displayPath = realPath.length > 0 ? realPath : route.rawPath;

  return (
    <div className="relative z-0" style={{ height: '100%', width: '100%' }}>
      <MapContainer center={route.rawPath[0]} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Đường thật */}
        <Polyline positions={displayPath} color="#3b82f6" weight={8} opacity={0.9} />

        {/* Trạm dừng */}
        {route.stations.map(s => (
          <Marker key={s.id} position={[s.lat, s.lng]}>
            <Popup>
              <div className="font-bold">{s.name}</div>
              <div className="text-sm">Dự kiến: {s.time}</div>
              <div className="text-xs">Đón {s.students} em</div>
            </Popup>
          </Marker>
        ))}

        {/* Xe chạy animation */}
        {displayPath.length > 0 && <AnimatedBus path={displayPath} />}
      </MapContainer>
    </div>
  );
}