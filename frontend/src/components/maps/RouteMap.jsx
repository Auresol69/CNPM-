// src/components/maps/RouteMap.jsx
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../fixLeafletIcon.js";

/* ============================================================
   🚌 ICON BUS
   (giữ nguyên thiết kế của bạn)
============================================================ */
const busIcon = L.divIcon({
  html: `
    <div style="
      background: linear-gradient(135deg, #1d4ed8, #3b82f6);
      color: white;
      width: 56px; height: 56px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: bold;
      border: 6px solid white;
      box-shadow: 0 8px 30px rgba(0,0,0,0.5);
      animation: float 3s ease-in-out infinite;
    ">BUS</div>

    <style>
      @keyframes float {
        0%,100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
    </style>
  `,
  className: "",
  iconSize: [56, 56],
  iconAnchor: [28, 56],
});

/* ============================================================
   🚍 Animated Bus (with persisted stopped position)
============================================================ */
function AnimatedBus({
  path = [],
  isTracking = false,
  isAtStation = false,
  isCheckingIn = false,
  lastStoppedPosition = null,
  isMoving = null, // optional override
  persistStopped = true,
}) {
  const map = useMap();
  const [position, setPosition] = useState(null);

  const rafRef = useRef(null); // Keep for cleanup

  // decide moving state if not passed explicitly
  const computedIsMoving = isMoving ?? (isTracking && !isAtStation && !isCheckingIn);

  // Persist last stopped position into localStorage (so app can resume later)
  useEffect(() => {
    if (persistStopped && isAtStation && position) {
      try {
        localStorage.setItem("lastStoppedBusPosition", JSON.stringify(position));
      } catch (e) {
        console.error(e);
        // ignore storage errors
      }
    }
  }, [persistStopped, isAtStation, position]);

  useEffect(() => {
    // Cancel any ongoing animation
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    // Nếu không tracking → hiển thị lastStoppedPosition hoặc điểm đầu
    if (!isTracking) {
      if (lastStoppedPosition) {
        setPosition(lastStoppedPosition);
        try { map.panTo(lastStoppedPosition); } catch (e) { console.error(e); }
      } else if (path.length > 0) {
        setPosition(path[0]);
        try { map.panTo(path[0]); } catch (e) { console.error(e); }
      }
      return;
    }

    // Nếu đang tracking → hiển thị lastStoppedPosition (vị trí thực từ GPS)
    // KHÔNG tự động di chuyển - chỉ cập nhật khi nhận GPS mới từ socket
    if (lastStoppedPosition) {
      setPosition(lastStoppedPosition);
      try { map.panTo(lastStoppedPosition); } catch (e) { console.error(e); }
    } else if (path.length > 0) {
      setPosition(path[0]);
      try { map.panTo(path[0]); } catch (e) { console.error(e); }
    }

    // Cleanup
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isTracking, isAtStation, isCheckingIn, path, lastStoppedPosition, map]);

  if (!position) return null;

  // popup message with clearer state
  let popupText = "🚌 Đang di chuyển";
  if (isCheckingIn) popupText = "🚏 Đang check-in học sinh";
  else if (isAtStation) popupText = "🅿 Đã dừng tại trạm";
  else if (!computedIsMoving) popupText = "⏸ Tạm dừng";

  return (
    <Marker position={position} icon={busIcon}>
      <Popup>
        <div className="font-bold">{popupText}</div>
        <div className="text-sm mt-1">
          {Array.isArray(position) ? `Lat: ${position[0].toFixed(5)}, Lng: ${position[1].toFixed(5)}` : ""}
        </div>
      </Popup>
    </Marker>
  );
}

/* ============================================================
   🗺️ RouteMap — export component
   Props:
     - stops: array of {id,name,position,time}
     - isTracking, isAtStation, isCheckingIn, isMoving (optional)
     - currentStationIndex, lastStoppedPosition
     - persistStopped (optional)
============================================================ */
export default function RouteMap({
  center = [10.77, 106.68],
  zoom = 14,
  stops = [],
  routeShape = null, // Backend route shape { type: 'LineString', coordinates: [[lng, lat], ...] }
  isTracking = false,
  isAtStation = false,
  isCheckingIn = false,
  isMoving = null,
  currentStationIndex = -1,
  lastStoppedPosition = null,
  persistStopped = true,
}) {
  const [realPath, setRealPath] = useState([]);

  // Stabilize dependencies using JSON.stringify to prevent re-runs on same data
  const routeShapeKey = JSON.stringify(routeShape);
  const stopsKey = JSON.stringify(stops.map(s => ({ id: s.id, position: s.position })));

  useEffect(() => {
    // Priority 1: Use backend route shape if available
    if (routeShape?.coordinates && Array.isArray(routeShape.coordinates) && routeShape.coordinates.length > 0) {
      // Backend returns [lng, lat], Leaflet needs [lat, lng]
      const converted = routeShape.coordinates.map(coord => [coord[1], coord[0]]);
      setRealPath(converted);
      console.log('[RouteMap] Using backend route shape:', converted.length, 'points');
      return;
    }

    // Priority 2: Fallback - connect stops with straight lines if < 2 stops
    if (stops.length < 2) {
      setRealPath(stops.map(s => s.position));
      return;
    }

    // Priority 3: Fallback to OSRM API (only when backend shape not available)
    console.log('[RouteMap] No backend shape, falling back to OSRM');
    const coords = stops.map((s) => `${s.position[1]},${s.position[0]}`).join(";");

    fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`)
      .then((r) => r.json())
      .then((d) => {
        if (d.routes?.[0]?.geometry?.coordinates) {
          setRealPath(d.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]));
        } else {
          setRealPath(stops.map((s) => s.position));
        }
      })
      .catch(() => setRealPath(stops.map((s) => s.position)));
  }, [routeShapeKey, stopsKey]); // Use stable keys instead of objects

  const stopIcon = (index, isCurrent) =>
    L.divIcon({
      html: `
        <div style="
          background: ${isCurrent ? "#8b5cf6" : "#10b981"};
          color: white;
          width: 48px; height: 48px;
          border-radius: 50%;
          display: flex; justify-content:center; align-items:center;
          font-size: 20px; font-weight: bold;
          border: 6px solid white;
          box-shadow: 0 8px 25px rgba(0,0,0,0.4);
          animation: ${isCurrent ? "pulse 2s infinite" : "none"};
        ">${index + 1}</div>

        <style>
          @keyframes pulse {
            0% { box-shadow:0 0 0 0 rgba(139,92,246,0.7) }
            70% { box-shadow:0 0 0 20px rgba(139,92,246,0) }
            100% { box-shadow:0 0 0 0 rgba(139,92,246,0) }
          }
        </style>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 48],
    });

  return (
    <div className="h-96 w-full rounded-xl overflow-hidden shadow-2xl border-4 border-indigo-100 relative z-0">
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {realPath.length > 1 && <Polyline positions={realPath} color="#4f46e5" weight={9} opacity={0.9} />}

        {stops.map((stop, idx) => (
          <Marker key={stop.id} position={stop.position} icon={stopIcon(idx, idx === currentStationIndex)}>
            <Popup>
              <div className="text-center">
                <div className="font-bold text-xl text-indigo-700">{stop.name}</div>
                <div className="text-sm text-gray-600">Dự kiến: {stop.time}</div>
                {idx === currentStationIndex && (
                  <div className="mt-3 px-4 py-2 bg-green-600 text-white rounded-full text-lg font-bold animate-pulse">
                    ĐANG CHECK-IN
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        <AnimatedBus
          path={realPath.length ? realPath : stops.map((s) => s.position)}
          isTracking={isTracking}
          isAtStation={isAtStation}
          isCheckingIn={isCheckingIn}
          isMoving={isMoving}
          lastStoppedPosition={lastStoppedPosition}
          persistStopped={persistStopped}
        />
      </MapContainer>
    </div>
  );
}
