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
//   const allChecked = totalAtStation > 0 && checkedCount === totalAtStation;
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
import React from 'react';
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
} from 'lucide-react';

import RouteMap from '../../components/maps/RouteMap';
import FaceIDCheckin from '../../components/driver/FaceIDCheckin';
import { useRouteTracking } from '../../context/RouteTrackingContext';

export default function DriverHome() {
  const {
    isTracking,
    currentStationIndex,
    currentStation,
    currentRoute,
    stations = [],
    currentStudents = [],
    studentCheckIns = {},
    checkInStudent = () => {},
    stationTimer = 0,
    isStationActive = false,
    startTracking,
    stopTracking,
    lastStoppedState,
    forceDepart,
  } = useRouteTracking();

  // Tính toán trạng thái check-in / di chuyển
  const checkedCount = currentStudents.filter(s => studentCheckIns[s.id] === 'present').length;
  const totalAtStation = currentStudents.length;
  const allChecked = totalAtStation > 0 && checkedCount === totalAtStation; // <-- giờ được sử dụng
  const isWaitingToStartCheckIn = isStationActive && stationTimer === 0;
  const isCheckingIn = isStationActive && stationTimer > 0;
  const isMoving = isTracking && !isStationActive && !isCheckingIn;

  // Tổng học sinh đã lên xe
  const totalChecked = Object.values(studentCheckIns).filter(v => v === 'present').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
                  month: 'long'
                })}
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* TRẠM HIỆN TẠI */}
              <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-3 text-center">
                <div className="flex items-center gap-2 justify-center">
                  <MapPin className="w-5 h-5" />
                  <div>
                    <div className="font-bold text-sm">TRẠM</div>
                    <div className="text-xs opacity-90">
                      {currentStation ? currentStation.name : 'Chưa xuất phát'}
                    </div>
                  </div>
                </div>
              </div>

              {/* TRẠNG THÁI CHUYỂN ĐỘNG */}
              <div
                className={`px-3 py-2 rounded-lg text-sm font-bold shadow text-white ${
                  isMoving
                    ? 'bg-emerald-500'
                    : isCheckingIn
                    ? 'bg-yellow-500'
                    : isTracking
                    ? 'bg-indigo-500'
                    : 'bg-gray-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bus className="w-4 h-4" />
                  <div>
                    {isMoving
                      ? 'ĐANG DI CHUYỂN'
                      : isCheckingIn
                      ? 'DỪNG CHECK-IN'
                      : isTracking
                      ? 'TẠM DỪNG'
                      : 'CHƯA BẮT ĐẦU'}
                  </div>
                </div>
              </div>

              {/* START / STOP */}
              <button
                onClick={isTracking ? stopTracking : startTracking}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm shadow-lg transition-all transform hover:scale-105 ${
                  isTracking
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                }`}
              >
                {isTracking ? (
                  <>
                    <PauseCircle className="w-6 h-6" />
                    DỪNG
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-6 h-6" />
                    BẮT ĐẦU
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 py-4">
        {/* --- Thống kê nhanh (TRÊN MAP) --- */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold">Thống kê nhanh</h3>
            <div className="text-xs text-gray-500">{stations.length} trạm</div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Tổng HS - DYNAMIC */}
            <div className="bg-indigo-50 rounded-lg p-3 text-center border border-indigo-100">
              <Users className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <div className="text-sm font-bold">Tổng HS</div>
              <div className="text-xl font-semibold">
                {currentRoute?.totalStudents || 0}
              </div>
            </div>

            {/* Đã lên */}
            <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
              <UserCheck className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <div className="text-sm font-bold">Đã lên</div>
              <div className="text-xl font-semibold">{totalChecked}</div>
            </div>

            {/* Timer */}
            <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-100">
              <Timer className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
              <div className="text-sm font-bold">Timer</div>
              <div className="text-xl font-semibold">{isCheckingIn ? stationTimer : '--'}</div>
            </div>

            {/* Số trạm */}
            <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
              <Bus className="w-5 h-5 text-gray-600 mx-auto mb-1" />
              <div className="text-sm font-bold">Trạm</div>
              <div className="text-xl font-semibold">{stations.length}</div>
            </div>
          </div>
        </div>

        {/* MAP */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-3 border-indigo-100 mb-4 relative">
          <div className="h-80">
            <RouteMap
              center={stations[0]?.position || [10.77, 106.68]}
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

        {/* LẦN DỪNG GẦN NHẤT => NẰM DƯỚI MAP */}
        {lastStoppedState && !isTracking && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-lg p-3 mb-4 shadow-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <History className="w-5 h-5 text-amber-700" />
              <h3 className="text-sm font-bold text-amber-900">Lần dừng gần nhất</h3>
            </div>
            <p className="text-sm font-semibold">
              {lastStoppedState.stationName} • {lastStoppedState.time}
            </p>
          </div>
        )}

        {/* PHẦN CHECK-IN */}
        {isTracking && isStationActive && currentStationIndex < stations.length - 1 && (
          <div className="bg-gradient-to-br from-purple-700 via-pink-600 to-red-600 text-white rounded-2xl shadow-xl p-4 border-4 border-white mb-4">
            <div className="text-center mb-4">
              <h3 className="text-base font-bold flex items-center justify-center gap-3">
                <Bus className="w-6 h-6 animate-bounce" />
                ĐANG TẠI: {currentStation?.name}
              </h3>

              {isWaitingToStartCheckIn && (
                <div className="mt-2 flex items-center justify-center gap-2 text-lg font-bold text-yellow-300">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Chuẩn bị...
                </div>
              )}
              {isCheckingIn && (
                <div className={`mt-2 text-3xl font-bold ${
                  stationTimer <= 10
                    ? 'text-red-300 animate-pulse'
                    : 'text-yellow-200'
                }`}>
                  {stationTimer}s
                </div>
              )}

              {/* Hiển thị READY khi tất cả đã check */}
              {allChecked && (
                <div className="mt-3 text-yellow-200 text-sm font-bold animate-bounce">
                  READY! Tất cả HS đã được check-in — xe sẽ rời sau vài giây
                </div>
              )}
            </div>

            {isCheckingIn && (
              <div className="bg-white/20 backdrop-blur rounded-lg p-3 border-3 border-white/40">
                <h4 className="text-sm font-bold text-center mb-3">
                  CHECK-IN ({checkedCount}/{totalAtStation})
                </h4>

                {totalAtStation === 0 ? (
                  <div className="text-center py-4 text-xs opacity-80">Trạm trường</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {currentStudents.map(student => {
                      const status = studentCheckIns[student.id];
                      return (
                        <div
                          key={student.id}
                          className={`p-2 rounded-lg text-center border-2 transition-all ${
                            status === 'present'
                              ? 'bg-green-500 text-white border-green-600'
                              : status === 'absent'
                              ? 'bg-red-500 text-white line-through border-red-600'
                              : 'bg-white/30 border-white hover:bg-white/50'
                          }`}
                        >
                          <div className="font-bold text-xs mb-1">{student.name}</div>
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-8 h-8 rounded-full mx-auto mb-1"
                          />

                          {!status && (
                            <div className="flex flex-col gap-1 mt-1">
                              <button
                                onClick={() => checkInStudent(student.id)}
                                className="bg-yellow-400 hover:bg-yellow-500 text-black px-2 py-0.5 rounded text-xs font-bold shadow hover:scale-110 transition"
                              >
                                CÓ
                              </button>
                              <FaceIDCheckin
                                student={student}
                                onCheckIn={checkInStudent}
                                isCheckedIn={status === 'present'}
                              />
                            </div>
                          )}

                          {status === 'present' && (
                            <CheckCircle className="w-6 h-6 mx-auto mt-1" />
                          )}
                          {status === 'absent' && (
                            <XCircle className="w-6 h-6 mx-auto mt-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* RỜI NGAY */}
                {forceDepart && (
                  <div className="text-center mt-2">
                    <button
                      onClick={forceDepart}
                      className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded shadow hover:scale-110 transition"
                    >
                      RỜI NGAY
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* DANH SÁCH TRẠM */}
        <div className="bg-white rounded-2xl shadow-xl p-3 border-2 border-gray-200">
          <h3 className="text-sm font-bold text-center mb-3">Điểm dừng</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {stations.map((s, i) => (
              <div
                key={s.id}
                className={`p-2 rounded-lg text-center font-medium transition-all ${
                  i < currentStationIndex
                    ? 'bg-green-100 text-green-800'
                    : i === currentStationIndex
                    ? 'bg-purple-100 text-purple-800 shadow scale-105'
                    : 'bg-gray-100'
                }`}
              >
                <div className="font-bold text-sm">{i + 1}</div>
                <div className="text-xs mt-0.5">{s.name}</div>
                <div className="text-xs opacity-70">{s.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
