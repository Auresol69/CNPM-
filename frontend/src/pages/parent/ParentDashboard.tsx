import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/authService';
import { BusIcon, SpeedIcon, MapIcon, UserIcon, BellIcon, SettingsIcon } from '../../components/parent/Icons';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet Icons
const customBusIcon = L.divIcon({
  className: 'custom-bus-icon',
  html: '<div style="background:#f59e0b; border:2px solid white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-size: 20px;">🚌</div>',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

// Fallback mock data for demo purposes
const MOCK_STUDENT = {
  name: "Nguyễn Văn A",
  class: "5A",
  status: "PICKED_UP",
  avatar: "https://i.pravatar.cc/150?img=3",
  school: "Trường Tiểu học Quận 1",
  evidenceUrl: null
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const user = authService.getCurrentUser();
        if (!user || !(user as any)._id) {
          // Use fallback data if no user
          setStudent(MOCK_STUDENT);
          setLoading(false);
          return;
        }
        
        // Fetch student data
        const res = await api.get(`/students?parentId=${(user as any)._id}`);
        const students = res.data.data || res.data;
        if (students && students.length > 0) {
          setStudent(students[0]);
        } else {
          // Use fallback if no students found
          console.warn('No students found, using fallback data for demo');
          setStudent(MOCK_STUDENT);
        }

        // Fetch active trip data
        try {
          const tripRes = await api.get('/trips/my-schedule');
          const trips = tripRes.data.data || tripRes.data || [];
          const activeTrip = trips.find((t: any) => t.status === 'IN_PROGRESS');
          if (activeTrip) {
            setTrip(activeTrip);
          }
        } catch (tripError) {
          console.error("Could not fetch trip data:", tripError);
          // Don't fail the entire dashboard if trip fetch fails
        }
      } catch (e: any) {
        console.error("API Error fetching student data:", e);
        // Use fallback data instead of showing error
        console.warn('Using fallback data for demo');
        setStudent(MOCK_STUDENT);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
      return <div className="flex items-center justify-center h-full text-slate-400">Loading dashboard...</div>;
  }

  // Always show dashboard - we have fallback data if needed
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
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      On Bus - Route #101
                  </div>
                  {student?.evidenceUrl && student?.status === 'PICKED_UP' && (
                    <button
                      onClick={() => {
                        setEvidenceUrl(student.evidenceUrl);
                        setShowPhotoModal(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Xem ảnh check-in
                    </button>
                  )}
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

            {/* Vehicle Info */}
            {trip && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
                  Thông tin xe
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center text-3xl">
                    🚌
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-1">Biển số xe</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {trip.busId?.licensePlate || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Driver Info */}
            {trip && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                  Thông tin tài xế
                </h3>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                    👨‍✈️
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">
                      {trip.driverId?.name || 'Đang cập nhật'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {trip.driverId?.phoneNumber || 'Đang cập nhật'}
                    </p>
                  </div>
                </div>
                {trip.driverId?.phoneNumber && (
                  <a
                    href={`tel:${trip.driverId.phoneNumber}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Gọi ngay
                  </a>
                )}
              </div>
            )}

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

      {/* Photo Modal */}
      {showPhotoModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPhotoModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Ảnh Check-in</h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative">
              <img 
                src={evidenceUrl} 
                alt="Student Check-in Evidence" 
                className="w-full h-auto rounded-xl object-contain max-h-[70vh]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                }}
              />
            </div>
            <p className="text-sm text-slate-500 mt-4 text-center">
              Ảnh chụp khi học sinh lên xe
            </p>
          </div>
        </div>
      )}
    </div>
  );
}