// src/hooks/useBusTracking.js
import { useCallback, useEffect, useState } from 'react';
import { useSocket } from './useSocket';

/**
 * Custom hook để theo dõi vị trí xe bus real-time
 * @param {string} busId - ID của xe bus cần theo dõi
 */
export const useBusTracking = (busId) => {
  const [busLocation, setBusLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const handleLocationUpdate = useCallback((data) => {
    if (busId && data.busId === busId) {
      setBusLocation({
        lat: data.latitude || data.lat,
        lng: data.longitude || data.lng,
        timestamp: data.timestamp || Date.now()
      });
      setLastUpdate(new Date());
    } else if (!busId) {
      // Nếu không có busId cụ thể, cập nhật tất cả
      setBusLocation({
        lat: data.latitude || data.lat,
        lng: data.longitude || data.lng,
        busId: data.busId,
        timestamp: data.timestamp || Date.now()
      });
      setLastUpdate(new Date());
    }
  }, [busId]);

  const { socket, connected } = useSocket({
    events: {
      'bus:location:update': handleLocationUpdate,
      'location:update': handleLocationUpdate, // Backward compatibility
    },
    onConnect: () => {
      console.log('🚌 Bus tracking connected');
      setIsTracking(true);
      
      // Join room cho bus cụ thể nếu có
      if (busId) {
        socket.emit('tracking:join', { busId });
      }
    },
    onDisconnect: () => {
      console.log('🚌 Bus tracking disconnected');
      setIsTracking(false);
    }
  });

  // Cleanup khi unmount hoặc busId thay đổi
  useEffect(() => {
    return () => {
      if (busId && socket.connected) {
        socket.emit('tracking:leave', { busId });
      }
    };
  }, [busId, socket]);

  // Emit vị trí hiện tại (cho driver)
  const updateLocation = useCallback((location) => {
    if (socket.connected) {
      socket.emit('bus:location:update', {
        busId,
        latitude: location.lat,
        longitude: location.lng,
        timestamp: Date.now()
      });
    }
  }, [socket, busId]);

  return {
    busLocation,
    isTracking: isTracking && connected,
    lastUpdate,
    updateLocation,
    connected
  };
};

export default useBusTracking;
