// // src/pages/driver/DriverDailySchedule.jsx
// import React, { useState, useEffect } from 'react';
// import { Play, Square, Bus, MapPin, Clock } from 'lucide-react';
// import RouteMap from '../../components/maps/RouteMap';

// const ROUTE_STATIONS = [
//   { id: 'st1', name: 'Trạm A - Nguyễn Trãi', position: [10.7628, 106.6602], time: '06:35' },
//   { id: 'st2', name: 'Trạm B - Lê Văn Sỹ', position: [10.7640, 106.6670], time: '06:42' },
//   { id: 'st3', name: 'Trạm C - CMT8', position: [10.7715, 106.6780], time: '06:50' },
//   { id: 'st4', name: 'THPT Lê Quý Đôn', position: [10.7800, 106.6950], time: '07:05' },
// ];

// export default function DriverDailySchedule() {
//   const [isRunning, setIsRunning] = useState(false);
//   const [currentStationIndex, setCurrentStationIndex] = useState(-1);
//   const [statusText, setStatusText] = useState('Chưa bắt đầu chuyến đi');

//   // Animation tự động đến từng trạm (tổng 3 phút)
//   useEffect(() => {
//     if (!isRunning) return;

//     setCurrentStationIndex(0);
//     setStatusText('Đang di chuyển đến trạm đầu tiên...');

//     const events = [
//       { delay: 30000,  msg: 'ĐÃ ĐẾN: Trạm A - Nguyễn Trãi\nBắt đầu đón học sinh...' },
//       { delay: 75000,  msg: 'ĐÃ ĐẾN: Trạm B - Lê Văn Sỹ\nĐón 10 em...' },
//       { delay: 120000, msg: 'ĐÃ ĐẾN: Trạm C - CMT8\nĐón 6 em...' },
//       { delay: 165000, msg: 'ĐÃ ĐẾN: THPT Lê Quý Đôn\nTrả học sinh – HOÀN THÀNH!' },
//     ];

//     events.forEach((event, idx) => {
//       setTimeout(() => {
//         setCurrentStationIndex(idx + 1);
//         setStatusText(`Đang dừng tại: ${ROUTE_STATIONS[idx + 1]?.name || 'Kết thúc'}`);
//         alert(event.msg);
//       }, event.delay);
//     });

//     // Kết thúc chuyến sau 3 phút
//     setTimeout(() => {
//       setIsRunning(false);
//       setStatusText('HOÀN THÀNH CHUYẾN ĐI – Cảm ơn tài xế!');
//       alert('HOÀN THÀNH CHUYẾN ĐI!\nChuyến đi đã kết thúc thành công.');
//     }, 180000);

//   }, [isRunning]);

//   const handleStart = () => {
//     setIsRunning(true);
//     alert('BẮT ĐẦU CHUYẾN ĐI!\nXe buýt đang chạy trên đường thật tại TP.HCM');
//   };

//   const handleStop = () => {
//     setIsRunning(false);
//     setStatusText('Đã dừng chuyến đi');
//     alert('ĐÃ DỪNG CHUYẾN ĐI');
//   };

//   return (
//     <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4">
//       {/* Header đẹp lung linh */}
//       <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-10 text-white shadow-2xl">
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
//           <div>
//             <h1 className="text-5xl font-bold flex items-center gap-5">
//               <Bus className="w-14 h-14" />
//               Lịch trình hôm nay – Tuyến 01
//             </h1>
//             <p className="mt-4 text-2xl opacity-95">
//               28 học sinh • Xe 59A-12345 • Tài xế: Nguyễn Văn A
//             </p>
//           </div>
//           <div className="text-right">
//             <div className="text-6xl font-bold">
//               {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
//             </div>
//             <div className="text-xl opacity-90">
//               {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Nút điều khiển */}
//       <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
//         <div>
//           <h2 className="text-3xl font-bold text-gray-800">Trạng thái chuyến đi</h2>
//           <p className="text-2xl font-semibold text-indigo-600 mt-3">{statusText}</p>
//         </div>

//         {!isRunning ? (
//           <button
//             onClick={handleStart}
//             className="px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-3xl font-bold rounded-2xl hover:from-green-600 hover:to-emerald-700 shadow-2xl flex items-center gap-5 transform hover:scale-110 transition-all duration-300"
//           >
//             <Play className="w-12 h-12" />
//             BẮT ĐẦU CHUYẾN ĐI
//           </button>
//         ) : (
//           <button
//             onClick={handleStop}
//             className="px-12 py-6 bg-gradient-to-r from-red-500 to-rose-600 text-white text-3xl font-bold rounded-2xl hover:from-red-600 hover:to-rose-700 shadow-2xl flex items-center gap-5 transform hover:scale-110 transition-all duration-300"
//           >
//             <Square className="w-12 h-12" />
//             DỪNG LẠI NGAY
//           </button>
//         )}
//       </div>

//       {/* Bản đồ + Tiến độ */}
//       <div className="grid lg:grid-cols-3 gap-10">
//         {/* Bản đồ xe chạy thật */}
//         <div className="lg:col-span-2 space-y-6">
//           <RouteMap
//             center={ROUTE_STATIONS[0].position}
//             stops={ROUTE_STATIONS}
//             zoom={14}
//           />

//           {isRunning && currentStationIndex >= 0 && currentStationIndex < ROUTE_STATIONS.length - 1 && (
//             <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 text-white p-8 rounded-3xl text-center font-bold text-3xl shadow-2xl animate-pulse">
//               SẮP ĐẾN TRẠM
//               <div className="text-4xl mt-3">
//                 {ROUTE_STATIONS[currentStationIndex + 1]?.name}
//               </div>
//               <div className="text-xl mt-2 opacity-90">
//                 Dự kiến: {ROUTE_STATIONS[currentStationIndex + 1]?.time}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Cột tiến độ */}
//         <div className="space-y-8">
//           {/* Trạm hiện tại */}
//           <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-3xl shadow-2xl p-10 text-center">
//             <h3 className="text-3xl font-bold mb-6 flex items-center justify-center gap-4">
//               <MapPin className="w-10 h-10" />
//               Trạm hiện tại
//             </h3>
//             <div className="text-5xl font-bold">
//               {currentStationIndex >= 0 
//                 ? ROUTE_STATIONS[currentStationIndex]?.name || 'Đang đến trường' 
//                 : 'Chưa xuất phát'}
//             </div>
//             <div className="text-2xl mt-4 opacity-90">
//               {currentStationIndex >= 0 ? ROUTE_STATIONS[currentStationIndex]?.time : '--:--'}
//             </div>
//           </div>

//           {/* Danh sách trạm */}
//           <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-gray-100">
//             <h3 className="text-3xl font-bold mb-8 flex items-center gap-4 text-indigo-700">
//               <Clock className="w-10 h-10" />
//               Tiến độ lộ trình
//             </h3>
//             <div className="space-y-6">
//               {ROUTE_STATIONS.map((st, i) => (
//                 <div
//                   key={st.id}
//                   className={`p-6 rounded-2xl border-4 transition-all duration-700 transform ${
//                     i < currentStationIndex
//                       ? 'border-green-500 bg-green-50 scale-105 shadow-xl'
//                       : i === currentStationIndex
//                       ? 'border-blue-600 bg-blue-50 shadow-2xl scale-110 animate-pulse'
//                       : 'border-gray-300 bg-gray-50'
//                   }`}
//                 >
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <div className="text-2xl font-bold text-gray-800">{st.name}</div>
//                       <div className="text-lg text-gray-600 mt-1">{st.time}</div>
//                     </div>
//                     {i === currentStationIndex && (
//                       <div className="text-3xl font-bold text-green-600 animate-bounce">
//                         ĐANG DỪNG
//                       </div>
//                     )}
//                     {i < currentStationIndex && (
//                       <div className="text-2xl">ĐÃ QUA</div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// src/pages/driver/DriverDailySchedule.jsx
import React from 'react';
import { Play, Square, Bus, MapPin, Clock } from 'lucide-react';
import RouteMap from '../../components/maps/RouteMap';
import { useRouteTracking } from '../../context/RouteTrackingContext';

export default function DriverDailySchedule() {
  const { isTracking, currentStationIndex, startTracking, stopTracking, stations } = useRouteTracking();

  const handleToggle = () => {
    isTracking ? stopTracking() : startTracking();
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4">
      {/* Header đẹp lung linh */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-10 text-white shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-5xl font-bold flex items-center gap-5">
              <Bus className="w-14 h-14" />
              Lịch trình hôm nay – Tuyến 01
            </h1>
            <p className="mt-4 text-2xl opacity-95">
              28 học sinh • Xe 59A-12345 • Tài xế: Nguyễn Văn A
            </p>
          </div>
          <div className="text-right">
            <div className="text-6xl font-bold">
              {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xl opacity-90">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Nút điều khiển – GIỮ NGUYÊN */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Trạng thái chuyến đi</h2>
          <p className="text-2xl font-semibold text-indigo-600 mt-3">
            {isTracking ? 'ĐANG DI CHUYỂN' : 'Chưa bắt đầu chuyến đi'}
          </p>
        </div>

        {!isTracking ? (
          <button
            onClick={handleToggle}
            className="px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-3xl font-bold rounded-2xl hover:from-green-600 hover:to-emerald-700 shadow-2xl flex items-center gap-5 transform hover:scale-110 transition-all duration-300"
          >
            <Play className="w-12 h-12" />
            BẮT ĐẦU CHUYẾN ĐI
          </button>
        ) : (
          <button
            onClick={handleToggle}
            className="px-12 py-6 bg-gradient-to-r from-red-500 to-rose-600 text-white text-3xl font-bold rounded-2xl hover:from-red-600 hover:to-rose-700 shadow-2xl flex items-center gap-5 transform hover:scale-110 transition-all duration-300"
          >
            <Square className="w-12 h-12" />
            DỪNG LẠI NGAY
          </button>
        )}
      </div>

      {/* Bản đồ + Tiến độ */}
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <RouteMap stops={stations} isTracking={isTracking} currentStationIndex={currentStationIndex} />

          {isTracking && currentStationIndex >= 0 && currentStationIndex < stations.length - 1 && (
            <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 text-white p-8 rounded-3xl text-center font-bold text-3xl shadow-2xl animate-pulse">
              SẮP ĐẾN TRẠM
              <div className="text-4xl mt-3">{stations[currentStationIndex + 1]?.name}</div>
              <div className="text-xl mt-2 opacity-90">Dự kiến: {stations[currentStationIndex + 1]?.time}</div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-3xl shadow-2xl p-10 text-center">
            <h3 className="text-3xl font-bold mb-6 flex items-center justify-center gap-4">
              <MapPin className="w-10 h-10" />
              Trạm hiện tại
            </h3>
            <div className="text-5xl font-bold">
              {currentStationIndex >= 0 ? stations[currentStationIndex]?.name || 'Đang đến trường' : 'Chưa xuất phát'}
            </div>
            <div className="text-2xl mt-4 opacity-90">
              {currentStationIndex >= 0 ? stations[currentStationIndex]?.time : '--:--'}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-gray-100">
            <h3 className="text-3xl font-bold mb-8 flex items-center gap-4 text-indigo-700">
              <Clock className="w-10 h-10" />
              Tiến độ lộ trình
            </h3>
            <div className="space-y-6">
              {stations.map((st, i) => (
                <div
                  key={st.id}
                  className={`p-6 rounded-2xl border-4 transition-all duration-700 transform ${
                    i < currentStationIndex
                      ? 'border-green-500 bg-green-50 scale-105 shadow-xl'
                      : i === currentStationIndex
                      ? 'border-blue-600 bg-blue-50 shadow-2xl scale-110 animate-pulse'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{st.name}</div>
                      <div className="text-lg text-gray-600 mt-1">{st.time}</div>
                    </div>
                    {i === currentStationIndex && (
                      <div className="text-3xl font-bold text-green-600 animate-bounce">ĐANG DỪNG</div>
                    )}
                    {i < currentStationIndex && <div className="text-2xl">ĐÃ QUA</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}