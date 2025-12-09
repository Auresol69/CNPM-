// // src/pages/driver/DriverOperations.jsx
// import React, { useState, useEffect } from 'react';
// import { 
//   AlertTriangle, Phone, MessageCircle,
//   Siren, MapPin, Clock, Users, X, Bus, Loader2
// } from 'lucide-react';
// import { useRouteTracking } from '../../context/RouteTrackingContext';
// import { useAuth } from '../../hooks/useAuth';
// import { getMySchedule } from '../../services/tripService';

// const quickMessages = [
//   "Xe đang đến trạm đón",
//   "Xe bị trễ 10 phút do kẹt xe",
//   "Học sinh đã lên xe an toàn",
//   "Xe đã đến trường",
//   "Có mưa lớn, xe đi chậm",
//   "Xe đang di chuyển bình thường",
// ];

// const incidentTypes = [
//   { id: 'traffic',    label: 'Kẹt xe',          icon: AlertTriangle },
//   { id: 'breakdown',  label: 'Hỏng xe',         icon: Siren },
//   { id: 'accident',   label: 'Tai nạn',         icon: AlertTriangle },
//   { id: 'weather',    label: 'Thời tiết xấu',   icon: MapPin },
//   { id: 'other',      label: 'Khác',            icon: MessageCircle },
// ];

// export default function DriverOperations() {
//   const { user } = useAuth();
//   const {
//     currentStation,
//     currentRoute,
//     routesToday = [],
//     allStudentsForContact = [],
//     studentCheckIns = {},
//   } = useRouteTracking();

//   const [loading, setLoading] = useState(true);
//   const [showIncidentModal, setShowIncidentModal] = useState(false);
//   const [selectedIncident, setSelectedIncident] = useState('');
//   const [incidentNote, setIncidentNote] = useState('');

//   // Tự động tải lịch trình nếu context chưa có dữ liệu
//   useEffect(() => {
//     const loadScheduleIfNeeded = async () => {
//       if (routesToday.length > 0 || currentRoute) {
//         setLoading(false);
//         return;
//       }
//       try {
//         setLoading(true);
//         const schedule = await getMySchedule();
//         // Context sẽ tự cập nhật nếu bạn có hàm init trong context
//         // (nếu không có thì vẫn dùng mock fallback → UI vẫn đẹp)
//       } catch (err) {
//         console.warn('Không thể tải lịch trình ở Operations → dùng dữ liệu mock');
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadScheduleIfNeeded();
//   }, []);

//   // Helper: lưu tin nhắn + broadcast
//   const pushChatMessage = (threadId, msgObj) => {
//     try {
//       const KEY = 'chat_messages';
//       const raw = localStorage.getItem(KEY);
//       let store = raw ? JSON.parse(raw) : {};
//       if (!store[threadId]) store[threadId] = [];
      
//       if (!store[threadId].some(m => m.id === msgObj.id)) {
//         store[threadId].push(msgObj);
//         localStorage.setItem(KEY, JSON.stringify(store));
//       }
//       window.dispatchEvent(new CustomEvent('chat_message', { 
//         detail: { threadId, message: msgObj } 
//       }));
//     } catch (e) {
//       console.error('Lỗi lưu tin nhắn:', e);
//     }
//   };

//   const nowTime = () => new Date().toTimeString().slice(0, 5);

//   // Báo sự cố
//   const handleSendIncident = () => {
//     if (!selectedIncident) return;
//     const typeLabel = incidentTypes.find(t => t.id === selectedIncident)?.label || 'Không xác định';
//     const text = `BÁO CÁO SỰ CỐ: ${typeLabel} — ${incidentNote || 'Không ghi chú'}`;
//     const location = currentStation?.name ? ` (Tại: ${currentStation.name})` : '';
    
//     const msg = { 
//       id: Date.now(), 
//       sender: 'driver', 
//       text: text + location, 
//       time: nowTime(),
//       type: 'incident'
//     };

//     pushChatMessage('admin', msg);
    
//     // Gửi luôn cho phụ huynh nếu đang trong chuyến
//     if (currentRoute && allStudentsForContact.length > 0) {
//       const parents = allStudentsForContact.slice(0, 5); // giới hạn để không spam
//       parents.forEach(p => {
//         pushChatMessage(`parent-${p.id}`, { 
//           ...msg, 
//           text: `[Cảnh báo] ${text} — Xe đang gặp sự cố, vui lòng theo dõi.` 
//         });
//       });
//     }

//     alert(`ĐÃ GỬI BÁO CÁO: ${typeLabel}\n${incidentNote || 'Không có ghi chú'}`);
//     setShowIncidentModal(false);
//     setSelectedIncident('');
//     setIncidentNote('');
//   };

//   // Tin nhắn nhanh → gửi cho tất cả phụ huynh trong tuyến hiện tại
//   const handleQuickMessage = (msg) => {
//     if (!currentRoute) {
//       alert('Chưa có tuyến hiện tại để gửi tin.');
//       return;
//     }

//     const studentsInRoute = allStudentsForContact.filter(s => 
//       currentRoute.stations?.some(st => st.id === s.stop)
//     );

//     if (studentsInRoute.length === 0) {
//       alert('Không tìm thấy phụ huynh trong tuyến này.');
//       return;
//     }

//     const now = nowTime();
//     let sentCount = 0;

//     studentsInRoute.forEach(student => {
//       const threadId = `parent-${student.id}`;
//       const messageObj = { 
//         id: Date.now() + Math.random(), 
//         sender: 'driver', 
//         text: `[Tin nhanh] ${msg}`, 
//         time: now 
//       };
//       pushChatMessage(threadId, messageObj);
//       sentCount++;
//     });

//     // Ghi log vào admin
//     pushChatMessage('admin', { 
//       id: Date.now() + 999, 
//       sender: 'driver', 
//       text: `Đã gửi tin nhanh: "${msg}" → ${sentCount} phụ huynh`, 
//       time: now 
//     });

//     alert(`ĐÃ GỬI TIN NHANH\n"${msg}"\n→ ${sentCount} phụ huynh`);
//   };

//   // Gọi khẩn cấp
//   const handleEmergencyCall = () => {
//     if (!confirm('Gọi khẩn cấp đến quản lý và lực lượng cứu hộ?')) return;

//     const msg = { 
//       id: Date.now(), 
//       sender: 'driver', 
//       text: 'TÀI XẾ GỌI KHẨN CẤP — CẦN HỖ TRỢ NGAY!', 
//       time: nowTime(),
//       type: 'emergency'
//     };
//     pushChatMessage('admin', msg);

//     // Gửi cảnh báo cho tất cả phụ huynh
//     allStudentsForContact.forEach(s => {
//       pushChatMessage(`parent-${s.id}`, { 
//         ...msg, 
//         text: '[CẢNH BÁO KHẨN] Xe buýt đang gặp sự cố nghiêm trọng!' 
//       });
//     });

//     alert('ĐÃ GỌI KHẨN CẤP!\nQuản lý và cứu hộ đang được thông báo...');
//   };

//   // Thống kê theo tuyến
//   const statsByRoute = routesToday.map(route => {
//     const students = allStudentsForContact.filter(s => 
//       route.stations?.some(st => st.id === s.stop)
//     );
//     const total = students.length;
//     const onboard = students.filter(s => studentCheckIns[s.id] === 'present').length;
//     const absent = students.filter(s => studentCheckIns[s.id] === 'absent').length;
//     const waiting = total - onboard - absent;

//     return {
//       id: route.id || route._id,
//       name: route.name || route.routeId?.name || 'Chưa đặt tên',
//       time: route.time || route.startTime || '--:--',
//       total,
//       onboard,
//       absent,
//       waiting,
//     };
//   });

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
//           <p className="text-lg font-medium text-indigo-700">Đang tải dữ liệu...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 pb-20">
//       <div className="max-w-6xl mx-auto space-y-6">

//         {/* Header đẹp như cũ */}
//         <header className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-2xl">
//           <div className="flex flex-col md:flex-row items-start justify-between gap-6">
//             <div>
//               <h1 className="text-3xl font-bold flex items-center gap-4">
//                 <Bus className="w-10 h-10" /> Thao tác nhanh
//               </h1>
//               <p className="text-lg opacity-90 mt-2">Tài xế: <strong>{user?.name || 'Tài xế'}</strong></p>
//               <p className="text-base opacity-80 mt-1 flex items-center gap-2">
//                 <MapPin className="w-5 h-5" /> 
//                 Trạm hiện tại: <strong>{currentStation?.name || 'Chưa xuất phát'}</strong>
//               </p>
//             </div>

//             <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-right">
//               <div className="text-sm opacity-90">Tuyến hiện tại</div>
//               <div className="text-xl font-bold mt-1">
//                 {currentRoute ? currentRoute.name || 'Đang chạy' : 'Chưa có tuyến'}
//               </div>
//               <div className="text-sm mt-1 opacity-90">
//                 {currentRoute?.time || '--:--'}
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Bảng thống kê – giữ nguyên đẹp */}
//         <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
//           <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
//             <Users className="w-7 h-7 text-indigo-600" /> Thống kê học sinh theo tuyến
//           </h2>
//           <div className="overflow-x-auto rounded-lg border">
//             <table className="w-full text-sm">
//               <thead className="bg-gradient-to-r from-indigo-100 to-purple-100">
//                 <tr>
//                   <th className="px-5 py-3 text-left font-bold">Tuyến</th>
//                   <th className="px-5 py-3 text-left font-bold">Giờ</th>
//                   <th className="px-5 py-3 text-center font-bold">Tổng</th>
//                   <th className="px-5 py-3 text-center font-bold text-green-700">Lên xe</th>
//                   <th className="px-5 py-3 text-center font-bold text-red-700">Vắng</th>
//                   <th className="px-5 py-3 text-center font-bold text-yellow-700">Chờ</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {statsByRoute.length === 0 ? (
//                   <tr>
//                     <td colSpan="6" className="text-center py-8 text-gray-500">
//                       Chưa có dữ liệu tuyến hôm nay
//                     </td>
//                   </tr>
//                 ) : (
//                   statsByRoute.map((r, i) => (
//                     <tr key={r.id} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-indigo-50 transition`}>
//                       <td className="px-5 py-4 font-medium">{r.name}</td>
//                       <td className="px-5 py-4">{r.time}</td>
//                       <td className="px-5 py-4 text-center font-bold text-gray-700">{r.total}</td>
//                       <td className="px-5 py-4 text-center font-bold text-green-600">{r.onboard}</td>
//                       <td className="px-5 py-4 text-center font-bold text-red-600">{r.absent}</td>
//                       <td className="px-5 py-4 text-center font-bold text-yellow-600">{r.waiting}</td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Báo cáo & Tin nhắn nhanh – giữ nguyên layout đẹp */}
//         <div className="grid md:grid-cols-2 gap-8">
//           <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-orange-200 hover:border-orange-300 transition">
//             <h2 className="text-2xl font-bold mb-6 flex items-center gap-4 text-orange-600">
//               <AlertTriangle className="w-8 h-8" /> Báo cáo sự cố
//             </h2>
//             <button 
//               onClick={() => setShowIncidentModal(true)}
//               className="w-full py-5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold text-lg rounded-xl shadow-xl hover:scale-105 transition transform"
//             >
//               BÁO CÁO NGAY
//             </button>
//           </div>

//           <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-indigo-200 hover:border-indigo-300 transition">
//             <h2 className="text-2xl font-bold mb-6 flex items-center gap-4 text-indigo-600">
//               <MessageCircle className="w-8 h-8" /> Tin nhắn nhanh
//             </h2>
//             <div className="grid grid-cols-1 gap-4">
//               {quickMessages.map((msg, i) => (
//                 <button 
//                   key={i}
//                   onClick={() => handleQuickMessage(msg)}
//                   className="text-left p-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-2 border-indigo-200 rounded-xl font-medium transition hover:scale-105 shadow"
//                 >
//                   {msg}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Gọi khẩn cấp */}
//         <div className="bg-gradient-to-r from-red-600 to-pink-700 rounded-2xl shadow-2xl p-8 text-white border-4 border-red-400">
//           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
//             <div className="text-center md:text-left">
//               <div className="flex items-center gap-4 justify-center md:justify-start">
//                 <Siren className="w-16 h-16 animate-pulse" />
//                 <div>
//                   <h3 className="text-3xl font-bold">KHẨN CẤP</h3>
//                   <p className="text-lg opacity-90 mt-2">Nhấn để gọi cứu hộ ngay lập tức</p>
//                 </div>
//               </div>
//             </div>
//             <button 
//               onClick={handleEmergencyCall}
//               className="px-10 py-6 bg-white text-red-600 font-bold text-2xl rounded-full shadow-2xl hover:scale-110 transition transform flex items-center gap-4"
//             >
//               <Phone className="w-10 h-10" /> GỌI CỨU HỘ
//             </button>
//           </div>
//         </div>

//         {/* Modal báo cáo sự cố */}
//         {showIncidentModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-3xl shadow-3xl p-10 max-w-md w-full border-4 border-red-200">
//               <div className="flex justify-between items-center mb-8">
//                 <h3 className="text-3xl font-bold text-red-600">Báo cáo sự cố</h3>
//                 <button onClick={() => setShowIncidentModal(false)} className="text-gray-500 hover:text-gray-800">
//                   <X className="w-8 h-8" />
//                 </button>
//               </div>
//               <div className="space-y-5">
//                 {incidentTypes.map((type) => {
//                   const Icon = type.icon;
//                   return (
//                     <label key={type.id} className="flex items-center gap-5 p-5 border-2 rounded-2xl cursor-pointer hover:bg-red-50 transition">
//                       <input 
//                         type="radio" 
//                         name="incident" 
//                         value={type.id} 
//                         checked={selectedIncident === type.id} 
//                         onChange={(e) => setSelectedIncident(e.target.value)} 
//                         className="w-6 h-6 text-red-600"
//                       />
//                       <Icon className="w-8 h-8 text-red-600" />
//                       <span className="text-lg font-semibold">{type.label}</span>
//                     </label>
//                   );
//                 })}
//                 <textarea 
//                   placeholder="Ghi chú chi tiết (tùy chọn)..." 
//                   value={incidentNote} 
//                   onChange={(e) => setIncidentNote(e.target.value)} 
//                   className="w-full p-4 border-2 rounded-xl resize-none text-gray-700"
//                   rows="3"
//                 />
//                 <div className="flex gap-4">
//                   <button 
//                     onClick={handleSendIncident} 
//                     disabled={!selectedIncident}
//                     className="flex-1 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold text-xl rounded-xl transition"
//                   >
//                     GỬI NGAY
//                   </button>
//                   <button 
//                     onClick={() => setShowIncidentModal(false)}
//                     className="flex-1 py-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-xl rounded-xl transition"
//                   >
//                     Hủy
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }
// src/pages/driver/DriverOperations.jsx
import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Phone, MessageCircle,
  Siren, MapPin, Clock, Users, X, Bus, Loader2
} from 'lucide-react';
import { useRouteTracking } from '../../context/RouteTrackingContext';
import { useAuth } from '../../hooks/useAuth';
import { getMySchedule } from '../../services/tripService';

const quickMessages = [
  "Xe đang đến trạm đón",
  "Xe bị trễ 10 phút do kẹt xe",
  "Học sinh đã lên xe an toàn",
  "Xe đã đến trường",
  "Có mưa lớn, xe đi chậm",
  "Xe đang di chuyển bình thường",
];

const incidentTypes = [
  { id: 'traffic',    label: 'Kẹt xe',          icon: AlertTriangle },
  { id: 'breakdown',  label: 'Hỏng xe',         icon: Siren },
  { id: 'accident',   label: 'Tai nạn',         icon: AlertTriangle },
  { id: 'weather',    label: 'Thời tiết xấu',   icon: MapPin },
  { id: 'other',      label: 'Khác',            icon: MessageCircle },
];

export default function DriverOperations() {
  const { user } = useAuth();
  const {
    currentStation,
    currentRoute,
    routesToday = [],
    allStudentsForContact = [],
    studentCheckIns = {},
  } = useRouteTracking();

  const [loading, setLoading] = useState(true);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState('');
  const [incidentNote, setIncidentNote] = useState('');

  // Tự động tải lịch trình nếu context chưa có dữ liệu
  useEffect(() => {
    const loadScheduleIfNeeded = async () => {
      if (routesToday.length > 0 || currentRoute) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Gọi API lấy lịch trình (có fallback mock → không cần dùng biến schedule)
        await getMySchedule();
        // Context sẽ tự cập nhật nếu có hàm init
        // Nếu không có → vẫn dùng mock → UI vẫn hoạt động bình thường
      } catch (err) {
        console.warn('Không thể tải lịch trình ở Operations → dùng dữ liệu mock');
      } finally {
        setLoading(false);
      }
    };

    loadScheduleIfNeeded();
  }, [routesToday.length, currentRoute]);

  // Helper: lưu tin nhắn + broadcast
  const pushChatMessage = (threadId, msgObj) => {
    try {
      const KEY = 'chat_messages';
      const raw = localStorage.getItem(KEY);
      const store = raw ? JSON.parse(raw) : {};

      if (!store[threadId]) store[threadId] = [];

      if (!store[threadId].some(m => m.id === msgObj.id)) {
        store[threadId].push(msgObj);
        localStorage.setItem(KEY, JSON.stringify(store));
      }

      window.dispatchEvent(new CustomEvent('chat_message', {
        detail: { threadId, message: msgObj }
      }));
    } catch (e) {
      console.error('Lỗi lưu tin nhắn:', e);
    }
  };

  const nowTime = () => new Date().toTimeString().slice(0, 5);

  // Báo sự cố
  const handleSendIncident = () => {
    if (!selectedIncident) return;

    const typeLabel = incidentTypes.find(t => t.id === selectedIncident)?.label || 'Không xác định';
    const text = `BÁO CÁO SỰ CỐ: ${typeLabel} — ${incidentNote || 'Không ghi chú'}`;
    const location = currentStation?.name ? ` (Tại: ${currentStation.name})` : '';

    const msg = {
      id: Date.now(),
      sender: 'driver',
      text: text + location,
      time: nowTime(),
      type: 'incident'
    };

    pushChatMessage('admin', msg);

    // Gửi cảnh báo cho vài phụ huynh (giới hạn spam)
    if (currentRoute && allStudentsForContact.length > 0) {
      const parents = allStudentsForContact.slice(0, 5);
      parents.forEach(p => {
        pushChatMessage(`parent-${p.id}`, {
          ...msg,
          text: `[Cảnh báo] ${text} — Xe đang gặp sự cố, vui lòng theo dõi.`
        });
      });
    }

    alert(`ĐÃ GỬI BÁO CÁO: ${typeLabel}\n${incidentNote || 'Không có ghi chú'}`);
    setShowIncidentModal(false);
    setSelectedIncident('');
    setIncidentNote('');
  };

  // Tin nhắn nhanh
  const handleQuickMessage = (msg) => {
    if (!currentRoute) {
      alert('Chưa có tuyến hiện tại để gửi tin.');
      return;
    }

    const studentsInRoute = allStudentsForContact.filter(s =>
      currentRoute.stations?.some(st => st.id === s.stop)
    );

    if (studentsInRoute.length === 0) {
      alert('Không tìm thấy phụ huynh trong tuyến này.');
      return;
    }

    const now = nowTime();
    let sentCount = 0;

    studentsInRoute.forEach(student => {
      const threadId = `parent-${student.id}`;
      const messageObj = {
        id: Date.now() + Math.random(),
        sender: 'driver',
        text: `[Tin nhanh] ${msg}`,
        time: now
      };
      pushChatMessage(threadId, messageObj);
      sentCount++;
    });

    pushChatMessage('admin', {
      id: Date.now() + 999,
      sender: 'driver',
      text: `Đã gửi tin nhanh: "${msg}" → ${sentCount} phụ huynh`,
      time: now
    });

    alert(`ĐÃ GỬI TIN NHANH\n"${msg}"\n→ ${sentCount} phụ huynh`);
  };

  // Gọi khẩn cấp
  const handleEmergencyCall = () => {
    if (!confirm('Gọi khẩn cấp đến quản lý và lực lượng cứu hộ?')) return;

    const msg = {
      id: Date.now(),
      sender: 'driver',
      text: 'TÀI XẾ GỌI KHẨN CẤP — CẦN HỖ TRỢ NGAY!',
      time: nowTime(),
      type: 'emergency'
    };

    pushChatMessage('admin', msg);

    allStudentsForContact.forEach(s => {
      pushChatMessage(`parent-${s.id}`, {
        ...msg,
        text: '[CẢNH BÁO KHẨN] Xe buýt đang gặp sự cố nghiêm trọng!'
      });
    });

    alert('ĐÃ GỌI KHẨN CẤP!\nQuản lý và cứu hộ đang được thông báo...');
  };

  // Thống kê theo tuyến
  const statsByRoute = routesToday.map(route => {
    const students = allStudentsForContact.filter(s =>
      route.stations?.some(st => st.id === s.stop)
    );
    const total = students.length;
    const onboard = students.filter(s => studentCheckIns[s.id] === 'present').length;
    const absent = students.filter(s => studentCheckIns[s.id] === 'absent').length;
    const waiting = total - onboard - absent;

    return {
      id: route.id || route._id,
      name: route.name || route.routeId?.name || 'Chưa đặt tên',
      time: route.time || route.startTime || '--:--',
      total,
      onboard,
      absent,
      waiting,
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-indigo-700">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-2xl">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-4">
                <Bus className="w-10 h-10" /> Thao tác nhanh
              </h1>
              <p className="text-lg opacity-90 mt-2">Tài xế: <strong>{user?.name || 'Tài xế'}</strong></p>
              <p className="text-base opacity-80 mt-1 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Trạm hiện tại: <strong>{currentStation?.name || 'Chưa xuất phát'}</strong>
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-right">
              <div className="text-sm opacity-90">Tuyến hiện tại</div>
              <div className="text-xl font-bold mt-1">
                {currentRoute ? currentRoute.name || 'Đang chạy' : 'Chưa có tuyến'}
              </div>
              <div className="text-sm mt-1 opacity-90">
                {currentRoute?.time || '--:--'}
              </div>
            </div>
          </div>
        </header>

        {/* Bảng thống kê */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
            <Users className="w-7 h-7 text-indigo-600" /> Thống kê học sinh theo tuyến
          </h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-indigo-100 to-purple-100">
                <tr>
                  <th className="px-5 py-3 text-left font-bold">Tuyến</th>
                  <th className="px-5 py-3 text-left font-bold">Giờ</th>
                  <th className="px-5 py-3 text-center font-bold">Tổng</th>
                  <th className="px-5 py-3 text-center font-bold text-green-700">Lên xe</th>
                  <th className="px-5 py-3 text-center font-bold text-red-700">Vắng</th>
                  <th className="px-5 py-3 text-center font-bold text-yellow-700">Chờ</th>
                </tr>
              </thead>
              <tbody>
                {statsByRoute.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      Chưa có dữ liệu tuyến hôm nay
                    </td>
                  </tr>
                ) : (
                  statsByRoute.map((r, i) => (
                    <tr key={r.id} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-indigo-50 transition`}>
                      <td className="px-5 py-4 font-medium">{r.name}</td>
                      <td className="px-5 py-4">{r.time}</td>
                      <td className="px-5 py-4 text-center font-bold text-gray-700">{r.total}</td>
                      <td className="px-5 py-4 text-center font-bold text-green-600">{r.onboard}</td>
                      <td className="px-5 py-4 text-center font-bold text-red-600">{r.absent}</td>
                      <td className="px-5 py-4 text-center font-bold text-yellow-600">{r.waiting}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Báo cáo & Tin nhắn nhanh */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-orange-200 hover:border-orange-300 transition">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-4 text-orange-600">
              <AlertTriangle className="w-8 h-8" /> Báo cáo sự cố
            </h2>
            <button
              onClick={() => setShowIncidentModal(true)}
              className="w-full py-5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold text-lg rounded-xl shadow-xl hover:scale-105 transition transform"
            >
              BÁO CÁO NGAY
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-indigo-200 hover:border-indigo-300 transition">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-4 text-indigo-600">
              <MessageCircle className="w-8 h-8" /> Tin nhắn nhanh
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {quickMessages.map((msg, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickMessage(msg)}
                  className="text-left p-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-2 border-indigo-200 rounded-xl font-medium transition hover:scale-105 shadow"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gọi khẩn cấp */}
        <div className="bg-gradient-to-r from-red-600 to-pink-700 rounded-2xl shadow-2xl p-8 text-white border-4 border-red-400">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <Siren className="w-16 h-16 animate-pulse" />
                <div>
                  <h3 className="text-3xl font-bold">KHẨN CẤP</h3>
                  <p className="text-lg opacity-90 mt-2">Nhấn để gọi cứu hộ ngay lập tức</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleEmergencyCall}
              className="px-10 py-6 bg-white text-red-600 font-bold text-2xl rounded-full shadow-2xl hover:scale-110 transition transform flex items-center gap-4"
            >
              <Phone className="w-10 h-10" /> GỌI CỨU HỘ
            </button>
          </div>
        </div>

        {/* Modal báo cáo sự cố */}
        {showIncidentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-3xl p-10 max-w-md w-full border-4 border-red-200">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-bold text-red-600">Báo cáo sự cố</h3>
                <button onClick={() => setShowIncidentModal(false)} className="text-gray-500 hover:text-gray-800">
                  <X className="w-8 h-8" />
                </button>
              </div>
              <div className="space-y-5">
                {incidentTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <label key={type.id} className="flex items-center gap-5 p-5 border-2 rounded-2xl cursor-pointer hover:bg-red-50 transition">
                      <input
                        type="radio"
                        name="incident"
                        value={type.id}
                        checked={selectedIncident === type.id}
                        onChange={(e) => setSelectedIncident(e.target.value)}
                        className="w-6 h-6 text-red-600"
                      />
                      <Icon className="w-8 h-8 text-red-600" />
                      <span className="text-lg font-semibold">{type.label}</span>
                    </label>
                  );
                })}
                <textarea
                  placeholder="Ghi chú chi tiết (tùy chọn)..."
                  value={incidentNote}
                  onChange={(e) => setIncidentNote(e.target.value)}
                  className="w-full p-4 border-2 rounded-xl resize-none text-gray-700"
                  rows={3}
                />
                <div className="flex gap-4">
                  <button
                    onClick={handleSendIncident}
                    disabled={!selectedIncident}
                    className="flex-1 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold text-xl rounded-xl transition"
                  >
                    GỬI NGAY
                  </button>
                  <button
                    onClick={() => setShowIncidentModal(false)}
                    className="flex-1 py-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-xl rounded-xl transition"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}