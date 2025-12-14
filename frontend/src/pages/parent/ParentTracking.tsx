import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../../services/api';
import useSocket from '../../hooks/useSocket';
import 'leaflet/dist/leaflet.css';

// --- Types ---
interface Coordinate {
  lat: number;
  lng: number;
}

interface Trip {
    _id: string;
    status: string;
    direction?: string;
    busId: string | {
        _id: string;
        licensePlate: string;
    };
    driverId: string | {
        _id?: string;
        name: string;
        phoneNumber: string;
    };
    routeId?: {
        _id: string;
        name: string;
        distanceMeters?: number;
        durationSeconds?: number;
        orderedStops?: any[];
        shape?: {
            coordinates: number[][];
        };
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
  order?: number;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
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

// Default location (HCM center) when no data
const DEFAULT_LOCATION: Coordinate = { lat: 10.7769, lng: 106.7009 };

export default function Tracking() {
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [stops, setStops] = useState<Stop[]>([]);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [busLocation, setBusLocation] = useState<Coordinate>(DEFAULT_LOCATION);
  
  // Snackbar State for notifications
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Socket
  const socket = useSocket();

  // Helper function to extract station coordinates
  const extractStationData = (station: any, idx: number): Stop | null => {
    if (!station) return null;
    const coords = station.address?.location?.coordinates;
    const latitude = coords?.[1] || station.latitude;
    const longitude = coords?.[0] || station.longitude;
    if (!latitude || !longitude) return null;
    return {
      stopId: {
        _id: station._id,
        name: station.name || `Trạm ${idx + 1}`,
        latitude,
        longitude,
      },
      arrivalTime: station.arrivalTime || '',
      order: idx
    };
  };

  // 1. Initial Setup: Fetch Trip with route and stops
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        
        const tripsRes = await api.get('/trips');
        const allTrips = tripsRes.data.data || tripsRes.data || [];
        console.log('🚌 ParentTracking: All Trips:', allTrips.length);

        const trip = allTrips.find((t: any) => t.status === 'IN_PROGRESS') ||
                     allTrips.find((t: any) => t.status === 'NOT_STARTED') ||
                     allTrips[0];

        if (!trip) {
          console.warn('⚠️ No trips found');
          setLoading(false);
          return;
        }

        console.log('📦 Fetching trip details:', trip._id);
        const response = await api.get(`/trips/${trip._id}`);
        const tripData = response.data.data || response.data;
        
        if (tripData) {
          console.log('✅ Trip loaded:', tripData._id, 'Status:', tripData.status);
          setActiveTrip(tripData);
          
          const routeShape = tripData.routeId?.shape?.coordinates;
          if (routeShape && Array.isArray(routeShape) && routeShape.length > 0) {
            const shape = routeShape.map((c: number[]) => [c[1], c[0]] as [number, number]);
            console.log('✅ Route shape loaded:', shape.length, 'points');
            setRoutePath(shape);
            setBusLocation({ lat: shape[0][0], lng: shape[0][1] });
          } else {
            const routeIdStr = typeof tripData.routeId === 'string' 
              ? tripData.routeId 
              : tripData.routeId?._id;
            
            if (routeIdStr) {
              try {
                console.log('🔗 Fetching route directly:', routeIdStr);
                const routeRes = await api.get(`/routes/${routeIdStr}`);
                const routeData = routeRes.data.data || routeRes.data;
                if (routeData?.shape?.coordinates?.length > 0) {
                  const shape = routeData.shape.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
                  setRoutePath(shape);
                  setBusLocation({ lat: shape[0][0], lng: shape[0][1] });
                  console.log('✅ Route loaded from /routes');
                }
              } catch (e) {
                console.warn('⚠️ Could not fetch route shape');
              }
            }
          }

          const orderedStops = tripData.routeId?.orderedStops;
          if (orderedStops && Array.isArray(orderedStops) && orderedStops.length > 0) {
            const stopsData: Stop[] = [];
            orderedStops.forEach((station: any, idx: number) => {
              const stopData = extractStationData(station, idx);
              if (stopData) stopsData.push(stopData);
            });
            setStops(stopsData);
            console.log('✅ Stops loaded:', stopsData.length);
          }
        }
      } catch (error) {
        console.error('❌ Trip fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrip();
  }, []);

  // 2. Socket Logic - Real-time location updates & ALL notifications
  useEffect(() => {
    if (!socket) {
      console.warn('⚠️ Socket not ready');
      return;
    }

    const tripId = activeTrip?._id;
    if (!tripId) return;

    socket.emit('join_trip_room', tripId);
    console.log(`📡 Joined trip room: ${tripId}`);

    // 1. BUS LOCATION CHANGED
    const handleLocationUpdate = (data: any) => {
      console.log("✅ bus:location_changed:", data);
      const lat = data.latitude || data.lat || data.coords?.latitude;
      const lng = data.longitude || data.lng || data.coords?.longitude;
      if (lat && lng) {
        setBusLocation({ lat, lng });
      }
    };

    // 2. TRIP COMPLETED
    const handleTripCompleted = (data: any) => {
      console.log('🏁 trip:completed:', data);
      setActiveTrip((prev: Trip | null) => prev ? { ...prev, status: 'COMPLETED' } : null);
      setSnackbar({ open: true, message: '🏁 Chuyến xe đã hoàn thành!', severity: 'success' });
    };

    // 3. STUDENTS MARKED ABSENT - Backend sends: { stationId, count }
    const handleStudentAbsent = (data: any) => {
      console.log("❌ trip:students_marked_absent:", data);
      const { count } = data; // stationId also available
      setSnackbar({ 
        open: true, 
        message: `❌ ${count || 'Một số'} học sinh được đánh dấu vắng mặt`, 
        severity: 'error' 
      });
    };

    // 4. STUDENT CHECKED IN - Backend sends: { studentId, action, evidenceUrl }
    const handleStudentCheckedIn = (data: any) => {
      console.log("✅ student:checked_in:", data);
      const { action } = data; // studentId, evidenceUrl also available
      // action can be: 'PICKED_UP', 'DROPPED_OFF', etc.
      const actionText = action === 'PICKED_UP' ? 'đã lên xe' : action === 'DROPPED_OFF' ? 'đã xuống xe' : 'đã check-in';
      setSnackbar({ open: true, message: `✅ Học sinh ${actionText} an toàn!`, severity: 'success' });
    };

    // 5. BUS APPROACHING STATION - Backend sends: { stationId, message }
    const handleApproachingStation = (data: any) => {
      console.log("🚌 bus:approaching_station:", data);
      const { message } = data; // stationId also available
      setSnackbar({ 
        open: true, 
        message: message || `🚌 Xe sắp đến trạm`, 
        severity: 'info' 
      });
    };

    // 6. BUS ARRIVED AT STATION - Backend sends: { stationId, arrivalTime }
    const handleArrivedStation = (data: any) => {
      console.log("📍 bus:arrived_at_station:", data);
      // Backend sends: { stationId, arrivalTime }
      setSnackbar({ 
        open: true, 
        message: `📍 Xe đã đến trạm`, 
        severity: 'info' 
      });
    };

    // 7. BUS DEPARTED FROM STATION - Backend sends: { stationId, departureTime }
    const handleDepartedStation = (data: any) => {
      console.log("🚀 bus:departed_from_station:", data);
      // Backend sends: { stationId, departureTime }
      setSnackbar({ 
        open: true, 
        message: `🚀 Xe đã rời trạm`, 
        severity: 'info' 
      });
    };

    // 8. ALERT NEW (SOS, LATE, OFF_ROUTE)
    const handleAlertNew = (data: any) => {
      console.log("🚨 alert:new:", data);
      const { type, message } = data;
      
      let alertMessage = message || 'Cảnh báo mới';
      let severity: 'error' | 'warning' | 'info' = 'warning';
      
      switch (type) {
        case 'SOS':
          alertMessage = `🆘 KHẨN CẤP: ${message || 'Tài xế bấm nút SOS!'}`;
          severity = 'error';
          break;
        case 'OFF_ROUTE':
          alertMessage = `⚠️ Xe đi lệch tuyến đường!`;
          severity = 'warning';
          break;
        case 'LATE':
          alertMessage = `⏰ Xe bị trễ giờ dự kiến`;
          severity = 'warning';
          break;
        default:
          alertMessage = `⚠️ ${message || 'Có cảnh báo mới'}`;
      }
      
      setSnackbar({ open: true, message: alertMessage, severity });
    };

    // Handle reconnection
    const handleReconnect = () => {
      console.log('🔄 Reconnected, rejoining room...');
      socket.emit('join_trip_room', tripId);
    };

    // Register ALL event listeners
    socket.on('bus:location_changed', handleLocationUpdate);
    socket.on('trip:completed', handleTripCompleted);
    socket.on('trip:students_marked_absent', handleStudentAbsent);
    socket.on('student:checked_in', handleStudentCheckedIn);
    socket.on('bus:approaching_station', handleApproachingStation);
    socket.on('bus:arrived_at_station', handleArrivedStation);
    socket.on('bus:departed_from_station', handleDepartedStation);
    socket.on('alert:new', handleAlertNew);
    socket.on('reconnect', handleReconnect);

    return () => {
      socket.off('bus:location_changed', handleLocationUpdate);
      socket.off('trip:completed', handleTripCompleted);
      socket.off('trip:students_marked_absent', handleStudentAbsent);
      socket.off('student:checked_in', handleStudentCheckedIn);
      socket.off('bus:approaching_station', handleApproachingStation);
      socket.off('bus:arrived_at_station', handleArrivedStation);
      socket.off('bus:departed_from_station', handleDepartedStation);
      socket.off('alert:new', handleAlertNew);
      socket.off('reconnect', handleReconnect);
    };
  }, [socket, activeTrip?._id]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Đang tải Live Tracking...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] lg:h-[calc(100vh-60px)] gap-4">
      {/* Snackbar Notification */}
      {snackbar.open && (
        <div 
          className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 max-w-sm animate-pulse ${
            snackbar.severity === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            snackbar.severity === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            snackbar.severity === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <span className="font-medium text-sm">{snackbar.message}</span>
          <button 
            onClick={() => setSnackbar(prev => ({ ...prev, open: false }))}
            className="text-lg font-bold opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {activeTrip ? `Bus ${typeof activeTrip.busId === 'object' ? activeTrip.busId?.licensePlate : '51B-123.45'}` : 'Bus 51B-123.45'}
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-slate-500 font-medium">Live Tracking</span>
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
            
            <RecenterMap lat={busLocation.lat} lng={busLocation.lng} />

            {routePath.length > 0 && (
              <Polyline positions={routePath} color="#f97316" weight={6} opacity={0.8} />
            )}

            <Marker position={[busLocation.lat, busLocation.lng]} icon={busIcon}>
              <Popup>
                <div className="p-2 text-center">
                  <p className="font-bold text-slate-900">
                    {typeof activeTrip?.busId === 'object' ? activeTrip.busId?.licensePlate : '51B-123.45'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {activeTrip?.status === 'IN_PROGRESS' ? '🚌 Đang chạy' : 
                     activeTrip?.status === 'COMPLETED' ? '✅ Hoàn thành' : '⏳ Chờ xuất phát'}
                  </p>
                </div>
              </Popup>
            </Marker>

            {stops.map((stop, index) => (
              <Marker 
                key={stop.stopId._id || index}
                position={[stop.stopId.latitude, stop.stopId.longitude]} 
                icon={stopIcon}
              >
                <Popup>
                  <div className="p-2">
                    <p className="font-bold text-slate-900 text-sm">{stop.stopId.name}</p>
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
              {activeTrip?.routeId?.name || 'Chưa có lộ trình'}
            </p>
            {routePath.length > 0 && (
              <p className="text-xs text-green-600 mt-1">✓ {routePath.length} điểm trên tuyến</p>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-full lg:w-80 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-6 overflow-y-auto">
          
          {/* Route Info */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tuyến đường</h3>
            <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
              <p className="font-bold text-orange-800 text-sm">
                {activeTrip?.routeId?.name || 'Chưa có thông tin'}
              </p>
              <div className="flex gap-4 mt-2 text-xs text-orange-600">
                {activeTrip?.routeId?.distanceMeters && (
                  <span>📏 {(activeTrip.routeId.distanceMeters / 1000).toFixed(1)} km</span>
                )}
                {activeTrip?.routeId?.durationSeconds && (
                  <span>⏱️ {Math.round(activeTrip.routeId.durationSeconds / 60)} phút</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {stops.length > 0 ? `${stops.length} trạm dừng` : 'Chưa có trạm'}
              </p>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full"></div>

          {/* Driver Info */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tài xế</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">👨‍✈️</div>
              <div>
                <p className="font-bold text-slate-900">
                  {typeof activeTrip?.driverId === 'object' ? activeTrip.driverId?.name : 'Nguyễn Văn Tài'}
                </p>
                <p className="text-sm text-slate-500">
                  {typeof activeTrip?.driverId === 'object' ? activeTrip.driverId?.phoneNumber : '0909 123 456'}
                </p>
              </div>
            </div>
            {typeof activeTrip?.driverId === 'object' && activeTrip.driverId?.phoneNumber && (
              <a
                href={`tel:${activeTrip.driverId.phoneNumber}`}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors text-sm"
              >
                📞 Gọi tài xế
              </a>
            )}
          </div>

          <div className="h-px bg-slate-100 w-full"></div>

          {/* Vehicle Info */}
          <div>
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Xe buýt</h3>
             <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Biển số</span>
                    <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      {typeof activeTrip?.busId === 'object' ? activeTrip.busId?.licensePlate : '51B-123.45'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Trạng thái</span>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                      activeTrip?.status === 'IN_PROGRESS' ? 'text-green-700 bg-green-100' :
                      activeTrip?.status === 'NOT_STARTED' ? 'text-yellow-700 bg-yellow-100' :
                      activeTrip?.status === 'COMPLETED' ? 'text-blue-700 bg-blue-100' :
                      'text-slate-700 bg-slate-100'
                    }`}>
                      {activeTrip?.status === 'IN_PROGRESS' ? '🚌 Đang chạy' :
                       activeTrip?.status === 'NOT_STARTED' ? '⏳ Chưa bắt đầu' :
                       activeTrip?.status === 'COMPLETED' ? '✅ Hoàn thành' :
                       activeTrip?.status || 'N/A'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Hướng</span>
                    <span className="text-sm font-bold text-slate-900">
                      {activeTrip?.direction === 'PICK_UP' ? '🏫 Đón học sinh' :
                       activeTrip?.direction === 'DROP_OFF' ? '🏠 Trả học sinh' :
                       activeTrip?.direction || 'N/A'}
                    </span>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
