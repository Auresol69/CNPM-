import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../../services/api';
import useSocket from '../../hooks/useSocket';
import 'leaflet/dist/leaflet.css';
import { MOCK_ROUTES } from '../../data/mockRoutes';

// --- Types ---
interface Coordinate {
  lat: number;
  lng: number;
}

interface Trip {
    _id: string;
    status: string;
    busId: {
        _id: string;
        licensePlate: string;
    };
    driverId: {
        name: string;
        phoneNumber: string;
    };
}

interface Stop {
  stopId: {
    _id: string;
    name: string;
    latitude: number;
    longitude: number;
  };
  arrivalTime?: string;
  schedule?: {
    arrivalTime: string;
  };
}

// Custom Bus Icon
const busIcon = L.divIcon({
  className: 'custom-bus-icon',
  html: `
    <div class="relative flex items-center justify-center w-10 h-10 bg-orange-500 text-white rounded-full border-2 border-white shadow-lg transform transition-transform hover:scale-110">
      <div class="text-xl">🚌</div>
      <span class="absolute -top-1 -right-1 flex h-3 w-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
      </span>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

// Custom Stop Icon
const stopIcon = L.divIcon({
  className: 'custom-stop-icon',
  html: `
    <div class="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full border-2 border-white shadow-md">
      <div class="text-xs">📍</div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

// --- Helper Component to Auto-Pan Map ---
const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
};

export default function Tracking() {
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [isSimulation, setIsSimulation] = useState(false);
  const [stops, setStops] = useState<Stop[]>([]);
  
  // Simulation State
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
  const [routePathIndex, setRoutePathIndex] = useState(0);
  
  // Current Display Data
  const currentRoute = MOCK_ROUTES[currentRouteIndex];
  // Convert [lat, lng] array to object for state if needed, or just use values
  const currentPoint = currentRoute.path[routePathIndex];
  const [busLocation, setBusLocation] = useState<Coordinate>({ lat: currentPoint[0], lng: currentPoint[1] });

  // Socket
  const socket = useSocket();

  // 1. Initial Setup: Fetch Trip
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await api.get('/trips/my-schedule');
        const trips = response.data.data || response.data || [];
        const current = trips.find((t: any) => t.status === 'IN_PROGRESS');
        if (current) {
          setActiveTrip(current);
          // Fetch trip details to get stops
          if (current._id) {
            fetchTripDetails(current._id);
          }
        }
      } catch (error) {
        console.warn("Could not fetch active trip, running in demo mode.");
      }
    };
    fetchTrip();
  }, []);

  // Fetch trip details including stops
  const fetchTripDetails = async (tripId: string) => {
    try {
      const response = await api.get(`/trips/${tripId}`);
      const tripData = response.data.data || response.data;
      if (tripData && tripData.orderedStops) {
        setStops(tripData.orderedStops);
      }
    } catch (error) {
      console.error("Could not fetch trip details:", error);
    }
  };

  // 2. Socket Logic (Real-time)
  useEffect(() => {
    if (!socket) return;

    const tripId = activeTrip?._id || 'demo_trip';
    socket.emit('join_trip_room', tripId); 
    console.log(`Joined room: ${tripId}`);

    const handleLocationUpdate = (newCoords: { latitude: number; longitude: number }) => {
      console.log("Real-time location received:", newCoords);
      setIsSimulation(false);
      setBusLocation({
        lat: newCoords.latitude,
        lng: newCoords.longitude
      });
    };

    socket.on('bus:location_changed', handleLocationUpdate);

    return () => {
      socket.off('bus:location_changed', handleLocationUpdate);
    };
  }, [socket, activeTrip]);

  // 3. Simulation Logic (Auto Loop)
  useEffect(() => {
    if (!isSimulation) return;

    const interval = setInterval(() => {
      setRoutePathIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        
        // Check if we reached the end of the current route
        if (nextIndex >= currentRoute.path.length) {
            // Move to next route
            const nextRouteIdx = (currentRouteIndex + 1) % MOCK_ROUTES.length;
            setCurrentRouteIndex(nextRouteIdx);
            return 0; // Reset path index for new route
        }
        
        return nextIndex;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isSimulation, currentRouteIndex, currentRoute.path.length]);

  // Update bus location when path index or route changes
  useEffect(() => {
      if (isSimulation) {
          const point = currentRoute.path[routePathIndex];
          setBusLocation({ lat: point[0], lng: point[1] });
      }
  }, [routePathIndex, currentRouteIndex, isSimulation, currentRoute]);




  return (
    <div className="flex flex-col h-[calc(100vh-100px)] lg:h-[calc(100vh-60px)] gap-4">
      {/* Header Controls */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {activeTrip ? `Bus ${activeTrip.busId?.licensePlate}` : 'Bus 51B-123.45'}
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-slate-500 font-medium">
              Live Tracking
            </span>
          </div>
        </div>
        
        <div className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold uppercase tracking-wider">
            Online
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden">
        {/* Map Area */}
        <div className="flex-1 rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative z-0 h-full">
          <MapContainer 
            center={[busLocation.lat, busLocation.lng]} 
            zoom={15} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Auto Pan */}
            <RecenterMap lat={busLocation.lat} lng={busLocation.lng} />

            {/* Route Line */}
            <Polyline 
              positions={currentRoute.path.map(p => [p[0], p[1]])} 
              color="#f97316" 
              weight={6} 
              opacity={0.8} 
            />

            {/* Bus Marker */}
            <Marker position={[busLocation.lat, busLocation.lng]} icon={busIcon}>
              <Popup>
                <div className="p-2 text-center">
                  <p className="font-bold text-slate-900">
                    {activeTrip?.busId?.licensePlate || '51B-123.45'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Speed: 45km/h
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Stop Markers */}
            {stops.map((stop, index) => (
              <Marker 
                key={stop.stopId._id || index}
                position={[stop.stopId.latitude, stop.stopId.longitude]} 
                icon={stopIcon}
              >
                <Popup>
                  <div className="p-2">
                    <p className="font-bold text-slate-900 text-sm">
                      {stop.stopId.name}
                    </p>
                    {(stop.arrivalTime || stop.schedule?.arrivalTime) && (
                      <p className="text-xs text-slate-500 mt-1">
                        Dự kiến: {new Date(stop.arrivalTime || stop.schedule?.arrivalTime || '').toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Overlay Status */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-slate-100 z-[400] max-w-[250px]">
            <p className="text-xs font-bold text-slate-400 uppercase">Lộ trình hiện tại</p>
            <p className="font-bold text-slate-800 text-sm truncate">
              {isSimulation ? currentRoute.name : 'Đang cập nhật...'}
            </p>
            {isSimulation && (
                <p className="text-xs text-slate-500 mt-1 truncate">{currentRoute.description}</p>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-full lg:w-80 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Driver</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-2xl">
                👨‍✈️
              </div>
              <div>
                <p className="font-bold text-slate-900">{activeTrip?.driverId?.name || 'Nguyễn Văn Tài'}</p>
                <p className="text-sm text-slate-500">{activeTrip?.driverId?.phoneNumber || '0909 123 456'}</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full"></div>

          <div>
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Vehicle</h3>
             <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Plate</span>
                    <span className="text-sm font-bold text-slate-900">{activeTrip?.busId?.licensePlate || '51B-123.45'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Model</span>
                    <span className="text-sm font-bold text-slate-900">Ford Transit</span>
                </div>
             </div>
          </div>


        </div>
      </div>
    </div>
  );
}
