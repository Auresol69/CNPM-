// src/components/maps/RouteMapWithBackend.jsx
// Sử dụng backend ORS API thay vì external OSRM
import React, { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../fixLeafletIcon.js";
import { onBusLocationChanged, offEvent } from "../../services/socketService";

/* ============================================================
   🚌 ICON BUS (giống RouteMap.jsx)
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
   🚍 Real-time Bus Position (Socket.IO)
============================================================ */
function RealTimeBus({ tripId, isTracking = false }) {
    const map = useMap();
    const [position, setPosition] = useState(null);
    const mapRef = useRef(map); // Store map in ref to avoid dependency issues
    const listenerSetRef = useRef(false); // Track if listener is already set

    // Update map ref when map changes
    useEffect(() => {
        mapRef.current = map;
    }, [map]);

    useEffect(() => {
        if (!tripId || !isTracking) {
            setPosition(null);
            listenerSetRef.current = false;
            return;
        }

        // Prevent duplicate listeners
        if (listenerSetRef.current) {
            console.log('[RealTimeBus] Listener already set, skipping');
            return;
        }

        console.log('[RealTimeBus] Setting up listener for trip:', tripId);

        // Listener cho bus location updates
        // Backend gửi: { coords: {latitude, longitude}, nextStationIndex, totalStations }
        const handleLocationUpdate = (data) => {
            // Parse đúng data structure từ backend
            const coords = data?.coords || data; // Fallback nếu backend chỉ gửi coords

            if (coords && coords.latitude && coords.longitude) {
                const newPos = [coords.latitude, coords.longitude];
                setPosition(newPos);
                try {
                    mapRef.current?.panTo(newPos, { animate: true, duration: 0.6 });
                } catch (e) {
                    console.error('[RouteMap] Pan error:', e);
                }
            }
        };

        onBusLocationChanged(handleLocationUpdate);
        listenerSetRef.current = true;

        // Cleanup - chỉ khi component unmount hoặc tripId thay đổi
        return () => {
            console.log('[RealTimeBus] Cleaning up listener');
            offEvent('bus:location_changed');
            listenerSetRef.current = false;
        };
    }, [tripId, isTracking]); // Removed 'map' dependency!

    if (!position) return null;

    return (
        <Marker position={position} icon={busIcon}>
            <Popup>
                <div className="font-bold">🚌 Xe buýt đang chạy</div>
                <div className="text-sm mt-1">
                    Lat: {position[0].toFixed(5)}, Lng: {position[1].toFixed(5)}
                </div>
            </Popup>
        </Marker>
    );
}

/* ============================================================
   🗺️ RouteMapWithBackend — Sử dụng backend coordinates
   
   Props:
   - routeShape: { coordinates: [[lng, lat], ...] } - từ backend trip.routeId.shape
   - stops: [{ id, name, position: [lat, lng], time }]
   - tripId: ID của trip (để listen socket)
   - isTracking: boolean
   - currentStationIndex: number
============================================================ */
export default function RouteMapWithBackend({
    center = [10.77, 106.68],
    zoom = 14,
    routeShape = null, // Backend route shape
    stops = [],
    tripId = null,
    isTracking = false,
    currentStationIndex = -1,
}) {
    const [polylineCoords, setPolylineCoords] = useState([]);
    const mountedRef = useRef(false);

    // Debug: Log props ONLY on first mount
    useEffect(() => {
        if (!mountedRef.current) {
            console.log('[RouteMapWithBackend] Initial mount:', {
                tripId,
                isTracking,
                currentStationIndex,
                stopsCount: stops.length,
                hasRouteShape: !!routeShape?.coordinates
            });
            mountedRef.current = true;
        }
    }, [tripId, isTracking, currentStationIndex, stops.length, routeShape]);

    // Convert backend coordinates [[lng, lat],...] -> [[lat, lng],...] cho Leaflet
    useEffect(() => {
        if (routeShape?.coordinates && Array.isArray(routeShape.coordinates)) {
            // Backend trả về [lng, lat], Leaflet cần [lat, lng]
            const converted = routeShape.coordinates.map(coord => [coord[1], coord[0]]);
            setPolylineCoords(converted);
            console.log('[RouteMap] Backend route loaded:', converted.length, 'points');
        } else if (stops.length >= 2) {
            // Fallback: vẽ straight line giữa các stops
            setPolylineCoords(stops.map(s => s.position));
        }
    }, [routeShape, stops]);

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
        <div className="h-96 w-full rounded-xl overflow-hidden shadow-2xl border-4 border-indigo-100">
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Vẽ route từ backend shape */}
                {polylineCoords.length > 1 && (
                    <Polyline
                        positions={polylineCoords}
                        color="#4f46e5"
                        weight={9}
                        opacity={0.9}
                    />
                )}

                {/* Markers cho các trạm */}
                {stops.map((stop, idx) => (
                    <Marker
                        key={stop.id}
                        position={stop.position}
                        icon={stopIcon(idx, idx === currentStationIndex)}
                    >
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

                {/* Real-time bus position từ Socket.IO */}
                <RealTimeBus tripId={tripId} isTracking={isTracking} />
            </MapContainer>
        </div>
    );
}
