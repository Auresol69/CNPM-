import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import api from '../../services/api';
import { BusIcon } from '../../components/parent/Icons';

// --- Types & Interfaces ---
interface Coordinate {
  lat: number;
  lng: number;
}

// --- Icons ---
const busIcon = L.divIcon({
  className: 'custom-bus-icon',
  html: '<div class="relative flex items-center justify-center w-10 h-10 bg-brand-500 text-white rounded-full border-2 border-white shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="17" cy="18" r="2"/></svg><span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span></span></div>',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

// Mock Route
const DEFAULT_ROUTE: Coordinate[] = [
  { lat: 10.7769, lng: 106.7009 },
  { lat: 10.7780, lng: 106.7020 },
  { lat: 10.7800, lng: 106.7035 },
  { lat: 10.7820, lng: 106.7050 },
  { lat: 10.7850, lng: 106.7080 }
];

export default function Tracking() {
  const [routePath, setRoutePath] = useState<Coordinate[]>(DEFAULT_ROUTE);
  const [busLocation, setBusLocation] = useState<Coordinate>(DEFAULT_ROUTE[0]);
  const [driverInfo, setDriverInfo] = useState({ name: "Nguyen Van Tai", phone: "0901234567" });
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  // Fetch Route
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const response = await api.get('/routes');
        // Adapt based on API response structure
        const data = response.data.data || response.data;
        if (data && data.length > 0) {
            // Assuming first route
            // Map backend structure to {lat, lng}
            // Implementation depends on specific API response shape
        }
      } catch (err) {
        console.warn("Using mock route data");
      }
    };
    fetchRoute();
  }, []);

  // Simulation Logic
  useEffect(() => {
    let interval: any;
    if (isSimulationRunning) {
      let index = 0;
      interval = setInterval(() => {
        setBusLocation(routePath[index]);
        index = (index + 1) % routePath.length;
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSimulationRunning, routePath]);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] lg:h-[calc(100vh-60px)] gap-4">
      {/* Controls / Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div>
            <h2 className="text-lg font-bold text-slate-900">Live Tracking</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>Signal Strong</span>
            </div>
        </div>
        <button 
            onClick={() => setIsSimulationRunning(!isSimulationRunning)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isSimulationRunning ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-brand-50 text-brand-600 hover:bg-brand-100'}`}
        >
            {isSimulationRunning ? 'Stop Demo' : 'Start Simulation'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative z-0">
             <MapContainer 
                center={[busLocation.lat, busLocation.lng]} 
                zoom={15} 
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Polyline positions={routePath.map(p => [p.lat, p.lng])} color="#3b82f6" weight={5} opacity={0.7} />
                <Marker position={[busLocation.lat, busLocation.lng]} icon={busIcon}>
                    <Popup>
                        <div className="p-1">
                            <p className="font-bold">Bus #12</p>
                            <p className="text-xs text-slate-500">Speed: 45km/h</p>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>

        {/* Info Sidebar */}
        <div className="w-full lg:w-80 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-6 overflow-y-auto">
            {/* Driver */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Driver Information</h3>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                         <span className="text-xl">👨‍✈️</span>
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">{driverInfo.name}</p>
                        <p className="text-sm text-slate-500">Exp: 5 Years</p>
                    </div>
                </div>
                <button className="w-full mt-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                    Call Driver
                </button>
            </div>

            <div className="h-px bg-slate-100 w-full"></div>

            {/* Bus Info */}
             <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Vehicle Details</h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Plate Number</span>
                        <span className="text-sm font-bold text-slate-900">51B-123.45</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Bus Model</span>
                        <span className="text-sm font-bold text-slate-900">Ford Transit</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Capacity</span>
                        <span className="text-sm font-bold text-slate-900">16 Seats</span>
                    </div>
                </div>
            </div>

            <div className="h-px bg-slate-100 w-full"></div>

            {/* Next Stop */}
            <div className="bg-slate-50 p-4 rounded-xl">
                 <p className="text-xs text-slate-400 mb-1">NEXT STOP</p>
                 <p className="font-bold text-slate-900 text-lg">Nguyen Hue Street</p>
                 <p className="text-brand-600 text-sm font-medium mt-1">~ 5 mins away</p>
            </div>
        </div>
      </div>
    </div>
  );
}