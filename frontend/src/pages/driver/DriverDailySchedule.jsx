// // src/pages/driver/DriverDailySchedule.jsx
// import React, { useCallback } from 'react';
// import {
//   PlayCircle,
//   PauseCircle,
//   Bus,
//   MapPin,
//   Clock,
//   Calendar,
//   CheckCircle,
//   XCircle,
//   Loader2,
// } from 'lucide-react';

// import RouteMap from '../../components/maps/RouteMap';
// import { useRouteTracking } from '../../context/RouteTrackingContext';

// export default function DriverDailySchedule() {
//   // Context theo dõi lộ trình
//   const {
//     isTracking,
//     currentRouteIndex,
//     currentRoute,
//     routesToday,
//     currentStationIndex,
//     currentStation,
//     currentStudents = [],
//     studentCheckIns = {},
//     checkInStudent,
//     stationTimer,
//     isStationActive,
//     startTracking,
//     stopTracking,
//     inTransit, // trạng thái đang di chuyển giữa 2 trạm (optional)
//   } = useRouteTracking();

//   const checkedCount = currentStudents.filter(
//     (s) => studentCheckIns[s.id] === 'present'
//   ).length;
//   const totalAtStation = currentStudents.length;
//   const allChecked = totalAtStation > 0 && checkedCount === totalAtStation;
//   const isCheckingIn = isStationActive && stationTimer > 0;
//   const isWaitingToStartCheckIn = isStationActive && stationTimer === 0;

//   // Xe đang di chuyển khi đã bắt đầu, không ở trạm và không đang check-in
//   const isMoving =
//     isTracking && !isStationActive && !isCheckingIn && !!inTransit;

//   // Safe wrapper để tránh lỗi khi context chưa sẵn sàng
//   const safeCheckIn = useCallback(
//     (studentId, e) => {
//       if (e?.stopPropagation) e.stopPropagation();
//       if (typeof checkInStudent === 'function') {
//         checkInStudent(studentId);
//       } else {
//         console.error('checkInStudent is not available from context');
//       }
//     },
//     [checkInStudent]
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       {/* HEADER + TUYẾN HIỆN TẠI + NÚT BẮT ĐẦU */}
//       <header className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-2xl">
//         <div className="max-w-7xl mx-auto px-3 py-4">
//           <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
//             <div>
//               <h1 className="text-xl font-bold">Lịch trình hôm nay</h1>
//               <p className="text-indigo-100 text-xs mt-0.5">
//                 {new Date().toLocaleDateString('vi-VN', {
//                   weekday: 'long',
//                   day: 'numeric',
//                   month: 'long',
//                 })}
//               </p>
//             </div>

//             <div className="flex items-center gap-4">
//               {/* TUYẾN HIỆN TẠI */}
//               <div className="bg-white/10 backdrop-blur-lg rounded-lg px-3 py-2 text-center">
//                 <div className="flex items-center gap-2">
//                   <MapPin className="w-4 h-4" />
//                   <div>
//                     <div className="font-bold text-xs">TUYẾN</div>
//                     <div className="text-xs opacity-90">
//                       {currentRoute?.name || '—'}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* TRẠNG THÁI XE */}
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

//               {/* NÚT BẮT ĐẦU / DỪNG */}
//               <button
//                 type="button"
//                 onClick={isTracking ? stopTracking : startTracking}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs shadow-lg transition-all transform hover:scale-105 ${
//                   isTracking
//                     ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
//                     : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
//                 }`}
//               >
//                 {isTracking ? (
//                   <>
//                     <PauseCircle className="w-5 h-5" />
//                     DỪNG
//                   </>
//                 ) : (
//                   <>
//                     <PlayCircle className="w-5 h-5" />
//                     BẮT ĐẦU
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-3 py-4">
//         {/* DANH SÁCH TUYẾN TRONG NGÀY */}
//         <div className="bg-white rounded-2xl shadow-xl p-3 mb-4 border-2 border-gray-200">
//           <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
//             <Clock className="w-5 h-5 text-indigo-600" />
//             Tuyến hôm nay
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
//             {routesToday.map((route, idx) => (
//               <div
//                 key={route.id}
//                 className={`p-3 rounded-lg border-2 transition-all ${
//                   idx === currentRouteIndex
//                     ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow scale-105'
//                     : route.status === 'completed'
//                     ? 'bg-gray-200 text-gray-600'
//                     : 'bg-gray-50 border-gray-300 hover:shadow'
//                 }`}
//               >
//                 <div className="flex items-center justify-between mb-1">
//                   <div className="font-bold text-xs">{route.name}</div>
//                   {idx === currentRouteIndex && (
//                     <span className="text-xs bg-white/30 px-2 py-0.5 rounded-full">
//                       Đang chạy
//                     </span>
//                   )}
//                 </div>
//                 <div className="text-xs opacity-90">{route.time}</div>
//                 <div className="text-xs mt-0.5">
//                   {route.totalStudents || route.students || 0} HS
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* BẢN ĐỒ */}
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-3 border-indigo-100 mb-4">
//           <div className="h-80">
//             <RouteMap
//               center={
//                 currentRoute?.stations?.[0]?.position || [10.77, 106.68]
//               }
//               stops={(currentRoute?.stations || []).map((s) => ({
//                 id: s.id,
//                 name: s.name,
//                 position: s.position,
//                 time: s.time,
//               }))}
//               isTracking={isTracking}
//               currentStationIndex={currentStationIndex}
//               isAtStation={isStationActive}
//               isCheckingIn={isCheckingIn}
//               isMoving={isMoving}
//             />
//           </div>
//         </div>

//         {/* CARD CHECK-IN HỌC SINH */}
//         {isTracking &&
//           isStationActive &&
//           currentStationIndex <
//             (currentRoute?.stations?.length || 0) - 1 && (
//             <div
//               className="bg-gradient-to-br from-purple-700 to-pink-700 text-white rounded-2xl shadow-xl p-3 border-4 border-white mb-4 relative z-20"
//               style={{ zIndex: 60 }}
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="text-center mb-3">
//                 <h3 className="text-sm font-bold flex items-center justify-center gap-2">
//                   <Bus className="w-5 h-5 animate-bounce" />
//                   ĐANG TẠI: {currentStation?.name}
//                 </h3>

//                 {isWaitingToStartCheckIn && (
//                   <div className="mt-2 text-sm font-semibold text-yellow-200">
//                     <Loader2 className="w-4 h-4 inline-block animate-spin mr-2" />
//                     Chuẩn bị check-in...
//                   </div>
//                 )}

//                 {isCheckingIn && (
//                   <div
//                     className={`mt-2 text-2xl font-bold ${
//                       stationTimer <= 10
//                         ? 'text-red-300 animate-pulse'
//                         : 'text-yellow-200'
//                     }`}
//                   >
//                     {stationTimer}s
//                   </div>
//                 )}
//               </div>

//               {isCheckingIn && (
//                 <div className="bg-white/20 backdrop-blur rounded-lg p-3 border-3 border-white/40">
//                   <h4 className="text-xs font-bold text-center mb-2">
//                     CHECK-IN ({checkedCount}/{totalAtStation})
//                   </h4>

//                   <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
//                     {currentStudents.map((s) => {
//                       const status = studentCheckIns[s.id];
//                       const already =
//                         status === 'present' || status === 'absent';

//                       return (
//                         <div
//                           key={s.id}
//                           className={`p-2 rounded-lg text-center border-2 transition-all ${
//                             status === 'present'
//                               ? 'bg-green-500 text-white border-green-600'
//                               : status === 'absent'
//                               ? 'bg-red-500 text-white line-through border-red-600'
//                               : 'bg-white/30 border-white hover:bg-white/50'
//                           }`}
//                         >
//                           <div className="font-bold text-xs">{s.name}</div>

//                           {!already && (
//                             <button
//                               type="button"
//                               onClick={(e) => safeCheckIn(s.id, e)}
//                               className="mt-1 bg-yellow-400 hover:bg-yellow-500 text-black text-xs px-2 py-0.5 rounded font-bold shadow hover:scale-110 transition"
//                             >
//                               CÓ
//                             </button>
//                           )}

//                           {status === 'present' && (
//                             <CheckCircle className="w-5 h-5 mx-auto mt-1" />
//                           )}
//                           {status === 'absent' && (
//                             <XCircle className="w-5 h-5 mx-auto mt-1" />
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>

//                   <div className="text-center mt-6 text-lg">
//                     {allChecked && totalAtStation > 0 && (
//                       <div className="text-2xl font-bold text-yellow-200 animate-bounce">
//                         ĐÃ CHECK ĐỦ – XE SẼ CHẠY SAU 3S!
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//         {/* TIẾN ĐỘ TUYẾN HIỆN TẠI */}
//         <div className="bg-white rounded-3xl shadow-2xl p-6 border-2 border-gray-200">
//           <h3 className="text-xl font-bold text-center mb-5 text-indigo-700">
//             Tiến độ: {currentRoute?.name || '—'}
//           </h3>
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//             {(currentRoute?.stations || []).map((s, i) => (
//               <div
//                 key={s.id}
//                 className={`p-4 rounded-xl text-center font-medium transition-all ${
//                   i < currentStationIndex
//                     ? 'bg-green-100 text-green-800'
//                     : i === currentStationIndex
//                     ? 'bg-purple-100 text-purple-800 shadow-lg scale-105'
//                     : 'bg-gray-100'
//                 }`}
//               >
//                 <div className="font-bold text-lg">{i + 1}</div>
//                 <div className="text-xs mt-1">{s.name}</div>
//                 <div className="text-xs opacity-70">{s.time}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// src/pages/driver/DriverDailySchedule.jsx
import React, { useCallback, useState, useEffect } from 'react';
import {
  PlayCircle,
  PauseCircle,
  Bus,
  MapPin,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

import RouteMap from '../../components/maps/RouteMap';
import { useRouteTracking } from '../../context/RouteTrackingContext';
import { getMySchedule } from '../../services/tripService';

export default function DriverDailySchedule() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trips, setTrips] = useState([]); // Danh sách trips từ API
  const [selectedTripIndex, setSelectedTripIndex] = useState(0); // Trip được chọn

  // Context theo dõi lộ trình
  const {
    isTracking,
    currentRouteIndex,
    currentRoute,
    routesToday = [],
    currentStationIndex,
    currentStation,
    currentStudents = [],
    studentCheckIns = {},
    checkInStudent,
    stationTimer,
    isStationActive,
    startTracking,
    stopTracking,
    inTransit,
    initializeTracking, // Hàm init từ context (nếu có)
  } = useRouteTracking();

  // Tính toán trạng thái check-in
  const checkedCount = currentStudents.filter(
    (s) => studentCheckIns[s.id] === 'present'
  ).length;
  const totalAtStation = currentStudents.length;
  const allChecked = totalAtStation > 0 && checkedCount === totalAtStation;
  const isCheckingIn = isStationActive && stationTimer > 0;
  const isWaitingToStartCheckIn = isStationActive && stationTimer === 0;
  const isMoving = isTracking && !isStationActive && !isCheckingIn && !!inTransit;

  // Safe wrapper để tránh lỗi khi context chưa sẵn sàng
  const safeCheckIn = useCallback(
    (studentId, e) => {
      if (e?.stopPropagation) e.stopPropagation();
      if (typeof checkInStudent === 'function') {
        checkInStudent(studentId);
      } else {
        console.error('checkInStudent is not available from context');
      }
    },
    [checkInStudent]
  );

  // Fetch trips từ API getMySchedule
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getMySchedule();
        console.log('[DriverDailySchedule] API response:', data);

        if (Array.isArray(data) && data.length > 0) {
          // Transform backend response sang UI format
          const transformedTrips = data.map((trip, index) => ({
            id: trip._id,
            // Tên route hoặc fallback
            name: trip.routeId?.name || `Chuyến ${index + 1}`,
            // Thời gian từ tripDate
            time: trip.tripDate
              ? new Date(trip.tripDate).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
              })
              : '--:--',
            // Chiều đi
            direction: trip.direction, // 'PICK_UP' | 'DROP_OFF'
            // Trạng thái
            status: trip.status, // 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
            // Số học sinh
            totalStudents: trip.studentStops?.length || 0,
            // Biển số xe
            busLicensePlate: trip.busId?.licensePlate || 'N/A',
            // Raw data để truyền vào context
            rawData: trip,
          }));

          setTrips(transformedTrips);

          // Tự động chọn chuyến đang chạy hoặc chuyến đầu tiên
          const activeIndex = transformedTrips.findIndex(
            t => t.status === 'IN_PROGRESS'
          );
          setSelectedTripIndex(activeIndex >= 0 ? activeIndex : 0);
        } else {
          setTrips([]);
        }
      } catch (err) {
        console.error('[DriverDailySchedule] Lỗi tải lịch trình:', err);
        setError('Không thể tải lịch trình từ server.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  // Chọn trip để xem chi tiết / bắt đầu chạy
  const handleSelectTrip = (index) => {
    setSelectedTripIndex(index);
    const selectedTrip = trips[index];

    // Nếu context có hàm initializeTracking thì gọi
    if (selectedTrip && initializeTracking) {
      initializeTracking(selectedTrip.rawData);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-indigo-700">Đang tải lịch trình...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && trips.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Lỗi tải dữ liệu</h2>
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

  // Không có chuyến nào
  if (trips.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Không có lịch trình</h2>
          <p className="text-gray-600">Hôm nay bạn không có chuyến đi nào được phân công.</p>
        </div>
      </div>
    );
  }

  const selectedTrip = trips[selectedTripIndex];



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* HEADER + TUYẾN HIỆN TẠI + NÚT BẮT ĐẦU */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 py-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold">Lịch trình hôm nay</h1>
              <p className="text-indigo-100 text-xs mt-0.5">
                {new Date().toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* TUYẾN HIỆN TẠI */}
              <div className="bg-white/10 backdrop-blur-lg rounded-lg px-3 py-2 text-center">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <div>
                    <div className="font-bold text-xs">TUYẾN</div>
                    <div className="text-xs opacity-90">
                      {currentRoute?.name || '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* TRẠNG THÁI XE */}
              <div
                className={`px-3 py-2 rounded-lg text-sm font-bold shadow text-white ${isMoving
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

              {/* NÚT BẮT ĐẦU / DỪNG */}
              <button
                type="button"
                onClick={isTracking ? stopTracking : startTracking}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs shadow-lg transition-all transform hover:scale-105 disabled:opacity-70 ${isTracking
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  }`}
              >
                {isTracking ? (
                  <>
                    <PauseCircle className="w-5 h-5" />
                    DỪNG
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-5 h-5" />
                    BẮT ĐẦU
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 py-4">
        {/* DANH SÁCH CHUYẾN ĐI TRONG NGÀY - Từ API */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-4 border-2 border-gray-200">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Chuyến đi hôm nay ({trips.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {trips.map((trip, idx) => (
              <div
                key={trip.id}
                onClick={() => handleSelectTrip(idx)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${idx === selectedTripIndex
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl scale-[1.02]'
                  : trip.status === 'COMPLETED'
                    ? 'bg-gray-100 text-gray-500 border-gray-200'
                    : trip.status === 'IN_PROGRESS'
                      ? 'bg-green-50 border-green-300 hover:border-green-400'
                      : 'bg-white border-gray-200 hover:border-indigo-300'
                  }`}
              >
                {/* Header: Tên tuyến + Direction */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {trip.direction === 'PICK_UP' ? (
                      <ArrowUp className={`w-4 h-4 ${idx === selectedTripIndex ? 'text-green-300' : 'text-green-600'}`} />
                    ) : (
                      <ArrowDown className={`w-4 h-4 ${idx === selectedTripIndex ? 'text-orange-300' : 'text-orange-600'}`} />
                    )}
                    <span className="font-bold text-sm">{trip.name}</span>
                  </div>

                  {/* Status badge */}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${idx === selectedTripIndex
                    ? 'bg-white/30 text-white'
                    : trip.status === 'IN_PROGRESS'
                      ? 'bg-green-200 text-green-800'
                      : trip.status === 'COMPLETED'
                        ? 'bg-gray-200 text-gray-600'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                    {trip.status === 'IN_PROGRESS' ? 'Đang chạy'
                      : trip.status === 'COMPLETED' ? 'Hoàn thành'
                        : trip.status === 'CANCELLED' ? 'Đã hủy'
                          : 'Chờ'}
                  </span>
                </div>

                {/* Info row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{trip.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bus className="w-3 h-3" />
                    <span>{trip.busLicensePlate}</span>
                  </div>
                </div>

                {/* Student count */}
                <div className={`mt-2 text-xs font-medium ${idx === selectedTripIndex ? 'text-indigo-100' : 'text-gray-600'}`}>
                  {trip.direction === 'PICK_UP' ? '🚌 Đón' : '🏠 Trả'} • {trip.totalStudents} học sinh
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BẢN ĐỒ */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-3 border-indigo-100 mb-4">
          <div className="h-80">
            <RouteMap
              center={
                currentRoute?.stations?.[0]?.position || [10.77, 106.68]
              }
              stops={(currentRoute?.stations || []).map((s) => ({
                id: s.id,
                name: s.name,
                position: s.position,
                time: s.time,
              }))}
              isTracking={isTracking}
              currentStationIndex={currentStationIndex}
              isAtStation={isStationActive}
              isCheckingIn={isCheckingIn}
              isMoving={isMoving}
            />
          </div>
        </div>

        {/* CARD CHECK-IN HỌC SINH */}
        {isTracking &&
          isStationActive &&
          currentStationIndex <
          (currentRoute?.stations?.length || 0) - 1 && (
            <div
              className="bg-gradient-to-br from-purple-700 to-pink-700 text-white rounded-2xl shadow-xl p-3 border-4 border-white mb-4 relative z-20"
              style={{ zIndex: 60 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-3">
                <h3 className="text-sm font-bold flex items-center justify-center gap-2">
                  <Bus className="w-5 h-5 animate-bounce" />
                  ĐANG TẠI: {currentStation?.name}
                </h3>

                {isWaitingToStartCheckIn && (
                  <div className="mt-2 text-sm font-semibold text-yellow-200">
                    <Loader2 className="w-4 h-4 inline-block animate-spin mr-2" />
                    Chuẩn bị check-in...
                  </div>
                )}

                {isCheckingIn && (
                  <div
                    className={`mt-2 text-2xl font-bold ${stationTimer <= 10
                      ? 'text-red-300 animate-pulse'
                      : 'text-yellow-200'
                      }`}
                  >
                    {stationTimer}s
                  </div>
                )}
              </div>

              {isCheckingIn && (
                <div className="bg-white/20 backdrop-blur rounded-lg p-3 border-3 border-white/40">
                  <h4 className="text-xs font-bold text-center mb-2">
                    CHECK-IN ({checkedCount}/{totalAtStation})
                  </h4>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {currentStudents.map((s) => {
                      const status = studentCheckIns[s.id];
                      const already =
                        status === 'present' || status === 'absent';

                      return (
                        <div
                          key={s.id}
                          className={`p-2 rounded-lg text-center border-2 transition-all ${status === 'present'
                            ? 'bg-green-500 text-white border-green-600'
                            : status === 'absent'
                              ? 'bg-red-500 text-white line-through border-red-600'
                              : 'bg-white/30 border-white hover:bg-white/50'
                            }`}
                        >
                          <div className="font-bold text-xs">{s.name}</div>

                          {!already && (
                            <button
                              type="button"
                              onClick={(e) => safeCheckIn(s.id, e)}
                              className="mt-1 bg-yellow-400 hover:bg-yellow-500 text-black text-xs px-2 py-0.5 rounded font-bold shadow hover:scale-110 transition"
                            >
                              CÓ
                            </button>
                          )}

                          {status === 'present' && (
                            <CheckCircle className="w-5 h-5 mx-auto mt-1" />
                          )}
                          {status === 'absent' && (
                            <XCircle className="w-5 h-5 mx-auto mt-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-center mt-6 text-lg">
                    {allChecked && totalAtStation > 0 && (
                      <div className="text-2xl font-bold text-yellow-200 animate-bounce">
                        ĐÃ CHECK ĐỦ – XE SẼ CHẠY SAU 3S!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        {/* TIẾN ĐỘ TUYẾN HIỆN TẠI */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 border-2 border-gray-200">
          <h3 className="text-xl font-bold text-center mb-5 text-indigo-700">
            Tiến độ: {currentRoute?.name || selectedTrip?.name || '—'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(currentRoute?.stations || []).map((s, i) => (
              <div
                key={s.id || i}
                className={`p-4 rounded-xl text-center font-medium transition-all ${i < currentStationIndex
                  ? 'bg-green-100 text-green-800'
                  : i === currentStationIndex
                    ? 'bg-purple-100 text-purple-800 shadow-lg scale-105'
                    : 'bg-gray-100'
                  }`}
              >
                <div className="font-bold text-lg">{i + 1}</div>
                <div className="text-xs mt-1">{s.name}</div>
                <div className="text-xs opacity-70">{s.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
