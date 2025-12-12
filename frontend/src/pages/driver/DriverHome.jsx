// src/pages/driver/DriverHome.jsx
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
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

import RouteMapWithBackend from '../../components/maps/RouteMapWithBackend';
import FaceIDCheckin from '../../components/driver/FaceIDCheckin';
import { useRouteTracking } from '../../context/RouteTrackingContext';
import { getMySchedule, getTrip, transformTripToUIFormat, checkIn, markAsAbsent } from '../../services/tripService';
import {
  connectSocket,
  joinTripRoom,
  removeAllTripListeners,
  onStudentsMarkedAbsent,
  onBusApproaching,
  onBusArrived,
  onBusDeparted,
  onBusLocationChanged,
  onAlertNew,
  onTripError,
  onTripCompleted,
  emitStartTrip,
  emitEndTrip,
} from '../../services/socketService';

export default function DriverHome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tripData, setTripData] = useState(null);
  const [apiStations, setApiStations] = useState([]);
  const [socketAlert, setSocketAlert] = useState(null); // For toast notifications

  const {
    isTracking,
    stationTimer = 0,
    isStationActive = false,
    startTracking,
    stopTracking,
    lastStoppedState,
    // Context sẽ có hàm init nếu bạn dùng (khuyến khích)
    initializeTracking,
  } = useRouteTracking();

  // ✅ Derive tripCompleted from backend status - persists after refresh!
  const tripCompleted = tripData?.status === 'COMPLETED';

  // Tính toán trạng thái - CHỈ dùng tripData từ API (không fallback mock)
  const effectiveStations = apiStations; // Chỉ dùng API data
  const effectiveTotalStudents = tripData?.totalStudents || 0;
  const effectiveCompletedStudents = tripData?.completedStudents || 0;

  // When trip is completed, show as last station index to display "n/n"
  const effectiveCurrentStationIdx = tripCompleted
    ? apiStations.length - 1  // Last station when completed
    : (tripData?.nextStationIndex ?? 0); // Normal flow

  const effectiveCurrentStation = effectiveStations[effectiveCurrentStationIdx] || null;

  // Memoize stops array để tránh re-render không cần thiết
  const memoizedStops = useMemo(() => {
    return apiStations.map(s => ({
      id: s.id,
      name: s.name,
      position: s.position,
      time: s.time,
    }));
  }, [apiStations]);

  // Students tại trạm hiện tại - Lấy trực tiếp từ station.students
  const studentsAtCurrentStation = useMemo(() => {
    // Ưu tiên lấy từ station.students (đã được map trong tripService)
    if (effectiveCurrentStation?.students?.length > 0) {
      console.log('[DriverHome] Using station.students:', effectiveCurrentStation.students.length);
      return effectiveCurrentStation.students;
    }

    // Fallback: filter từ tripData.students nếu station.students không có
    if (!tripData?.students) {
      console.log('[DriverHome] No tripData.students');
      return [];
    }

    if (!effectiveCurrentStation) {
      console.log('[DriverHome] No effectiveCurrentStation');
      return [];
    }

    const currentStationId = String(effectiveCurrentStation.id);
    console.log('[DriverHome] Current station ID:', currentStationId);

    // Filter students by stationId - KHÔNG fallback nếu không có học sinh
    const filtered = tripData.students.filter(s => String(s.stationId) === currentStationId);
    console.log('[DriverHome] Students at current station:', filtered.length);

    // Trả về empty nếu trạm không có học sinh
    return filtered;
  }, [tripData?.students, effectiveCurrentStation]);

  const checkedCount = studentsAtCurrentStation.filter(
    s => s.status === 'PICKED_UP' || s.status === 'DROPPED_OFF'
  ).length;
  const totalAtStation = studentsAtCurrentStation.length;
  const allChecked = totalAtStation > 0 && checkedCount === totalAtStation;
  const isWaitingToStartCheckIn = isStationActive && stationTimer === 0;
  const isCheckingIn = isStationActive && stationTimer > 0;
  const isMoving = isTracking && !isStationActive && !isCheckingIn;

  // Hàm refresh tripData từ API
  const refreshTripData = async () => {
    if (!tripData?.id) return;
    try {
      console.log('[DriverHome] 🔄 Refreshing trip data...');
      const tripDetail = await getTrip(tripData.id);
      if (tripDetail) {
        const transformed = transformTripToUIFormat(tripDetail);
        setTripData(transformed);
        // ✅ IMPORTANT: Also refresh stations to update student status
        const stations = transformed?.stations || [];
        if (stations.length > 0) {
          setApiStations(stations);
        }
        console.log('[DriverHome] ✅ Trip data refreshed successfully');
      }
    } catch (err) {
      console.error('[DriverHome] Refresh trip data failed:', err);
    }
  };

  // Hàm check-in học sinh - gọi API thực và refresh data
  const handleCheckIn = async (studentId) => {
    if (!tripData?.id) {
      console.error('[DriverHome] No tripId for check-in');
      return;
    }

    try {
      console.log('[DriverHome] 👦 Checking in student:', studentId);

      // Call API
      await checkIn(tripData.id, {
        studentId,
        stationId: effectiveCurrentStation?.id,
      });

      console.log('[DriverHome] ✅ Check-in API success');

      // ✅ IMPORTANT: Refresh trip data to get updated student status
      await refreshTripData();

      // Show success notification
      setSocketAlert({
        type: 'success',
        message: '✅ Check-in thành công!'
      });

      // Auto-hide after 2 seconds
      setTimeout(() => setSocketAlert(null), 2000);

    } catch (err) {
      console.error('[DriverHome] Check-in failed:', err);
      setSocketAlert({
        type: 'error',
        message: 'Check-in thất bại: ' + (err.message || 'Lỗi không xác định')
      });
    }
  };

  // Hàm đánh dấu vắng - gọi API thực và refresh data
  const handleMarkAbsent = async (studentId) => {
    if (!tripData?.id) {
      console.error('[DriverHome] No tripId for mark absent');
      return;
    }
    try {
      await markAsAbsent(tripData.id, studentId);
      console.log('[DriverHome] Mark absent success for student:', studentId);
      // Refresh tripData để lấy status mới từ server
      await refreshTripData();
    } catch (err) {
      console.error('[DriverHome] Mark absent failed:', err);
      setSocketAlert({ type: 'error', message: 'Đánh dấu vắng thất bại: ' + (err.message || 'Lỗi không xác định') });
    }
  };

  // Tự động fetch lịch trình và chi tiết trip khi vào trang
  // Có caching trong localStorage để tránh gọi API liên tục
  // CACHE_VERSION: Tăng khi cấu trúc data thay đổi để invalidate cache cũ
  const CACHE_VERSION = 3; // v3: debug logs cho station matching

  useEffect(() => {
    const initSchedule = async () => {
      try {
        setLoading(true);
        setError(null);

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const routeCacheKey = `driver_route_cache_${today}`;
        const tripCacheKey = `driver_trip_${today}`;
        const cacheExpiry = 5 * 60 * 1000; // ✅ 5 phút (giảm từ 30 phút)

        let usedCache = false;

        // 1. Kiểm tra cache từ login prefetch (ưu tiên cao nhất)
        const routeCache = localStorage.getItem(routeCacheKey);
        if (routeCache) {
          try {
            const { routeData, activeTrip, timestamp, version } = JSON.parse(routeCache);
            // Kiểm tra version và expiry
            if (Date.now() - timestamp < cacheExpiry && routeData && version === CACHE_VERSION) {
              console.log('[DriverHome] ✅ Using cache (will refresh in background)');

              // Tạo map studentStops -> stationId
              const stationStudentsMap = {};
              (activeTrip?.studentStops || []).forEach(ss => {
                const stationId = String(ss.stationId?._id || ss.stationId);
                if (!stationStudentsMap[stationId]) {
                  stationStudentsMap[stationId] = [];
                }
                stationStudentsMap[stationId].push({
                  id: ss.studentId?._id || ss.studentId,
                  name: ss.studentId?.name || 'N/A',
                  grade: ss.studentId?.grade || '',
                  status: ss.action || 'PENDING',
                  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${ss.studentId?._id || ss.studentId}`
                });
              });

              // Transform routeData sang format cần thiết
              const transformed = {
                id: activeTrip?._id,
                routeName: routeData.routeName,
                routeShape: routeData.shape,
                status: activeTrip?.status, // ← IMPORTANT: Include status from cache
                stations: routeData.stops?.map((stop, idx) => {
                  const stationId = String(stop._id);
                  return {
                    id: stationId,
                    name: stop.name,
                    position: stop.address?.location?.coordinates
                      ? [stop.address.location.coordinates[1], stop.address.location.coordinates[0]]
                      : null,
                    order: idx,
                    students: stationStudentsMap[stationId] || []
                  };
                }) || [],
                students: (activeTrip?.studentStops || []).map(ss => ({
                  id: ss.studentId?._id || ss.studentId,
                  name: ss.studentId?.name || 'N/A',
                  stationId: String(ss.stationId?._id || ss.stationId),
                  status: ss.action || 'PENDING'
                })),
                totalStudents: activeTrip?.studentStops?.length || 0,
                distance: routeData.distance,
                duration: routeData.duration,
                nextStationIndex: activeTrip?.nextStationIndex || 0,
              };

              setTripData(transformed);
              setApiStations(transformed.stations);
              if (initializeTracking && activeTrip) {
                initializeTracking(activeTrip);
              }
              setLoading(false); // ← Show UI instantly!
              usedCache = true;
              // ⚠️ Don't return - continue to fetch fresh data below
            } else if (version !== CACHE_VERSION) {
              console.log('[DriverHome] Cache version mismatch, clearing...');
              localStorage.removeItem(routeCacheKey);
            }
          } catch (e) {
            console.warn('[DriverHome] Route cache parse failed');
          }
        }

        // 2. Kiểm tra cache cũ (driver_trip) - CẦN version check
        if (!usedCache) {
          const tripCache = localStorage.getItem(tripCacheKey);
          if (tripCache) {
            try {
              const { data, timestamp, version } = JSON.parse(tripCache);
              // Chỉ dùng cache nếu version khớp
              if (Date.now() - timestamp < cacheExpiry && version === CACHE_VERSION) {
                console.log('[DriverHome] ✅ Using trip cache (will refresh in background)');
                setTripData(data.tripData);
                setApiStations(data.apiStations || []);
                if (initializeTracking && data.activeTrip) {
                  initializeTracking(data.activeTrip);
                }
                setLoading(false); // ← Show UI instantly!
                usedCache = true;
                // ⚠️ Don't return - continue to fetch fresh data
              } else {
                console.log('[DriverHome] Trip cache outdated, clearing...');
                localStorage.removeItem(tripCacheKey);
              }
            } catch (e) {
              console.warn('[DriverHome] Trip cache parse failed');
              localStorage.removeItem(tripCacheKey);
            }
          }
        }

        // 3. ✅ ALWAYS fetch fresh data (stale-while-revalidate)
        console.log('[DriverHome] 🔄 Fetching fresh data from API...');

        // 3.1. Lấy danh sách trips hôm nay
        const schedule = await getMySchedule();
        console.log('[DriverHome] Schedule loaded:', schedule?.length, 'trips');

        if (!schedule || schedule.length === 0) {
          if (!usedCache) {
            setError('Không có lịch trình hôm nay.');
            setLoading(false);
          }
          return;
        }

        // 3.2. Sắp xếp trips theo ưu tiên status:
        // 1. IN_PROGRESS (đang chạy) - ưu tiên cao nhất
        // 2. NOT_STARTED (chưa bắt đầu)
        // 3. COMPLETED (đã hoàn thành) - ưu tiên thấp nhất
        const statusPriority = {
          'IN_PROGRESS': 1,
          'NOT_STARTED': 2,
          'COMPLETED': 3
        };

        const sortedTrips = [...schedule].sort((a, b) => {
          const priorityA = statusPriority[a.status] || 99;
          const priorityB = statusPriority[b.status] || 99;
          return priorityA - priorityB;
        });

        // Lấy trip có ưu tiên cao nhất
        const activeTrip = sortedTrips[0];

        if (activeTrip?._id) {
          // 3.3. Gọi getTrip để lấy full details (routeId.shape, orderedStops, studentStops)
          console.log('[DriverHome] Fetching trip details for:', activeTrip._id);
          const tripDetail = await getTrip(activeTrip._id);

          if (tripDetail) {
            // 3.4. Transform sang UI format
            const transformed = transformTripToUIFormat(tripDetail);
            setTripData(transformed); // ← Update with fresh data
            console.log('[DriverHome] ✅ Fresh data loaded, status:', transformed.status);

            // 3.5. Set stations từ API
            const stations = transformed?.stations || [];
            if (stations.length > 0) {
              setApiStations(stations);
            }

            // 3.6. Lưu vào cache với version
            localStorage.setItem(tripCacheKey, JSON.stringify({
              data: { tripData: transformed, apiStations: stations, activeTrip },
              timestamp: Date.now(),
              version: CACHE_VERSION
            }));
            console.log('[DriverHome] Trip data cached');
          }

          // Vẫn gọi initializeTracking nếu context cần
          if (initializeTracking && !usedCache) {
            initializeTracking(activeTrip);
          }
        }
      } catch (err) {
        console.error('[DriverHome] Lỗi tải dữ liệu:', err);
        if (!tripData) { // Only show error if no cached data
          setError('Không thể tải lịch trình.');
        }
      } finally {
        setLoading(false);
      }
    };

    initSchedule();
  }, []); // ← Run once on mount

  // === Socket.IO: Lắng nghe sự kiện real-time ===
  // Lưu ý: joinTripRoom đã được gọi trong RouteTrackingContext
  // Ở đây chỉ đăng ký listeners cho events cụ thể của DriverHome
  const socketListenersSetRef = useRef(false);

  useEffect(() => {
    if (!tripData?.id) return;
    if (socketListenersSetRef.current) return; // Đã set listeners rồi, không set lại

    const socket = connectSocket();
    if (!socket) {
      console.warn('[DriverHome] Không thể kết nối Socket.IO');
      return;
    }

    // Không join room ở đây - RouteTrackingContext đã làm
    console.log('[DriverHome] Đăng ký socket listeners cho trip:', tripData.id);

    // Lắng nghe học sinh bị đánh dấu vắng
    onStudentsMarkedAbsent((data) => {
      console.log('[Socket] trip:students_marked_absent:', data);
      setSocketAlert({ type: 'warning', message: `${data.count || 1} học sinh được đánh dấu vắng` });
      // Refresh tripData
      getTrip(tripData.id).then(detail => {
        if (detail) setTripData(transformTripToUIFormat(detail));
      });
    });

    // Lắng nghe xe sắp tới trạm
    onBusApproaching((data) => {
      console.log('[Socket] bus:approaching_station:', data);
      setSocketAlert({ type: 'info', message: `Sắp tới trạm: ${data.stationName || 'Trạm tiếp theo'}` });
    });

    // Lắng nghe xe đã tới trạm
    onBusArrived((data) => {
      console.log('[Socket] bus:arrived_at_station:', data);
      setSocketAlert({ type: 'success', message: `Đã tới trạm: ${data.stationName || ''}` });
    });

    // Lắng nghe xe rời trạm
    onBusDeparted((data) => {
      console.log('[Socket] bus:departed_from_station:', data);
      setSocketAlert({ type: 'info', message: 'Xe đã rời trạm, đang di chuyển...' });
    });

    // Lắng nghe cảnh báo mới
    onAlertNew((data) => {
      console.log('[Socket] alert:new:', data);
      setSocketAlert({ type: 'error', message: data.message || 'Có cảnh báo mới' });
    });

    // Lắng nghe cập nhật vị trí xe - Cập nhật nextStationIndex
    onBusLocationChanged((data) => {
      console.log('[Socket] bus:location_changed:', data);
      // Backend gửi: { coords, nextStationIndex, totalStations }
      if (data.nextStationIndex !== undefined) {
        setTripData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            nextStationIndex: data.nextStationIndex,
          };
        });
        console.log('[DriverHome] Updated nextStationIndex:', data.nextStationIndex);
      }
    });

    // Lắng nghe lỗi trip (VD: cố kết thúc trip khi chưa tới trạm cuối)
    onTripError((errorMessage) => {
      console.log('[Socket] trip:error:', errorMessage);
      setSocketAlert({
        type: 'error',
        message: errorMessage || 'Lỗi xử lý chuyến đi'
      });
    });

    // Lắng nghe khi trip hoàn thành thành công (backend confirm)
    onTripCompleted((data) => {
      console.log('[Socket] trip:completed:', data);
      stopTracking();
      // ✅ REMOVED setTripCompleted - derive from backend status instead
      setSocketAlert({ type: 'success', message: 'Đã hoàn thành chuyến đi!' });
      // Refresh trip data để cập nhật status COMPLETED từ backend
      refreshTripData();
    });

    socketListenersSetRef.current = true;

    return () => {
      removeAllTripListeners();
      socketListenersSetRef.current = false;
      console.log('[DriverHome] Đã cleanup socket listeners');
    };
  }, [tripData?.id]);

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

  if (error && !tripData) {
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
      {/* TOAST NOTIFICATION */}
      {socketAlert && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-xl text-white font-medium flex items-center gap-3 animate-pulse ${socketAlert.type === 'success' ? 'bg-green-500' :
            socketAlert.type === 'warning' ? 'bg-yellow-500' :
              socketAlert.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}
          onClick={() => setSocketAlert(null)}
        >
          <AlertCircle className="w-5 h-5" />
          {socketAlert.message}
          <button className="ml-2 text-white/80 hover:text-white" onClick={() => setSocketAlert(null)}>✕</button>
        </div>
      )}

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
                      {tripCompleted
                        ? `${effectiveStations.length}/${effectiveStations.length}`
                        : (effectiveCurrentStation ? effectiveCurrentStation.name : 'Chưa xuất phát')
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* TRẠNG THÁI */}
              <div
                className={`px-4 py-2 rounded-lg text-sm font-bold shadow-lg ${isMoving ? 'bg-emerald-500' :
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

              {/* NÚT BẮT ĐẦU - Chỉ hiện khi chưa bắt đầu */}
              {!tripCompleted && !isTracking && (
                <button
                  onClick={() => {
                    if (tripData?.id) emitStartTrip(tripData.id);
                    startTracking();
                  }}
                  disabled={loading || !tripData?.id}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-lg shadow-2xl transition-all transform hover:scale-105 disabled:opacity-70 bg-gradient-to-r from-green-500 to-emerald-600"
                >
                  <PlayCircle className="w-8 h-8" />
                  BẮT ĐẦU
                </button>
              )}

              {/* NÚT HOÀN THÀNH CHUYẾN */}
              {isTracking && !tripCompleted && (
                <button
                  onClick={() => {
                    if (tripData?.id) {
                      // Chỉ emit event, đợi backend confirm qua trip:completed
                      // Nếu backend từ chối (chưa tới trạm cuối), sẽ emit trip:error
                      emitEndTrip(tripData.id);
                      console.log('[DriverHome] Đã gửi yêu cầu kết thúc chuyến đi');
                    }
                  }}
                  disabled={
                    !tripData?.id ||
                    (isCheckingIn && totalAtStation > 0)  // Chỉ disable nếu đang check-in VÀ có học sinh
                  }
                  className="flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-lg shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-500 to-indigo-600"
                >
                  <CheckCircle className="w-8 h-8" />
                  HOÀN THÀNH
                </button>
              )}

              {/* Hiển thị khi đã hoàn thành */}
              {tripCompleted && (
                <div className="flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-lg bg-green-100 text-green-800 border-2 border-green-500">
                  <CheckCircle className="w-8 h-8" />
                  ĐÃ HOÀN THÀNH
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* THỐNG KÊ NHANH */}
        <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Thống kê chuyến đi</h3>
            <span className="text-sm text-gray-500">{effectiveStations.length} điểm dừng</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-100">
              <Users className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Tổng học sinh</div>
              <div className="text-2xl font-bold text-indigo-700">
                {effectiveTotalStudents}
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
              <UserCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Đã lên xe</div>
              <div className="text-2xl font-bold text-green-700">{effectiveCompletedStudents}</div>
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
                {tripCompleted
                  ? `${effectiveStations.length}/${effectiveStations.length}`
                  : `${effectiveCurrentStationIdx + 1}/${effectiveStations.length}`
                }
              </div>
            </div>
          </div>
        </div>

        {/* BẢN ĐỒ - Real-time tracking */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-indigo-100">
          <div className="h-96">
            <RouteMapWithBackend
              center={apiStations[0]?.position || [10.7623, 106.7056]}
              stops={memoizedStops}
              routeShape={tripData?.routeShape}
              tripId={tripData?.id}
              isTracking={isTracking}
              currentStationIndex={effectiveCurrentStationIdx}
              tripCompleted={tripCompleted}
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
        {isTracking && isStationActive && effectiveCurrentStationIdx < effectiveStations.length - 1 && (
          <div className="bg-gradient-to-br from-purple-700 via-pink-600 to-red-600 text-white rounded-3xl shadow-2xl p-6 border-4 border-white">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold flex items-center justify-center gap-4">
                <Bus className="w-10 h-10 animate-bounce" />
                ĐANG DỪNG TẠI: {effectiveCurrentStation?.name?.toUpperCase() || 'TRẠM'}
              </h3>

              {isWaitingToStartCheckIn && (
                <div className="mt-4 flex items-center justify-center gap-3 text-2xl font-bold text-yellow-300">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  Chuẩn bị check-in...
                </div>
              )}

              {/* Timer removed per user request */}

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
                    {studentsAtCurrentStation.map(student => {
                      // Sử dụng status từ API thay vì mock studentCheckIns
                      const isCheckedIn = student.status === 'PICKED_UP' || student.status === 'DROPPED_OFF';
                      const isAbsent = student.status === 'ABSENT';
                      const isPending = student.status === 'PENDING' || !student.status;

                      return (
                        <div
                          key={student.id}
                          className={`p-4 rounded-2xl text-center border-4 transition-all transform hover:scale-105 ${isCheckedIn
                            ? 'bg-green-600 border-green-400 shadow-lg'
                            : isAbsent
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

                          {isPending && (
                            <div className="space-y-2">
                              <button
                                onClick={() => handleCheckIn(student.id)}
                                className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg text-sm shadow-lg"
                              >
                                CÓ MẶT
                              </button>
                              <FaceIDCheckin
                                student={student}
                                onCheckIn={handleCheckIn}
                                isCheckedIn={false}
                                tripId={tripData?.id}
                                stationId={effectiveCurrentStation?.id}
                              />
                              <button
                                onClick={() => handleMarkAbsent(student.id)}
                                className="w-full py-1 text-xs bg-red-500 hover:bg-red-600 rounded"
                              >
                                Vắng
                              </button>
                            </div>
                          )}

                          {isCheckedIn && <CheckCircle className="w-10 h-10 mx-auto mt-3" />}
                          {isAbsent && <XCircle className="w-10 h-10 mx-auto mt-3" />}
                        </div>
                      );
                    })}
                  </div>
                )}


              </div>
            )}
          </div>
        )}

        {/* DANH SÁCH TRẠM - Dùng dữ liệu từ API */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 border-4 border-gray-200">
          <h3 className="text-xl font-bold text-center mb-6 text-gray-800">
            Lộ trình hôm nay ({effectiveStations.length} trạm)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {effectiveStations.map((s, i) => (
              <div
                key={s.id}
                className={`p-5 rounded-2xl text-center font-bold transition-all shadow-md ${tripCompleted
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white' // Tất cả trạm màu xanh khi hoàn thành
                  : i < effectiveCurrentStationIdx
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                    : i === effectiveCurrentStationIdx
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white scale-110 shadow-2xl'
                      : 'bg-gray-100 text-gray-600'
                  }`}
              >
                <div className="text-2xl mb-1">{i + 1}</div>
                <div className="text-sm">{s.name}</div>
                <div className="text-xs opacity-80 mt-1">{s.time || '--:--'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div >
  );
}