// // src/pages/driver/DriverHome.jsx
// import React, { useState } from 'react';
// import { MapPin, Phone, Users, Bus, Bell, Clock, AlertCircle, CheckCircle } from 'lucide-react';
// import RouteMap from '../../components/maps/RouteMap';
// import { useRouteTracking } from '../../context/RouteTrackingContext';

// const vehicles = [
//   { id: 'v1', name: 'Bus 59A-12345', plate: '59A-12345', status: 'online' },
// ];

// const notificationsSample = [
//   { id: 'n1', title: 'Lộ trình sáng thay đổi', time: '07:45', body: 'Do tắc đường Nguyễn Trãi, đi đường vòng qua Lê Văn Sỹ', urgent: true },
//   { id: 'n2', title: 'Nhắc xuất phát', time: '06:20', body: 'Chuyến sáng - Tuyến 1 sắp đến giờ', urgent: false },
// ];

// const contactsSample = [
//   { id: 'c1', name: 'Cô Lan (Mẹ bé An)', phone: '0901234567', relation: 'Mẹ', student: 'An' },
//   { id: 'c2', name: 'Chú Hùng (Bố bé Bình)', phone: '0912223334', relation: 'Bố', student: 'Bình' },
//   { id: 'c3', name: 'Cô Mai (Mẹ bé Cường)', phone: '0938555666', relation: 'Mẹ', student: 'Cường' },
// ];

// export default function DriverHome() {
//   const [selectedVehicle] = useState(vehicles[0]);
//   const { isTracking, currentStationIndex, stations, startTracking, stopTracking } = useRouteTracking();

//   const currentStation = stations[currentStationIndex];
//   const currentIndex = currentStationIndex;

//   // Số học sinh đã đón: mỗi trạm đón 7-10 em (giả lập)
//   const pickedUpStudents = currentIndex >= 0 ? currentIndex * 8 + (currentIndex > 0 ? 4 : 0) : 0;

//   return (
//     <div className="min-h-screen bg-gray-50 pb-8">
//       {/* HEADER GIỐNG HỆT BẢN GỐC – KHÔNG FIXED */}
//       <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
//         <div className="px-4 py-5">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold">Chào buổi sáng, Tài xế Nam!</h1>
//               <p className="text-indigo-100">
//                 Hôm nay: {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
//               </p>
//             </div>
//             <div className="text-right">
//               <div className="flex items-center gap-2">
//                 <Bus className="w-8 h-8" />
//                 <div>
//                   <div className="font-semibold">{selectedVehicle.name}</div>
//                   <div className="text-sm opacity-90">
//                     Trạng thái:{' '}
//                     <span className="text-green-300">
//                       ● Đang hoạt động
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-4 -mt-4">
//         {/* QUICK STATS – CẬP NHẬT CHÍNH XÁC */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white rounded-xl shadow p-4 text-center">
//             <Users className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
//             <div className="text-2xl font-bold">28</div>
//             <div className="text-xs text-gray-500">Học sinh hôm nay</div>
//           </div>

//           <div className="bg-white rounded-xl shadow p-4 text-center">
//             <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
//             <div className="text-2xl font-bold text-green-600">{pickedUpStudents}</div>
//             <div className="text-xs text-gray-500">Đã đón</div>
//           </div>

//           <div className="bg-white rounded-xl shadow p-4 text-center">
//             <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
//             <div className="text-2xl font-bold">
//               {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
//             </div>
//             <div className="text-xs text-gray-500">Giờ hiện tại</div>
//           </div>

//           <div className="bg-white rounded-xl shadow p-4 text-center">
//             <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
//             <div className="text-2xl font-bold">0</div>
//             <div className="text-xs text-gray-500">Sự cố cần xử lý</div>
//           </div>
//         </div>

//         <div className="grid lg:grid-cols-3 gap-6">
//           {/* CỘT TRÁI: BẢN ĐỒ + DANH SÁCH TRẠM */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Bản đồ + Nút điều khiển */}
//             <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//               <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 flex items-center justify-between">
//                 <h3 className="font-bold text-lg flex items-center gap-2">
//                   <MapPin className="w-5 h-5" /> Lộ trình hiện tại - Sáng Tuyến 01
//                 </h3>

//                 <div className="flex items-center gap-3">
//                   <div className="text-sm text-white/90">
//                     Trạm hiện tại: <strong>{currentStation?.name || '—'}</strong>
//                   </div>

//                   <button
//                     onClick={isTracking ? stopTracking : startTracking}
//                     className={`px-4 py-2 rounded font-bold transition ${
//                       isTracking 
//                         ? 'bg-red-600 hover:bg-red-700' 
//                         : 'bg-green-600 hover:bg-green-700'
//                     }`}
//                   >
//                     {isTracking ? 'DỪNG THEO DÕI' : 'BẮT ĐẦU'}
//                   </button>
//                 </div>
//               </div>

//               {/* BẢN ĐỒ – KHÔNG BỊ ĐÈ HEADER */}
//               <div className="h-96">
//                 <RouteMap
//                   center={stations[0]?.position || [10.77, 106.68]}
//                   stops={stations.map(s => ({
//                     id: s.id,
//                     name: s.name,
//                     position: s.position,
//                     time: s.time
//                   }))}
//                   isTracking={isTracking}
//                   currentStationIndex={currentStationIndex}
//                 />
//               </div>
//             </div>

//             {/* Danh sách trạm – giữ nguyên đẹp như cũ */}
//             <div className="bg-white rounded-xl shadow-lg p-5">
//               <h3 className="font-bold text-lg mb-4">Các điểm dừng hôm nay</h3>
//               <div className="space-y-3">
//                 {stations.map((stop, idx) => (
//                   <div
//                     key={stop.id}
//                     className={`flex items-center justify-between p-3 rounded-lg border ${
//                       idx < currentIndex
//                         ? 'bg-green-50 border-green-300'
//                         : idx === currentIndex
//                         ? 'bg-indigo-50 border-indigo-400'
//                         : 'bg-gray-50 border-gray-300'
//                     }`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
//                         idx < currentIndex ? 'bg-green-600' : idx === currentIndex ? 'bg-indigo-600' : 'bg-gray-400'
//                       }`}>
//                         {idx + 1}
//                       </div>
//                       <div>
//                         <div className="font-medium">{stop.name}</div>
//                         <div className="text-xs text-gray-500">Dự kiến: {stop.time}</div>
//                       </div>
//                     </div>

//                     <div className="text-sm font-medium">
//                       {idx === currentIndex && 'ĐANG DỪNG'}
//                       {idx < currentIndex && 'ĐÃ QUA'}
//                       {idx > currentIndex && 'CHƯA TỚI'}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* CỘT PHẢI – GIỮ NGUYÊN NHƯ BẢN GỐC */}
//           <div className="space-y-6">
//             {/* Thông báo */}
//             <div className="bg-white rounded-xl shadow-lg p-5">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="font-bold text-lg flex items-center gap-2">
//                   <Bell className="w-5 h-5" /> Thông báo
//                 </h3>
//                 <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
//                   {notificationsSample.length} mới
//                 </span>
//               </div>
//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {notificationsSample.map(n => (
//                   <div key={n.id} className={`p-3 rounded-lg border ${n.urgent ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
//                     <div className="font-medium text-sm">{n.title}</div>
//                     <div className="text-xs text-gray-500 mt-1">{n.time} • {n.body}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Danh bạ nhanh */}
//             <div className="bg-white rounded-xl shadow-lg p-5">
//               <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
//                 <Phone className="w-5 h-5" /> Danh bạ nhanh
//               </h3>
//               <div className="space-y-3">
//                 {contactsSample.map(c => (
//                   <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                     <div>
//                       <div className="font-medium text-sm">{c.name}</div>
//                       <div className="text-xs text-gray-500">{c.relation} của {c.student}</div>
//                     </div>
//                     <a href={`tel:${c.phone}`} className="bg-green-600 text-white p-3 rounded-full">
//                       <Phone className="w-4 h-4" />
//                     </a>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Ghi chú */}
//             <div className="bg-white rounded-xl shadow-lg p-5">
//               <h3 className="font-semibold mb-2">Ghi chú</h3>
//               <p className="text-xs text-gray-500">
//                 Xe chỉ chạy khi nhấn "BẮT ĐẦU"<br />
//                 Hệ thống đang hoạt động ổn định
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// src/pages/driver/DriverHome.jsx
import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Users,
  Bus,
  Bell,
  Clock,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  History,
} from 'lucide-react';

import RouteMap from '../../components/maps/RouteMap';
import { useRouteTracking } from '../../context/RouteTrackingContext';

const vehicles = [
  { id: 'v1', name: 'Bus 59A-12345', plate: '59A-12345', status: 'online' },
];

const notificationsSample = [
  {
    id: 'n1',
    title: 'Lộ trình sáng thay đổi',
    time: '07:45',
    body: 'Do tắc đường Nguyễn Trãi, đi đường vòng qua Lê Văn Sỹ',
    urgent: true,
  },
  {
    id: 'n2',
    title: 'Nhắc xuất phát',
    time: '06:20',
    body: 'Chuyến sáng - Tuyến 1 sắp đến giờ',
    urgent: false,
  },
];

const contactsSample = [
  { id: 'c1', name: 'Cô Lan (Mẹ bé An)', phone: '0901234567', relation: 'Mẹ', student: 'An' },
  { id: 'c2', name: 'Chú Hùng (Bố bé Bình)', phone: '0912223334', relation: 'Bố', student: 'Bình' },
  { id: 'c3', name: 'Cô Mai (Mẹ bé Cường)', phone: '0938555666', relation: 'Mẹ', student: 'Cường' },
];

export default function DriverHome() {
  const [selectedVehicle] = useState(vehicles[0]);

  const {
    isTracking,
    currentStationIndex,
    stations,
    startTracking,
    stopTracking,
    lastStoppedState,
  } = useRouteTracking();

  const currentStation = stations[currentStationIndex];

  // Tính số học sinh đã đón
  const pickedUpStudents = currentStationIndex >= 0 ? currentStationIndex * 8 + 4 : 0;

  // Hiệu ứng âm thanh khi đến trạm mới (tùy chọn)
  useEffect(() => {
    if (currentStationIndex > 0 && isTracking) {
      // const audio = new Audio('/notification.mp3');
      // audio.play().catch(() => {});
    }
  }, [currentStationIndex, isTracking]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Chào buổi sáng, Tài xế Nam!</h1>
              <p className="text-indigo-100 text-lg mt-1">
                {new Date().toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-4">
                <Bus className="w-12 h-12 animate-pulse" />
                <div>
                  <div className="font-bold text-xl">{selectedVehicle.name}</div>
                  <div className="text-sm opacity-90 flex items-center gap-2 mt-1">
                    <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                    ĐANG HOẠT ĐỘNG
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 -mt-6">
        {/* LỊCH SỬ DỪNG GẦN NHẤT */}
        {lastStoppedState && !isTracking && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-2xl p-5 mb-6 shadow-xl animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <History className="w-8 h-8 text-amber-600" />
              <h3 className="text-xl font-bold text-amber-900">LẦN DỪNG GẦN NHẤT</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Trạm dừng:</strong> {lastStoppedState.stationName}
              </div>
              <div>
                <strong>Thời gian:</strong> {lastStoppedState.time}
              </div>
              <div>
                <strong>Đã đón:</strong> {lastStoppedState.pickedUpStudents} học sinh
              </div>
              <div className="text-amber-700 font-bold">Đã lưu dữ liệu</div>
            </div>
          </div>
        )}

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center border border-gray-100 hover:scale-105 transition">
            <Users className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
            <div className="text-4xl font-bold text-gray-800">28</div>
            <div className="text-sm text-gray-500 mt-1">Tổng học sinh</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 text-center border-2 border-green-300">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <div className="text-4xl font-bold text-green-700">{pickedUpStudents}</div>
            <div className="text-sm text-gray-600 mt-1">Đã đón</div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 text-center border border-gray-100">
            <Clock className="w-12 h-12 text-orange-600 mx-auto mb-3" />
            <div className="text-4xl font-bold text-gray-800">
              {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm text-gray-500 mt-1">Giờ hiện tại</div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 text-center border border-gray-100">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <div className="text-4xl font-bold text-red-600">0</div>
            <div className="text-sm text-gray-500 mt-1">Sự cố</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI: BẢN ĐỒ + DANH SÁCH TRẠM */}
          <div className="lg:col-span-2 space-y-8">
            {/* BẢN ĐỒ */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-indigo-100">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <MapPin className="w-8 h-8" />
                    LỘ TRÌNH SÁNG - TUYẾN 01
                  </h3>
                  <p className="text-indigo-100 mt-2 text-lg">
                    Trạm hiện tại:{' '}
                    <strong className="text-yellow-300">
                      {currentStation?.name || 'Chưa xuất phát'}
                    </strong>
                  </p>
                </div>

                <button
                  onClick={isTracking ? stopTracking : startTracking}
                  className={`px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl transition-all transform hover:scale-110 flex items-center gap-4 ${
                    isTracking
                      ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isTracking ? (
                    <>
                      <PauseCircle className="w-8 h-8" />
                      DỪNG CHUYẾN
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-8 h-8" />
                      BẮT ĐẦU
                    </>
                  )}
                </button>
              </div>

              <div className="h-96">
                <RouteMap
                  center={stations[0]?.position || [10.77, 106.68]}
                  stops={stations.map((s) => ({
                    id: s.id,
                    name: s.name,
                    position: s.position,
                    time: s.time,
                  }))}
                  isTracking={isTracking}
                  currentStationIndex={currentStationIndex}
                />
              </div>
            </div>

            {/* DANH SÁCH TRẠM */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                <MapPin className="w-8 h-8 text-indigo-600" />
                Các điểm dừng hôm nay
              </h3>

              <div className="space-y-5">
                {stations.map((stop, idx) => (
                  <div
                    key={stop.id}
                    className={`flex items-center justify-between p-6 rounded-3xl border-4 transition-all transform ${
                      idx < currentStationIndex
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 shadow-2xl scale-105'
                        : idx === currentStationIndex
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-purple-600 shadow-2xl scale-110 animate-pulse'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-xl ${
                          idx < currentStationIndex
                            ? 'bg-green-600'
                            : idx === currentStationIndex
                            ? 'bg-purple-600 animate-bounce'
                            : 'bg-gray-400'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-800">{stop.name}</div>
                        <div className="text-lg text-gray-600">Dự kiến: {stop.time}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      {idx === currentStationIndex && (
                        <div className="text-3xl font-bold text-purple-600 animate-bounce">
                          ĐANG DỪNG
                        </div>
                      )}
                      {idx < currentStationIndex && (
                        <div className="text-2xl font-bold text-green-600">ĐÃ QUA</div>
                      )}
                      {idx > currentStationIndex && (
                        <div className="text-gray-500 text-xl">Chưa tới</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className="space-y-8">
            {/* THÔNG BÁO */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <Bell className="w-8 h-8 text-red-600 animate-pulse" />
                  Thông báo mới
                </h3>
                <span className="bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold animate-bounce">
                  {notificationsSample.length}
                </span>
              </div>
              <div className="space-y-4">
                {notificationsSample.map((n) => (
                  <div
                    key={n.id}
                    className={`p-5 rounded-2xl border-2 ${
                      n.urgent ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="font-bold text-lg">{n.title}</div>
                    <div className="text-sm text-gray-600 mt-2">
                      {n.time} • {n.body}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DANH BẠ PHỤ HUYNH */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-200">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Phone className="w-8 h-8 text-green-600" />
                Danh bạ phụ huynh
              </h3>
              <div className="space-y-4">
                {contactsSample.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-300"
                  >
                    <div>
                      <div className="font-bold text-lg">{c.name}</div>
                      <div className="text-sm text-gray-600">
                        {c.relation} bé {c.student}
                      </div>
                    </div>
                    <a
                      href={`tel:${c.phone}`}
                      className="bg-green-600 hover:bg-green-700 text-white p-5 rounded-full shadow-2xl transition transform hover:scale-125"
                    >
                      <Phone className="w-8 h-8" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* GHI CHÚ HỆ THỐNG */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold mb-4">Hệ thống thông minh</h3>
              <ul className="space-y-3 text-lg opacity-95">
                <li>• Xe chỉ chạy khi nhấn BẮT ĐẦU</li>
                <li>• Tự động dừng 10 giây mỗi trạm</li>
                <li>• Lưu lại điểm dừng khi thoát</li>
                <li>• Đường đi thật từ OSRM</li>
                <li>• Thông minh như Grab/Be</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}