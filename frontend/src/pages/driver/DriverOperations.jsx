// src/pages/driver/DriverOperations.jsx
import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Phone, MessageCircle,
  Siren, MapPin, Clock, Users, X, Bus, Loader2
} from 'lucide-react';
import { useRouteTracking } from '../../context/RouteTrackingContext';
import { useAuth } from '../../hooks/useAuth';
import { getMySchedule } from '../../services/tripService';
import { sendDriverAlert, connectSocket, getSocket } from '../../services/socketService';

// ✅ Alert types mapped to backend enum: SOS, LATE, OFF_ROUTE, SPEEDING, OTHER
const incidentTypes = [
  // SOS: Hư lốp, tai nạn, thời tiết xấu
  { id: 'breakdown', label: 'Hư lốp', icon: Siren, alertType: 'SOS' },
  { id: 'accident', label: 'Tai nạn', icon: AlertTriangle, alertType: 'SOS' },
  { id: 'weather', label: 'Thời tiết xấu', icon: MapPin, alertType: 'SOS' },
  // LATE: Kẹt xe
  { id: 'traffic', label: 'Kẹt xe', icon: AlertTriangle, alertType: 'LATE' },
  // OTHER: Khác
  { id: 'other', label: 'Khác', icon: MessageCircle, alertType: 'OTHER' },
];

export default function DriverOperations() {
  const { user } = useAuth();
  const {
    currentStation,
    currentRoute,
    routesToday = [],
    allStudentsForContact = [],
    studentCheckIns = {},
    currentTripId, // ← Get current trip ID from context
    isTracking,    // ← Check if trip is active
  } = useRouteTracking();

  const [loading, setLoading] = useState(true);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState('');
  const [incidentNote, setIncidentNote] = useState('');
  const [alertStatus, setAlertStatus] = useState(null); // For showing alert feedback
  const [scheduleData, setScheduleData] = useState([]); // ✅ Lưu dữ liệu từ getMySchedule()
  const [selectedTripIndex, setSelectedTripIndex] = useState(0); // ✅ Chọn tuyến để xem học sinh

  // ✅ Check if driver can send alerts (must have active trip)
  const canSendAlert = Boolean(currentTripId && isTracking);

  // ✅ Connect socket and listen for alert responses
  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;

    // Listen for success response
    socket.on('alert:success', (message) => {
      console.log('[DriverOperations] ✅ Alert success:', message);
      setAlertStatus({ type: 'success', message: message || 'Đã gửi cảnh báo!' });
      setTimeout(() => setAlertStatus(null), 3000);
    });

    // Listen for error response
    socket.on('alert:error', (message) => {
      console.error('[DriverOperations] ❌ Alert error:', message);
      setAlertStatus({ type: 'error', message: message || 'Lỗi gửi cảnh báo' });
      setTimeout(() => setAlertStatus(null), 3000);
    });

    return () => {
      socket.off('alert:success');
      socket.off('alert:error');
    };
  }, []);

  // ✅ Tải lịch trình từ getMySchedule() API
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        setLoading(true);
        console.log('[DriverOperations] Fetching schedule from API...');
        const data = await getMySchedule();
        console.log('[DriverOperations] Schedule data:', data);
        setScheduleData(Array.isArray(data) ? data : [data]);
      } catch (err) {
        console.warn('[DriverOperations] Không thể tải lịch trình:', err);
        setScheduleData([]);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, []);

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

  // ✅ Báo sự cố - emit socket event to backend
  const handleSendIncident = () => {
    if (!selectedIncident) return;

    // ✅ Check if trip is active before sending
    if (!canSendAlert) {
      setAlertStatus({
        type: 'error',
        message: 'Vui lòng bắt đầu chuyến đi trước khi báo cáo sự cố!'
      });
      setTimeout(() => setAlertStatus(null), 3000);
      return;
    }

    const incident = incidentTypes.find(t => t.id === selectedIncident);
    if (!incident) return;

    // Get alert type (SOS, LATE, OTHER)
    const alertType = incident.alertType;
    const typeLabel = incident.label;

    // Build message
    const location = currentStation?.name ? ` (Tại: ${currentStation.name})` : '';
    const message = `${typeLabel}${incidentNote ? ': ' + incidentNote : ''}${location}`;

    console.log('[DriverOperations] 🚨 Sending alert:', { type: alertType, message });

    // ✅ Emit socket event to backend
    sendDriverAlert(alertType, message);

    // Show sending notification
    setAlertStatus({ type: 'info', message: 'Đang gửi cảnh báo...' });

    // Close modal
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

  // ✅ Thống kê học sinh theo tuyến - trực tiếp từ scheduleData (getMySchedule API)
  // Backend API: { busId: {licensePlate}, routeId: {name}, scheduleId: {direction}, tripDate }
  const statsByRoute = scheduleData.map(trip => {
    const routeName = trip.routeId?.name || trip.name || 'Chưa đặt tên';
    const tripTime = trip.tripDate
      ? new Date(trip.tripDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      : '--:--';

    // ✅ Lấy danh sách học sinh từ studentStops (API mới) hoặc students (fallback)
    const studentStops = trip.studentStops || trip.students || [];
    const total = studentStops.length;

    // ✅ Đếm trạng thái học sinh theo API mới
    // action: PENDING, PICKED_UP, DROPPED_OFF, ABSENT
    const onboard = studentStops.filter(s =>
      s.action === 'PICKED_UP' || s.action === 'DROPPED_OFF' ||
      s.status === 'PICKED_UP' || s.status === 'DROPPED_OFF' ||
      s.status === 'PRESENT' || s.status === 'present'
    ).length;
    const absent = studentStops.filter(s =>
      s.action === 'ABSENT' || s.status === 'ABSENT' || s.status === 'absent'
    ).length;
    const waiting = total - onboard - absent;

    // ✅ Lấy thông tin từ cấu trúc API mới
    // direction nằm ở scheduleId.direction (hoặc trip.direction fallback)
    const directionValue = trip.scheduleId?.direction || trip.direction;
    const direction = directionValue === 'PICK_UP' ? '🚌 Đón' :
      directionValue === 'DROP_OFF' ? '🏠 Trả' : '—';
    const busPlate = trip.busId?.licensePlate || 'N/A';

    return {
      id: trip._id || trip.id,
      name: routeName,
      time: tripTime,
      total,
      onboard,
      absent,
      waiting,
      status: trip.status || 'NOT_STARTED',
      direction,
      busPlate,
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
                  <th className="px-4 py-3 text-left font-bold">Tuyến</th>
                  <th className="px-4 py-3 text-left font-bold">Chiều</th>
                  <th className="px-4 py-3 text-left font-bold">Giờ</th>
                  <th className="px-4 py-3 text-center font-bold">Tổng</th>
                  <th className="px-4 py-3 text-center font-bold text-green-700">Lên xe</th>
                  <th className="px-4 py-3 text-center font-bold text-red-700">Vắng</th>
                  <th className="px-4 py-3 text-center font-bold text-yellow-700">Chờ</th>
                  <th className="px-4 py-3 text-center font-bold">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {statsByRoute.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      Chưa có dữ liệu tuyến hôm nay
                    </td>
                  </tr>
                ) : (
                  statsByRoute.map((r, i) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedTripIndex(i)}
                      className={`cursor-pointer transition ${i === selectedTripIndex
                        ? 'bg-indigo-100 border-l-4 border-indigo-500'
                        : i % 2 === 0 ? 'bg-gray-50 hover:bg-indigo-50' : 'bg-white hover:bg-indigo-50'
                        }`}
                    >
                      <td className="px-4 py-3 font-medium">{r.name}</td>
                      <td className="px-4 py-3">{r.direction}</td>
                      <td className="px-4 py-3">{r.time}</td>
                      <td className="px-4 py-3 text-center font-bold text-gray-700">{r.total}</td>
                      <td className="px-4 py-3 text-center font-bold text-green-600">{r.onboard}</td>
                      <td className="px-4 py-3 text-center font-bold text-red-600">{r.absent}</td>
                      <td className="px-4 py-3 text-center font-bold text-yellow-600">{r.waiting}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-800' :
                          r.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' :
                            r.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-700'
                          }`}>
                          {r.status === 'IN_PROGRESS' ? 'Đang chạy' :
                            r.status === 'COMPLETED' ? 'Hoàn thành' :
                              r.status === 'CANCELLED' ? 'Đã hủy' : 'Chờ'}
                        </span>
                      </td>
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

          {/* Danh sách học sinh của chuyến đi được chọn */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-indigo-200 hover:border-indigo-300 transition">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-indigo-600">
              <Users className="w-7 h-7" />
              Danh sách học sinh
              {scheduleData[selectedTripIndex] && (
                <span className="text-sm font-normal text-gray-500">
                  — {scheduleData[selectedTripIndex]?.routeId?.name || 'Chuyến đi'}
                </span>
              )}
            </h2>

            {/* Danh sách học sinh */}
            <div className="max-h-80 overflow-y-auto space-y-2">
              {(() => {
                const selectedTrip = scheduleData[selectedTripIndex];
                const students = selectedTrip?.studentStops || selectedTrip?.students || [];

                if (students.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Không có học sinh trong chuyến này</p>
                    </div>
                  );
                }

                return students.map((s, idx) => {
                  const studentName = s.studentId?.name || s.name || `Học sinh ${idx + 1}`;
                  const studentGrade = s.studentId?.grade || s.grade || '';
                  const status = s.action || s.status || 'PENDING';
                  const stationName = s.stationId?.name || '';

                  return (
                    <div
                      key={s._id || s.studentId?._id || idx}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 transition ${status === 'PICKED_UP' || status === 'DROPPED_OFF'
                        ? 'bg-green-50 border-green-200'
                        : status === 'ABSENT'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-gray-50 border-gray-200'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${status === 'PICKED_UP' || status === 'DROPPED_OFF'
                          ? 'bg-green-500'
                          : status === 'ABSENT'
                            ? 'bg-red-500'
                            : 'bg-gray-400'
                          }`}>
                          {studentName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{studentName}</div>
                          <div className="text-xs text-gray-500">
                            {studentGrade && `${studentGrade} • `}
                            {stationName || 'Chưa rõ trạm'}
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${status === 'PICKED_UP' ? 'bg-green-500 text-white' :
                        status === 'DROPPED_OFF' ? 'bg-blue-500 text-white' :
                          status === 'ABSENT' ? 'bg-red-500 text-white' :
                            'bg-yellow-400 text-gray-800'
                        }`}>
                        {status === 'PICKED_UP' ? '✓ Đã đón' :
                          status === 'DROPPED_OFF' ? '✓ Đã trả' :
                            status === 'ABSENT' ? '✗ Vắng' : '⏳ Chờ'}
                      </span>
                    </div>
                  );
                });
              })()}
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
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full border-2 border-red-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-red-600">Báo cáo sự cố</h3>
                <button onClick={() => setShowIncidentModal(false)} className="text-gray-500 hover:text-gray-800">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-3">
                {incidentTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <label key={type.id} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-red-50 transition">
                      <input
                        type="radio"
                        name="incident"
                        value={type.id}
                        checked={selectedIncident === type.id}
                        onChange={(e) => setSelectedIncident(e.target.value)}
                        className="w-5 h-5 text-red-600"
                      />
                      <Icon className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </label>
                  );
                })}
                <textarea
                  placeholder="Ghi chú chi tiết (tùy chọn)..."
                  value={incidentNote}
                  onChange={(e) => setIncidentNote(e.target.value)}
                  className="w-full p-3 border rounded-lg resize-none text-gray-700 text-sm"
                  rows={2}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSendIncident}
                    disabled={!selectedIncident}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold text-base rounded-lg transition"
                  >
                    GỬI NGAY
                  </button>
                  <button
                    onClick={() => setShowIncidentModal(false)}
                    className="flex-1 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-base rounded-lg transition"
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