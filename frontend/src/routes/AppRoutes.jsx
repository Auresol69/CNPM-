// src/routes/AppRoutes.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DriverLayout from '../layouts/DriverLayout';

// Pages
const Login = lazy(() => import('../pages/shared/login'));
const NotFound = lazy(() => import('../pages/shared/NotFound'));

const DriverHome = lazy(() => import('../pages/driver/DriverHome'));
const DriverContacts = lazy(() => import('../pages/driver/DriverContacts'));
const DriverDailySchedule = lazy(() => import('../pages/driver/DriverDailySchedule'));
const DriverFeatures = lazy(() => import('../pages/driver/DriverFeatures'));
const DriverOperations = lazy(() => import('../pages/driver/DriverOperations'));

const Loader = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center z-50">
    <div className="text-white text-3xl font-bold animate-pulse">SchoolBus Tracker</div>
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />

        {/* Driver - Dùng layout riêng */}
        <Route element={<DriverLayout />}>
          <Route path="/driver" element={<DriverHome />} />
          <Route path="/driver/contacts" element={<DriverContacts />} />
          <Route path="/driver/daily-schedule" element={<DriverDailySchedule />} />
          <Route path="/driver/features" element={<DriverFeatures />} />
          <Route path="/driver/operations" element={<DriverOperations />} />
        </Route>

        {/* Redirect */}
        <Route path="/" element={<Navigate to="/driver" replace />} />
      </Routes>
    </Suspense>
  );
}
// // src/pages/driver/DriverLiveRoute.jsx
// import React, { useState, useEffect } from 'react';
// import { SAMPLE_ROUTES } from '../data/sampleRoutes'
// import LiveRouteMap from '../components';
// import { Bus, Users, Clock, CheckCircle2 } from 'lucide-react';

// export default function DriverLiveRoute() {  // PHẢI CÓ export default
//   const route = SAMPLE_ROUTES[0];
//   const [currentStopIndex, setCurrentStopIndex] = useState(-1);
//   const [status, setStatus] = useState('Sẵn sàng xuất phát');

//   useEffect(() => {
//     const timeouts = route.stations.map((station, idx) => {
//       return setTimeout(() => {
//         setCurrentStopIndex(idx);
//         setStatus(`ĐÃ ĐẾN: ${station.name}`);
//         alert(`ĐÃ ĐẾN TRẠM: ${station.name}\nĐón ${station.students} học sinh`);

//         setTimeout(() => {
//           if (idx === route.stations.length - 1) {
//             setStatus('HOÀN THÀNH CHUYẾN ĐI');
//           } else {
//             setStatus('Đang di chuyển đến trạm tiếp theo...');
//           }
//         }, 15000); // Dừng 15 giây tại trạm
//       }, idx * 45000); // Mỗi trạm cách 45 giây
//     });

//     return () => timeouts.forEach(clearTimeout);
//   }, [route.stations]);

//   return (
//     <div className="space-y-6 pb-10">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl">
//         <h1 className="text-5xl font-bold flex items-center gap-5 mb-4">
//           <Bus className="w-14 h-14" />
//           {route.name}
//         </h1>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-lg">
//           <div><strong>Tài xế:</strong> {route.driver}</div>
//           <div><strong>Xe:</strong> {route.bus}</div>
//           <div><strong>Học sinh:</strong> {route.totalStudents} em</div>
//           <div><strong>Thời gian:</strong> {route.duration}</div>
//         </div>
//       </div>

//       {/* Trạng thái */}
//       <div className="bg-white rounded-2xl shadow-xl p-6 flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <div className={`w-5 h-5 rounded-full ${currentStopIndex >= 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
//           <div>
//             <div className="text-2xl font-bold">{status}</div>
//             {currentStopIndex >= 0 && route.stations[currentStopIndex] && (
//               <div className="text-lg text-gray-600">
//                 Trạm hiện tại: {route.stations[currentStopIndex].name}
//               </div>
//             )}
//           </div>
//         </div>
//         <div className="text-4xl font-bold text-indigo-600">
//           {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
//         </div>
//       </div>

//       {/* Bản đồ live */}
//       <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-indigo-100">
//         <div className="h-96 md:h-screen max-h-screen">
//           <LiveRouteMap route={route} />
//         </div>
//       </div>

//       {/* Tiến độ trạm */}
//       <div className="bg-white rounded-2xl shadow-xl p-8">
//         <h2 className="text-2xl font-bold mb-6">Tiến độ lộ trình</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           {route.stations.map((s, i) => (
//             <div
//               key={s.id}
//               className={`p-5 rounded-xl text-center border-2 transition-all ${
//                 i < currentStopIndex
//                   ? 'bg-green-100 border-green-500'
//                   : i === currentStopIndex
//                   ? 'bg-blue-100 border-blue-600 shadow-lg scale-105'
//                   : 'bg-gray-50 border-gray-300'
//               }`}
//             >
//               <div className="text-lg font-bold">{s.name}</div>
//               <div className="text-sm text-gray-600">{s.time}</div>
//               {i < currentStopIndex && <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mt-2" />}
//               {i === currentStopIndex && <Bus className="w-8 h-8 text-blue-600 mx-auto mt-2 animate-bounce" />}
//               <div className="text-sm font-medium mt-2">Đón {s.students} em</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }