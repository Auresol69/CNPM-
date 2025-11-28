import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { BusIcon, SpeedIcon, MapIcon, UserIcon, BellIcon, SettingsIcon } from '../../components/parent/Icons';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Mock Data for Fallback
const MOCK_STUDENT = {
  name: "Nguyen Van A",
  class: "5A",
  school: "Primary School District 1",
  route: "Route #12 Morning",
  status: "on-bus" // 'at-home', 'on-bus', 'at-school'
};

// Fix Leaflet Icons
const customBusIcon = L.divIcon({
  className: 'custom-bus-icon',
  html: '<div style="background:#f59e0b; border:2px solid white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-size: 20px;">🚌</div>',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

export default function Dashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Try fetching real data
        try {
            const res = await api.get('/students/my-students');
            const students = res.data.data || res.data;
            if (students && students.length > 0) {
                setStudent(students[0]);
            } else {
                setStudent(MOCK_STUDENT);
            }
        } catch (e) {
            console.warn("API Error, using mock:", e);
            setStudent(MOCK_STUDENT);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
      return <div className="flex items-center justify-center h-full text-slate-400">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6" style={{ height: 'calc(100vh - 80px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500">Overview of your child's journey today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700">System Online</span>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Student Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-6 transition-transform hover:scale-[1.01]">
            <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200">
                    {student?.avatar ? (
                        <img src={student.avatar} alt="Student" className="w-full h-full object-cover" />
                    ) : (
                         <UserIcon className="w-10 h-10" />
                    )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs">★</span>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-900">{student?.name || "Student Name"}</h3>
                <p className="text-sm text-slate-500">{student?.class || "Class 5A"} • {student?.school || "Primary School"}</p>
                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    On Bus - Route #101
                </div>
            </div>
        </div>

        {/* ETA Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg shadow-blue-500/20 text-white transition-transform hover:scale-[1.01]">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-blue-100 font-medium mb-1">Estimated Arrival</p>
                    <h3 className="text-4xl font-bold">14 <span className="text-xl font-normal opacity-80">min</span></h3>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <MapIcon className="w-6 h-6 text-white" />
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-100 bg-black/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Approaching Main St.</span>
            </div>
        </div>

        {/* Speed Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-transform hover:scale-[1.01]">
             <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-500 font-medium mb-1">Current Speed</p>
                    <h3 className="text-4xl font-bold text-slate-900">42 <span className="text-xl text-slate-400 font-normal">km/h</span></h3>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl">
                    <SpeedIcon className="w-6 h-6 text-orange-500" />
                </div>
            </div>
            <div className="mt-6 flex flex-col gap-1">
                 <div className="flex justify-between text-xs text-slate-400">
                    <span>0 km/h</span>
                    <span>60 km/h</span>
                 </div>
                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 w-[60%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                 </div>
            </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Quick Actions & Schedule */}
        <div className="space-y-6 lg:col-span-1 overflow-y-auto pr-2 h-full">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-brand-500 rounded-full"></span>
                    Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => navigate('/parent/tracking')}
                        className="p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 hover:shadow-md transition-all text-sm font-medium flex flex-col items-center gap-2 border border-blue-100"
                    >
                        <MapIcon className="w-6 h-6" /> Live Tracking
                    </button>
                    <button 
                        onClick={() => navigate('/parent/notifications')}
                        className="p-4 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 hover:shadow-md transition-all text-sm font-medium flex flex-col items-center gap-2 border border-orange-100"
                    >
                        <BellIcon className="w-6 h-6" /> Notifications
                    </button>
                    <button 
                        onClick={() => navigate('/parent/profile')}
                        className="p-4 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 hover:shadow-md transition-all text-sm font-medium flex flex-col items-center gap-2 border border-purple-100"
                    >
                        <UserIcon className="w-6 h-6" /> My Profile
                    </button>
                    <button 
                        onClick={() => navigate('/parent/settings')}
                        className="p-4 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 hover:shadow-md transition-all text-sm font-medium flex flex-col items-center gap-2 border border-slate-200"
                    >
                        <SettingsIcon className="w-6 h-6" /> Settings
                    </button>
                </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-fit">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                     <span className="w-1 h-5 bg-brand-500 rounded-full"></span>
                     Today's Schedule
                </h3>
                <div className="space-y-8 relative pl-2">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-[14px] top-3 bottom-3 w-0.5 bg-slate-100"></div>

                    {/* Timeline Item 1 */}
                    <div className="relative flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-100 border-4 border-white z-10 flex items-center justify-center shrink-0 shadow-sm">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        </div>
                        <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="flex justify-between items-start">
                                <p className="text-sm font-bold text-slate-900">Picked Up</p>
                                <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Done</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">06:45 AM • Home Address</p>
                        </div>
                    </div>

                    {/* Timeline Item 2 */}
                    <div className="relative flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 border-4 border-white z-10 flex items-center justify-center shrink-0 shadow-sm">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                        </div>
                        <div className="flex-1 bg-blue-50 p-3 rounded-xl border border-blue-100 shadow-sm">
                            <div className="flex justify-between items-start">
                                <p className="text-sm font-bold text-blue-900">Heading to School</p>
                                <span className="text-xs font-semibold text-blue-600 bg-white px-2 py-0.5 rounded-full">Live</span>
                            </div>
                            <p className="text-xs text-blue-600/80 mt-1">Expected: 07:30 AM</p>
                        </div>
                    </div>

                    {/* Timeline Item 3 */}
                    <div className="relative flex items-start gap-4 opacity-60">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border-4 border-white z-10 flex items-center justify-center shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-900">Afternoon Dropoff</p>
                            <p className="text-xs text-slate-500 mt-1">04:30 PM • Home Address</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Map (Takes 2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative flex flex-col h-full">
            <div className="absolute top-4 left-4 z-[400] bg-white/95 backdrop-blur px-4 py-2 rounded-xl shadow-md border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Live Location</span>
                <span className="text-sm font-bold text-slate-900">District 1, Ho Chi Minh City</span>
            </div>
            <div className="w-full h-full rounded-xl overflow-hidden bg-slate-100">
                <MapContainer center={[10.7769, 106.7009]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer 
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                        attribution='&copy; OpenStreetMap contributors'
                    />
                    <Marker position={[10.7769, 106.7009]} icon={customBusIcon}>
                         <Popup>Bus #12 is here</Popup>
                    </Marker>
                </MapContainer>
            </div>
        </div>

      </div>
    </div>
  );
}