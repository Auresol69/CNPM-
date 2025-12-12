// src/context/RouteTrackingContext.jsx
// Phiên bản sạch - KHÔNG CÓ MOCK DATA
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  getMySchedule,
  checkIn,
  markAsAbsent,
} from '../services/tripService';
import {
  connectSocket,
  joinTripRoom,
  leaveTripRoom,
  startPollingTrip,
  onBusArrived,
  onBusDeparted,
  offEvent,
} from '../services/socketService';
import { getCurrentUser } from '../services/authService';
import {
  getMyNotifications,
} from '../services/notificationService';
import {
  getMyMessages,
} from '../services/messageService';

const RouteTrackingContext = createContext();

export const useRouteTracking = () => {
  const context = useContext(RouteTrackingContext);
  if (!context) throw new Error('useRouteTracking must be used within RouteTrackingProvider');
  return context;
};

// -------------------- Constants --------------------
const CHECKIN_SECONDS = 60;

// -------------------- Provider --------------------
export const RouteTrackingProvider = ({ children }) => {
  const user = getCurrentUser();

  // === State chính ===
  const [isTracking, setIsTracking] = useState(false);
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [stationTimer, setStationTimer] = useState(0);
  const [isStationActive, setIsStationActive] = useState(false);
  const [lastStoppedState, setLastStoppedState] = useState(() => {
    try {
      const s = localStorage.getItem('lastStoppedBusState');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [currentTripId, setCurrentTripId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);

  // === Refs ===
  const timerRef = useRef(null);
  const pollCleanupRef = useRef(() => { });

  // === Derived state ===
  const isCheckingIn = stationTimer > 0;

  // === Sync dữ liệu từ backend ===
  const syncDataFromBackend = useCallback(async () => {
    if (!user) return;
    try {
      const notifs = await getMyNotifications();
      setNotifications(notifs || []);

      const msgs = await getMyMessages();
      setMessages(msgs || []);
    } catch (err) {
      console.error('[RouteTrackingContext] Sync data failed:', err);
    }
  }, [user]);

  // === Actions ===
  const startTracking = useCallback(async () => {
    try {
      const schedule = await getMySchedule();
      console.log('[RouteTrackingContext] Schedule loaded:', schedule?.length, 'trips');

      // Ưu tiên tìm chuyến theo thứ tự:
      // 1. IN_PROGRESS - Chuyến đang chạy (resume nếu app bị đóng)
      // 2. NOT_STARTED - Chuyến chưa bắt đầu (bình thường)
      // 3. Fallback - Chuyến đầu tiên
      const activeTrip =
        schedule?.find(t => t.status === 'IN_PROGRESS') ||
        schedule?.find(t => t.status === 'NOT_STARTED') ||
        schedule?.[0];

      if (activeTrip?._id) {
        setCurrentTripId(activeTrip._id);
        console.log('[RouteTrackingContext] Trip selected:', {
          id: activeTrip._id,
          status: activeTrip.status,
          direction: activeTrip.direction
        });
      } else {
        console.warn('[RouteTrackingContext] No trip found in schedule');
      }
    } catch (err) {
      console.error('[RouteTrackingContext] Could not load schedule:', err);
    }

    setIsTracking(true);
    setCurrentStationIndex(0);
    // KHÔNG tự động bật check-in khi bắt đầu tracking
    setStationTimer(0);
    setIsStationActive(false);
    setLastStoppedState(null);
    await syncDataFromBackend();
    console.log('[RouteTrackingContext] Tracking started - Check-in sẽ bật khi xe dừng tại trạm');
  }, [syncDataFromBackend]);

  const stopTracking = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    pollCleanupRef.current();

    const now = new Date().toLocaleString('vi-VN');
    const stoppedData = {
      stationIndex: currentStationIndex,
      time: now,
    };

    setLastStoppedState(stoppedData);
    try {
      localStorage.setItem('lastStoppedBusState', JSON.stringify(stoppedData));
    } catch (e) {
      console.error(e);
    }

    setIsTracking(false);
    setCurrentStationIndex(0);
    setStationTimer(0);
    setIsStationActive(false);
    setCurrentTripId(null);
    console.log('[RouteTrackingContext] Tracking stopped');
  }, [currentStationIndex]);

  // === Hàm kích hoạt check-in khi xe dừng tại trạm ===
  const activateCheckIn = useCallback((stationData) => {
    console.log('[RouteTrackingContext] Kích hoạt check-in tại trạm:', stationData);
    setIsStationActive(true);
    setStationTimer(CHECKIN_SECONDS);
    // Cập nhật currentStationIndex nếu backend gửi kèm
    if (stationData?.nextStationIndex !== undefined) {
      setCurrentStationIndex(stationData.nextStationIndex);
    }
  }, []);

  // === Hàm tắt check-in khi xe rời trạm ===
  const deactivateCheckIn = useCallback(() => {
    console.log('[RouteTrackingContext] Tắt check-in - xe đang di chuyển');
    setIsStationActive(false);
    setStationTimer(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // === Timer logic ===
  useEffect(() => {
    if (!isTracking || !isStationActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setStationTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsStationActive(false);
          console.log('[RouteTrackingContext] Check-in time expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTracking, isStationActive]);

  // === Socket/Polling setup ===
  const joinedRoomRef = useRef(null); // Track which room we joined

  useEffect(() => {
    if (!currentTripId) return;

    // Đã join room này rồi, không join lại
    if (joinedRoomRef.current === currentTripId) {
      console.log('[RouteTrackingContext] Already joined room:', currentTripId);
      return;
    }

    const socket = connectSocket();
    if (socket) {
      // Leave previous room if exists
      if (joinedRoomRef.current) {
        leaveTripRoom(joinedRoomRef.current);
        console.log('[RouteTrackingContext] Left previous room:', joinedRoomRef.current);
      }

      joinTripRoom(currentTripId);
      joinedRoomRef.current = currentTripId;
      console.log('[RouteTrackingContext] Joined new room:', currentTripId);

      const cleanupPoll = startPollingTrip(currentTripId, (tripData) => {
        console.log('[RouteTrackingContext] Poll data:', tripData);
      }, 30000);

      pollCleanupRef.current = cleanupPoll;

      return () => {
        // Chỉ cleanup poll, KHÔNG reset joinedRoomRef để tránh re-join
        cleanupPoll();
      };
    }
  }, [currentTripId]); // Loại bỏ 'user' để tránh re-run không cần thiết

  // === Lắng nghe sự kiện xe đến/rời trạm để điều khiển check-in ===
  useEffect(() => {
    if (!isTracking) return;

    const socket = connectSocket();
    if (!socket) return;

    // Khi xe đến trạm → Bật check-in
    const handleBusArrived = (data) => {
      console.log('[RouteTrackingContext] bus:arrived_at_station:', data);
      activateCheckIn(data);
    };

    // Khi xe rời trạm → Tắt check-in
    const handleBusDeparted = (data) => {
      console.log('[RouteTrackingContext] bus:departed_from_station:', data);
      deactivateCheckIn();
    };

    onBusArrived(handleBusArrived);
    onBusDeparted(handleBusDeparted);

    return () => {
      offEvent('bus:arrived_at_station');
      offEvent('bus:departed_from_station');
      console.log('[RouteTrackingContext] Đã cleanup bus event listeners');
    };
  }, [isTracking, activateCheckIn, deactivateCheckIn]);

  // === Cleanup on unmount ===
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      pollCleanupRef.current();
      // Leave room on unmount
      if (joinedRoomRef.current) {
        leaveTripRoom(joinedRoomRef.current);
        console.log('[RouteTrackingContext] Left room on unmount:', joinedRoomRef.current);
      }
    };
  }, []);

  return (
    <RouteTrackingContext.Provider
      value={{
        // State
        isTracking,
        isCheckingIn,
        currentStationIndex,
        stationTimer,
        isStationActive,
        lastStoppedState,
        currentTripId,
        notifications,
        messages,

        // Actions
        startTracking,
        stopTracking,
        syncDataFromBackend,
        activateCheckIn,
        deactivateCheckIn,
      }}
    >
      {children}
    </RouteTrackingContext.Provider>
  );
};

export default RouteTrackingContext;