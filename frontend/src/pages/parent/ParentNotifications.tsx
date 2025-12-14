import { useState, useEffect } from 'react';
import { BellIcon } from '../../components/parent/Icons';
import useSocket from '../../hooks/useSocket';
import api from '../../services/api';

interface Notification {
  id: number | string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'neutral' | 'warning' | 'error';
  evidenceUrl?: string;
  isNew?: boolean; // For animation on new notifications
}

// Helper to get relative time
const getRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${diffDays} ngày trước`;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  // Fetch notifications AND alerts from API on mount, join rooms for real-time updates
  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch both notifications and alerts in parallel
        const [notifRes, alertsRes] = await Promise.all([
          api.get('/notifications/me').catch(() => ({ data: { data: [] } })),
          api.get('/alerts').catch(() => ({ data: { data: [] } }))
        ]);
        
        const apiNotifs = notifRes.data.data || notifRes.data || [];
        const apiAlerts = alertsRes.data.data || alertsRes.data || [];
        
        // Format notifications
        const formattedNotifs = apiNotifs.map((n: any) => ({
          id: n._id || `notif-${Date.now()}`,
          title: n.title || 'Thông báo',
          message: n.message || n.content || '',
          time: getRelativeTime(n.createdAt || new Date().toISOString()),
          createdAt: new Date(n.createdAt || Date.now()).getTime(),
          type: n.type === 'CHECK_IN' ? 'success' : 
                n.type === 'ABSENT' ? 'error' :
                n.type === 'SOS' || n.type === 'OFF_ROUTE' ? 'warning' : 'info',
          evidenceUrl: n.evidenceUrl
        }));
        
        // Format alerts (bus events like arrived, departed, approaching)
        const formattedAlerts = apiAlerts.map((a: any) => ({
          id: a._id || `alert-${Date.now()}`,
          title: a.type === 'SOS' ? '🆘 Khẩn cấp' :
                 a.type === 'OFF_ROUTE' ? '⚠️ Lệch tuyến' :
                 a.type === 'LATE' ? '⏰ Trễ giờ' :
                 a.type === 'ARRIVED' ? '📍 Xe đến trạm' :
                 a.type === 'DEPARTED' ? '🚀 Xe rời trạm' :
                 a.type === 'APPROACHING' ? '🚌 Xe sắp đến' : 'Cảnh báo',
          message: a.message || 'Có cảnh báo mới',
          time: getRelativeTime(a.createdAt || a.timestamp || new Date().toISOString()),
          createdAt: new Date(a.createdAt || a.timestamp || Date.now()).getTime(),
          type: a.type === 'SOS' ? 'error' : 
                a.type === 'OFF_ROUTE' || a.type === 'LATE' ? 'warning' : 'info'
        }));
        
        // Merge and sort by time (newest first)
        const merged = [...formattedNotifs, ...formattedAlerts]
          .sort((a, b) => b.createdAt - a.createdAt);
        
        console.log(`📬 Loaded ${formattedNotifs.length} notifications + ${formattedAlerts.length} alerts`);
        setNotifications(merged);
      } catch (error) {
        console.warn('Failed to fetch notifications/alerts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAll();

    // Also fetch active trip to join room
    const joinTripRoom = async () => {
      try {
        const tripsRes = await api.get('/trips');
        const allTrips = tripsRes.data.data || tripsRes.data || [];
        const activeTrip = allTrips.find((t: any) => t.status === 'IN_PROGRESS') ||
                           allTrips.find((t: any) => t.status === 'NOT_STARTED') ||
                           allTrips[0];
        
        if (activeTrip && socket) {
          socket.emit('join_trip_room', activeTrip._id);
          console.log('📡 Notifications: Joined trip room:', activeTrip._id);
        }
      } catch (e) {
        console.warn('Could not join trip room for notifications');
      }
    };
    
    if (socket) {
      joinTripRoom();
    }
  }, [socket]);

  // Real-time socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Helper to add new notification with isNew flag
    const addNotification = (title: string, message: string, type: Notification['type'], evidenceUrl?: string) => {
      const newNotif: Notification = {
        id: Date.now(),
        title,
        message,
        time: 'Vừa xong',
        type,
        evidenceUrl,
        isNew: true // Mark as new for animation
      };
      setNotifications(prev => [newNotif, ...prev]);
      
      // Remove isNew flag after animation completes (3 seconds)
      setTimeout(() => {
        setNotifications(prev => 
          prev.map(n => n.id === newNotif.id ? { ...n, isNew: false } : n)
        );
      }, 3000);
    };

    // ========================================
    // 1. TRIP COMPLETED
    // ========================================
    const handleTripCompleted = (data: any) => {
      console.log('🏁 Notification: trip:completed', data);
      addNotification('Hoàn thành chuyến', '🏁 Chuyến xe đã hoàn thành hành trình', 'success');
    };

    // ========================================
    // 2. STUDENTS MARKED ABSENT - Backend sends: { stationId, count }
    // ========================================
    const handleStudentAbsent = (data: any) => {
      console.log('❌ Notification: trip:students_marked_absent', data);
      const count = data.count || 'Một số';
      addNotification('Học sinh vắng mặt', `❌ ${count} học sinh được đánh dấu vắng`, 'error');
    };

    // ========================================
    // 3. STUDENT CHECKED IN - Backend sends: { studentId, action, evidenceUrl }
    // ========================================
    const handleStudentCheckedIn = (data: any) => {
      console.log('✅ Notification: student:checked_in', data);
      const { action, evidenceUrl } = data;
      const actionText = action === 'PICKED_UP' ? 'đã lên xe' : action === 'DROPPED_OFF' ? 'đã xuống xe' : 'đã check-in';
      addNotification('Học sinh check-in', `✅ Học sinh ${actionText} an toàn`, 'success', evidenceUrl);
    };

    // ========================================
    // 4. BUS APPROACHING STATION - Backend sends: { stationId, message }
    // ========================================
    const handleApproachingStation = (data: any) => {
      console.log('🚌 Notification: bus:approaching_station', data);
      const msg = data.message || 'Xe sắp đến trạm';
      addNotification('Xe sắp đến', `🚌 ${msg}`, 'info');
    };

    // ========================================
    // 5. BUS ARRIVED AT STATION - Backend sends: { stationId, arrivalTime }
    // ========================================
    const handleArrivedStation = (data: any) => {
      console.log('📍 Notification: bus:arrived_at_station', data);
      addNotification('Xe đã đến trạm', '📍 Xe đã đến trạm', 'info');
    };

    // ========================================
    // 6. BUS DEPARTED FROM STATION - Backend sends: { stationId, departureTime }
    // ========================================
    const handleDepartedStation = (data: any) => {
      console.log('🚀 Notification: bus:departed_from_station', data);
      addNotification('Xe rời trạm', '🚀 Xe đã rời trạm', 'neutral');
    };

    // ========================================
    // 7. ALERT NEW - Emergency alerts
    // ========================================
    const handleAlertNew = (data: any) => {
      console.log('🚨 Notification: alert:new', data);
      const { type, message } = data;
      
      let title = 'Cảnh báo';
      let msg = message || 'Có cảnh báo mới';
      let notifType: Notification['type'] = 'warning';
      
      switch (type) {
        case 'SOS':
          title = '🆘 KHỞN CẤP';
          msg = message || 'Tài xế bấm nút SOS!';
          notifType = 'error';
          break;
        case 'OFF_ROUTE':
          title = '⚠️ Lệch tuyến';
          msg = 'Xe đi lệch tuyến đường quy định';
          notifType = 'warning';
          break;
        case 'LATE':
          title = '⏰ Trễ giờ';
          msg = 'Xe bị trễ so với lịch trình';
          notifType = 'warning';
          break;
        default:
          title = '⚠️ Cảnh báo';
      }
      
      addNotification(title, msg, notifType);
    };

    // ========================================
    // 8. GENERIC NOTIFICATION
    // ========================================
    const handleGenericNotification = (data: any) => {
      console.log('🔔 Notification: notification:new', data);
      const { title, message, action, evidenceUrl } = data;
      addNotification(
        title || 'Thông báo mới',
        message || 'Bạn có thông báo mới',
        action === 'ABSENT' ? 'error' : action === 'PICKED_UP' ? 'success' : 'info',
        evidenceUrl
      );
    };

    // Register all listeners
    socket.on('trip:completed', handleTripCompleted);
    socket.on('trip:students_marked_absent', handleStudentAbsent);
    socket.on('student:checked_in', handleStudentCheckedIn);
    socket.on('bus:approaching_station', handleApproachingStation);
    socket.on('bus:arrived_at_station', handleArrivedStation);
    socket.on('bus:departed_from_station', handleDepartedStation);
    socket.on('alert:new', handleAlertNew);
    socket.on('notification:new', handleGenericNotification);

    return () => {
      socket.off('trip:completed', handleTripCompleted);
      socket.off('trip:students_marked_absent', handleStudentAbsent);
      socket.off('student:checked_in', handleStudentCheckedIn);
      socket.off('bus:approaching_station', handleApproachingStation);
      socket.off('bus:arrived_at_station', handleArrivedStation);
      socket.off('bus:departed_from_station', handleDepartedStation);
      socket.off('alert:new', handleAlertNew);
      socket.off('notification:new', handleGenericNotification);
    };
  }, [socket]);

  // Get icon background color based on type
  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-600';
      case 'error': return 'bg-red-100 text-red-600';
      case 'warning': return 'bg-orange-100 text-orange-600';
      case 'info': return 'bg-blue-100 text-blue-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="bg-white rounded-2xl p-4 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Thông báo</h1>
        <button 
          className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          onClick={() => setNotifications(prev => prev.map(n => ({ ...n })))}
        >
          Đánh dấu đã đọc
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BellIcon className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500">Chưa có thông báo nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {notifications.map((notif, index) => (
            <div 
              key={notif.id} 
              className={`p-4 flex gap-4 hover:bg-slate-50 transition-all duration-300 ${
                index !== notifications.length - 1 ? 'border-b border-slate-100' : ''
              } ${
                notif.isNew ? 'bg-green-50 animate-pulse ring-2 ring-green-400 ring-inset' : ''
              }`}
            >
              <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getTypeStyles(notif.type)}`}>
                <BellIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold text-slate-900">{notif.title}</h3>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{notif.time}</span>
                </div>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                {notif.evidenceUrl && (
                  <div className="mt-2">
                    <img 
                      src={notif.evidenceUrl} 
                      alt="Ảnh check-in" 
                      className="w-20 h-20 rounded-lg object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(notif.evidenceUrl, '_blank')}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              {index === 0 && (
                <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}