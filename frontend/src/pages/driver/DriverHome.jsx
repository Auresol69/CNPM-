// // src/pages/driver/DriverHome.jsx
// import React from 'react';
// import {
//   MapPin,
//   Users,
//   Bus,
//   PlayCircle,
//   PauseCircle,
//   Timer,
//   UserCheck,
//   CheckCircle,
//   XCircle,
//   Loader2,
//   History,
// } from 'lucide-react';

// import RouteMap from '../../components/maps/RouteMap';
// import FaceIDCheckin from '../../components/driver/FaceIDCheckin';
// import { useRouteTracking } from '../../context/RouteTrackingContext';

// export default function DriverHome() {
//   const {
//     isTracking,
//     currentStationIndex,
//     currentStation,
//     currentRoute,
//     stations = [],
//     currentStudents = [],
//     studentCheckIns = {},
//     checkInStudent = () => {},
//     stationTimer = 0,
//     isStationActive = false,
//     startTracking,
//     stopTracking,
//     lastStoppedState,
//     forceDepart,
//   } = useRouteTracking();

//   // Tính toán trạng thái check-in / di chuyển
//   const checkedCount = currentStudents.filter(s => studentCheckIns[s.id] === 'present').length;
//   const totalAtStation = currentStudents.length;
//   const allChecked = totalAtStation > 0 && checkedCount === totalAtStation; // <-- giờ được sử dụng
//   const isWaitingToStartCheckIn = isStationActive && stationTimer === 0;
//   const isCheckingIn = isStationActive && stationTimer > 0;
//   const isMoving = isTracking && !isStationActive && !isCheckingIn;

//   // Tổng học sinh đã lên xe
//   const totalChecked = Object.values(studentCheckIns).filter(v => v === 'present').length;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
//       {/* HEADER */}
//       <header className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-2xl">
//         <div className="max-w-7xl mx-auto px-5 py-6">
//           <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
//             <div className="text-center sm:text-left">
//               <h1 className="text-2xl md:text-3xl font-bold">Chào buổi sáng, Tài xế!</h1>
//               <p className="text-indigo-100 text-sm mt-1">
//                 {new Date().toLocaleDateString('vi-VN', {
//                   weekday: 'long',
//                   day: 'numeric',
//                   month: 'long'
//                 })}
//               </p>
//             </div>

//             <div className="flex items-center gap-6">
//               {/* TRẠM HIỆN TẠI */}
//               <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-3 text-center">
//                 <div className="flex items-center gap-2 justify-center">
//                   <MapPin className="w-5 h-5" />
//                   <div>
//                     <div className="font-bold text-sm">TRẠM</div>
//                     <div className="text-xs opacity-90">
//                       {currentStation ? currentStation.name : 'Chưa xuất phát'}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* TRẠNG THÁI CHUYỂN ĐỘNG */}
//               <div
//                 className={`px-3 py-2 rounded-lg text-sm font-bold shadow text-white ${
//                   isMoving
//                     ? 'bg-emerald-500'
//                     : isCheckingIn
//                     ? 'bg-yellow-500'
//                     : isTracking
//                     ? 'bg-indigo-500'
//                     : 'bg-gray-500'
//                 }`}
//               >
//                 <div className="flex items-center gap-2">
//                   <Bus className="w-4 h-4" />
//                   <div>
//                     {isMoving
//                       ? 'ĐANG DI CHUYỂN'
//                       : isCheckingIn
//                       ? 'DỪNG CHECK-IN'
//                       : isTracking
//                       ? 'TẠM DỪNG'
//                       : 'CHƯA BẮT ĐẦU'}
//                   </div>
//                 </div>
//               </div>

//               {/* START / STOP */}
//               <button
//                 onClick={isTracking ? stopTracking : startTracking}
//                 className={`flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm shadow-lg transition-all transform hover:scale-105 ${
//                   isTracking
//                     ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
//                     : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
//                 }`}
//               >
//                 {isTracking ? (
//                   <>
//                     <PauseCircle className="w-6 h-6" />
//                     DỪNG
//                   </>
//                 ) : (
//                   <>
//                     <PlayCircle className="w-6 h-6" />
//                     BẮT ĐẦU
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-3 py-4">
//         {/* --- Thống kê nhanh (TRÊN MAP) --- */}
//         <div className="bg-white rounded-2xl shadow-xl p-4 mb-4 border border-gray-200">
//           <div className="flex items-center justify-between mb-3">
//             <h3 className="text-sm font-bold">Thống kê nhanh</h3>
//             <div className="text-xs text-gray-500">{stations.length} trạm</div>
//           </div>

//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//             {/* Tổng HS - DYNAMIC */}
//             <div className="bg-indigo-50 rounded-lg p-3 text-center border border-indigo-100">
//               <Users className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
//               <div className="text-sm font-bold">Tổng HS</div>
//               <div className="text-xl font-semibold">
//                 {currentRoute?.totalStudents || 0}
//               </div>
//             </div>

//             {/* Đã lên */}
//             <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
//               <UserCheck className="w-5 h-5 text-green-600 mx-auto mb-1" />
//               <div className="text-sm font-bold">Đã lên</div>
//               <div className="text-xl font-semibold">{totalChecked}</div>
//             </div>

//             {/* Timer */}
//             <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-100">
//               <Timer className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
//               <div className="text-sm font-bold">Timer</div>
//               <div className="text-xl font-semibold">{isCheckingIn ? stationTimer : '--'}</div>
//             </div>

//             {/* Số trạm */}
//             <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
//               <Bus className="w-5 h-5 text-gray-600 mx-auto mb-1" />
//               <div className="text-sm font-bold">Trạm</div>
//               <div className="text-xl font-semibold">{stations.length}</div>
//             </div>
//           </div>
//         </div>

//         {/* MAP */}
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-3 border-indigo-100 mb-4 relative">
//           <div className="h-80">
//             <RouteMap
//               center={stations[0]?.position || [10.77, 106.68]}
//               stops={stations.map(s => ({
//                 id: s.id,
//                 name: s.name,
//                 position: s.position,
//                 time: s.time,
//               }))}
//               isTracking={isTracking}
//               isCheckingIn={isCheckingIn}
//               isAtStation={isStationActive}
//               isMoving={isMoving}
//               currentStationIndex={currentStationIndex}
//               lastStoppedPosition={lastStoppedState?.position}
//             />
//           </div>
//         </div>

//         {/* LẦN DỪNG GẦN NHẤT => NẰM DƯỚI MAP */}
//         {lastStoppedState && !isTracking && (
//           <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-lg p-3 mb-4 shadow-lg text-center">
//             <div className="flex items-center justify-center gap-2 mb-1">
//               <History className="w-5 h-5 text-amber-700" />
//               <h3 className="text-sm font-bold text-amber-900">Lần dừng gần nhất</h3>
//             </div>
//             <p className="text-sm font-semibold">
//               {lastStoppedState.stationName} • {lastStoppedState.time}
//             </p>
//           </div>
//         )}

//         {/* PHẦN CHECK-IN */}
//         {isTracking && isStationActive && currentStationIndex < stations.length - 1 && (
//           <div className="bg-gradient-to-br from-purple-700 via-pink-600 to-red-600 text-white rounded-2xl shadow-xl p-4 border-4 border-white mb-4">
//             <div className="text-center mb-4">
//               <h3 className="text-base font-bold flex items-center justify-center gap-3">
//                 <Bus className="w-6 h-6 animate-bounce" />
//                 ĐANG TẠI: {currentStation?.name}
//               </h3>

//               {isWaitingToStartCheckIn && (
//                 <div className="mt-2 flex items-center justify-center gap-2 text-lg font-bold text-yellow-300">
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   Chuẩn bị...
//                 </div>
//               )}
//               {isCheckingIn && (
//                 <div className={`mt-2 text-3xl font-bold ${
//                   stationTimer <= 10
//                     ? 'text-red-300 animate-pulse'
//                     : 'text-yellow-200'
//                 }`}>
//                   {stationTimer}s
//                 </div>
//               )}

//               {/* Hiển thị READY khi tất cả đã check */}
//               {allChecked && (
//                 <div className="mt-3 text-yellow-200 text-sm font-bold animate-bounce">
//                   READY! Tất cả HS đã được check-in — xe sẽ rời sau vài giây
//                 </div>
//               )}
//             </div>

//             {isCheckingIn && (
//               <div className="bg-white/20 backdrop-blur rounded-lg p-3 border-3 border-white/40">
//                 <h4 className="text-sm font-bold text-center mb-3">
//                   CHECK-IN ({checkedCount}/{totalAtStation})
//                 </h4>

//                 {totalAtStation === 0 ? (
//                   <div className="text-center py-4 text-xs opacity-80">Trạm trường</div>
//                 ) : (
//                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
//                     {currentStudents.map(student => {
//                       const status = studentCheckIns[student.id];
//                       return (
//                         <div
//                           key={student.id}
//                           className={`p-2 rounded-lg text-center border-2 transition-all ${
//                             status === 'present'
//                               ? 'bg-green-500 text-white border-green-600'
//                               : status === 'absent'
//                               ? 'bg-red-500 text-white line-through border-red-600'
//                               : 'bg-white/30 border-white hover:bg-white/50'
//                           }`}
//                         >
//                           <div className="font-bold text-xs mb-1">{student.name}</div>
//                           <img
//                             src={student.avatar}
//                             alt={student.name}
//                             className="w-8 h-8 rounded-full mx-auto mb-1"
//                           />

//                           {!status && (
//                             <div className="flex flex-col gap-1 mt-1">
//                               <button
//                                 onClick={() => checkInStudent(student.id)}
//                                 className="bg-yellow-400 hover:bg-yellow-500 text-black px-2 py-0.5 rounded text-xs font-bold shadow hover:scale-110 transition"
//                               >
//                                 CÓ
//                               </button>
//                               <FaceIDCheckin
//                                 student={student}
//                                 onCheckIn={checkInStudent}
//                                 isCheckedIn={status === 'present'}
//                               />
//                             </div>
//                           )}

//                           {status === 'present' && (
//                             <CheckCircle className="w-6 h-6 mx-auto mt-1" />
//                           )}
//                           {status === 'absent' && (
//                             <XCircle className="w-6 h-6 mx-auto mt-1" />
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}

//                 {/* RỜI NGAY */}
//                 {forceDepart && (
//                   <div className="text-center mt-2">
//                     <button
//                       onClick={forceDepart}
//                       className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded shadow hover:scale-110 transition"
//                     >
//                       RỜI NGAY
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}

//         {/* DANH SÁCH TRẠM */}
//         <div className="bg-white rounded-2xl shadow-xl p-3 border-2 border-gray-200">
//           <h3 className="text-sm font-bold text-center mb-3">Điểm dừng</h3>
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
//             {stations.map((s, i) => (
//               <div
//                 key={s.id}
//                 className={`p-2 rounded-lg text-center font-medium transition-all ${
//                   i < currentStationIndex
//                     ? 'bg-green-100 text-green-800'
//                     : i === currentStationIndex
//                     ? 'bg-purple-100 text-purple-800 shadow scale-105'
//                     : 'bg-gray-100'
//                 }`}
//               >
//                 <div className="font-bold text-sm">{i + 1}</div>
//                 <div className="text-xs mt-0.5">{s.name}</div>
//                 <div className="text-xs opacity-70">{s.time}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// src/pages/driver/DriverHome.jsx
import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Users,
  Bus,
  PlayCircle,
  PauseCircle,
  Timer,
  UserCheck,
  CheckCircle,
  XCircle,
  Loader2,
  History,
  AlertCircle,
} from 'lucide-react';

import RouteMap from '../../components/maps/RouteMap';
import FaceIDCheckin from '../../components/driver/FaceIDCheckin';
import { useRouteTracking } from '../../context/RouteTrackingContext';
import { getMySchedule } from '../../services/tripService';

export default function DriverHome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    isTracking,
    currentStationIndex,
    currentStation,
    currentRoute,
    stations = [],
    currentStudents = [],
    studentCheckIns = {},
    checkInStudent = () => {},
    markAbsentStudent = () => {},
    stationTimer = 0,
    isStationActive = false,
    startTracking,
    stopTracking,
    lastStoppedState,
    forceDepart,
    // Context sẽ có hàm init nếu bạn dùng (khuyến khích)
    initializeTracking,
  } = useRouteTracking();

  // Tính toán trạng thái
  const checkedCount = currentStudents.filter(s => studentCheckIns[s.id] === 'present').length;
  const totalAtStation = currentStudents.length;
  const allChecked = totalAtStation > 0 && checkedCount === totalAtStation;
  const isWaitingToStartCheckIn = isStationActive && stationTimer === 0;
  const isCheckingIn = isStationActive && stationTimer > 0;
  const isMoving = isTracking && !isStationActive && !isCheckingIn;
  const totalChecked = Object.values(studentCheckIns).filter(v => v === 'present').length;

  // Tự động fetch lịch trình khi vào trang (nếu context chưa có data)
  useEffect(() => {
    const initSchedule = async () => {
      if (stations.length > 0 || currentRoute) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const schedule = await getMySchedule();

        // Tìm chuyến đang chạy hoặc sắp tới nhất
        const now = new Date();
        const activeTrip = schedule.find(trip => 
          trip.status === 'IN_PROGRESS' || 
          (trip.status === 'PENDING' && new Date(trip.tripDate) <= now)
        ) || schedule[0]; // fallback chuyến đầu tiên

        if (activeTrip && initializeTracking) {
          initializeTracking(activeTrip); // context tự xử lý parse stops, students...
        }
      } catch (err) {
        console.error('Không thể tải lịch trình:', err);
        setError('Không thể tải lịch trình. Đang dùng dữ liệu mẫu.');
      } finally {
        setLoading(false);
      }
    };

    initSchedule();
  }, []);

  // Hiển thị loading hoặc lỗi
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-indigo-700">Đang tải lịch trình...</p>
        </div>
      </div>
    );
  }

  if (error && !currentRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Lỗi kết nối</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-8">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-5 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl md:text-3xl font-bold">Chào buổi sáng, Tài xế!</h1>
              <p className="text-indigo-100 text-sm mt-1">
                {new Date().toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* TRẠM HIỆN TẠI */}
              <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-3 text-center">
                <div className="flex items-center gap-2 justify-center">
                  <MapPin className="w-5 h-5" />
                  <div>
                    <div className="font-bold text-sm">TRẠM HIỆN TẠI</div>
                    <div className="text-xs opacity-90">
                      {currentStation ? currentStation.name : 'Chưa xuất phát'}
                    </div>
                  </div>
                </div>
              </div>

              {/* TRẠNG THÁI */}
              <div
                className={`px-4 py-2 rounded-lg text-sm font-bold shadow-lg ${
                  isMoving ? 'bg-emerald-500' :
                  isCheckingIn ? 'bg-yellow-500' :
                  isTracking ? 'bg-indigo-500' : 'bg-gray-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bus className="w-5 h-5" />
                  {isMoving ? 'ĐANG DI CHUYỂN' :
                   isCheckingIn ? 'DỪNG CHECK-IN' :
                   isTracking ? 'TẠM DỪNG' : 'CHƯA BẮT ĐẦU'}
                </div>
              </div>

              {/* NÚT BẮT ĐẦU / DỪNG */}
              <button
                onClick={isTracking ? stopTracking : startTracking}
                disabled={loading}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-lg shadow-2xl transition-all transform hover:scale-105 disabled:opacity-70 ${
                  isTracking
                    ? 'bg-gradient-to-r from-red-500 to-pink-600'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600'
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
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* THỐNG KÊ NHANH */}
        <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Thống kê chuyến đi</h3>
            <span className="text-sm text-gray-500">{stations.length} điểm dừng</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-100">
              <Users className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Tổng học sinh</div>
              <div className="text-2xl font-bold text-indigo-700">
                {currentRoute?.totalStudents || 0}
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
              <UserCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Đã lên xe</div>
              <div className="text-2xl font-bold text-green-700">{totalChecked}</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-100">
              <Timer className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Thời gian dừng</div>
              <div className="text-2xl font-bold text-yellow-700">
                {isCheckingIn ? `${stationTimer}s` : '--'}
              </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
              <Bus className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Trạm hiện tại</div>
              <div className="text-2xl font-bold text-purple-700">
                {currentStationIndex + 1}/{stations.length}
              </div>
            </div>
          </div>
        </div>

        {/* BẢN ĐỒ */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-indigo-100">
          <div className="h-96">
            <RouteMap
              center={stations[0]?.position || [10.7623, 106.7056]}
              stops={stations.map(s => ({
                id: s.id,
                name: s.name,
                position: s.position,
                time: s.time,
              }))}
              isTracking={isTracking}
              isCheckingIn={isCheckingIn}
              isAtStation={isStationActive}
              isMoving={isMoving}
              currentStationIndex={currentStationIndex}
              lastStoppedPosition={lastStoppedState?.position}
            />
          </div>
        </div>

        {/* LẦN DỪNG GẦN NHẤT */}
        {lastStoppedState && !isTracking && (
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-400 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-center gap-3">
              <History className="w-6 h-6 text-amber-700" />
              <div>
                <span className="font-bold text-amber-900">Dừng gần nhất:</span>
                <span className="ml-2 font-semibold">
                  {lastStoppedState.stationName} • {lastStoppedState.time}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* CHECK-IN PANEL */}
        {isTracking && isStationActive && currentStationIndex < stations.length - 1 && (
          <div className="bg-gradient-to-br from-purple-700 via-pink-600 to-red-600 text-white rounded-3xl shadow-2xl p-6 border-4 border-white">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold flex items-center justify-center gap-4">
                <Bus className="w-10 h-10 animate-bounce" />
                ĐANG DỪNG TẠI: {currentStation?.name?.toUpperCase()}
              </h3>

              {isWaitingToStartCheckIn && (
                <div className="mt-4 flex items-center justify-center gap-3 text-2xl font-bold text-yellow-300">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  Chuẩn bị check-in...
                </div>
              )}

              {isCheckingIn && (
                <div className={`mt-4 text-5xl font-bold ${stationTimer <= 10 ? 'text-red-300 animate-pulse' : 'text-yellow-200'}`}>
                  {stationTimer}s
                </div>
              )}

              {allChecked && (
                <div className="mt-4 text-2xl font-bold text-yellow-200 animate-bounce">
                  READY! Xe sẽ rời trạm trong giây lát
                </div>
              )}
            </div>

            {isCheckingIn && (
              <div className="bg-white/25 backdrop-blur-md rounded-2xl p-5 border-4 border-white/50">
                <h4 className="text-xl font-bold text-center mb-4">
                  CHECK-IN ({checkedCount}/{totalAtStation})
                </h4>

                {totalAtStation === 0 ? (
                  <p className="text-center py-8 text-lg opacity-90">Trạm trường - Không có học sinh</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {currentStudents.map(student => {
                      const status = studentCheckIns[student.id];
                      return (
                        <div
                          key={student.id}
                          className={`p-4 rounded-2xl text-center border-4 transition-all transform hover:scale-105 ${
                            status === 'present'
                              ? 'bg-green-600 border-green-400 shadow-lg'
                              : status === 'absent'
                              ? 'bg-red-600 border-red-400 line-through'
                              : 'bg-white/40 border-white hover:bg-white/60'
                          }`}
                        >
                          <p className="font-bold text-sm mb-2">{student.name}</p>
                          <img
                            src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`}
                            alt={student.name}
                            className="w-16 h-16 rounded-full mx-auto mb-3 shadow-lg"
                          />

                          {!status && (
                            <div className="space-y-2">
                              <button
                                onClick={() => checkInStudent(student.id)}
                                className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg text-sm shadow-lg"
                              >
                                CÓ MẶT
                              </button>
                              <FaceIDCheckin
                                student={student}
                                onCheckIn={checkInStudent}
                                isCheckedIn={false}
                              />
                              <button
                                onClick={() => markAbsentStudent?.(student.id)}
                                className="w-full py-1 text-xs bg-red-500 hover:bg-red-600 rounded"
                              >
                                Vắng
                              </button>
                            </div>
                          )}

                          {status === 'present' && <CheckCircle className="w-10 h-10 mx-auto mt-3" />}
                          {status === 'absent' && <XCircle className="w-10 h-10 mx-auto mt-3" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {forceDepart && (
                  <div className="text-center mt-6">
                    <button
                      onClick={forceDepart}
                      className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-full shadow-2xl hover:scale-110 transition"
                    >
                      RỜI TRẠM NGAY
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* DANH SÁCH TRẠM */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 border-4 border-gray-200">
          <h3 className="text-xl font-bold text-center mb-6 text-gray-800">Lộ trình hôm nay</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stations.map((s, i) => (
              <div
                key={s.id}
                className={`p-5 rounded-2xl text-center font-bold transition-all shadow-md ${
                  i < currentStationIndex
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                    : i === currentStationIndex
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white scale-110 shadow-2xl'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <div className="text-2xl mb-1">{i + 1}</div>
                <div className="text-sm">{s.name}</div>
                <div className="text-xs opacity-80 mt-1">{s.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}