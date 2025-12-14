// src/hooks/useSocket.js
import { useEffect, useRef } from 'react';
import { socket } from '../utils/socket';

/**
 * Custom hook để quản lý Socket.IO connection
 * @param {Object} options - Configuration options
 * @param {Function} options.onConnect - Callback khi connect thành công
 * @param {Function} options.onDisconnect - Callback khi disconnect
 * @param {Object} options.events - Object với key là event name, value là callback
 */
export const useSocket = (options = {}) => {
  const { onConnect, onDisconnect, events = {} } = options;
  const isConnectedRef = useRef(false);

  useEffect(() => {
    // Connect socket nếu chưa connected
    if (!socket.connected && !isConnectedRef.current) {
      socket.connect();
      isConnectedRef.current = true;
    }

    // Setup event listeners
    if (onConnect) {
      socket.on('connect', onConnect);
    }

    if (onDisconnect) {
      socket.on('disconnect', onDisconnect);
    }

    // Register custom events
    Object.entries(events).forEach(([eventName, handler]) => {
      socket.on(eventName, handler);
    });

    // Cleanup
    return () => {
      if (onConnect) {
        socket.off('connect', onConnect);
      }
      if (onDisconnect) {
        socket.off('disconnect', onDisconnect);
      }
      Object.entries(events).forEach(([eventName, handler]) => {
        socket.off(eventName, handler);
      });
    };
  }, [onConnect, onDisconnect, events]);

  return {
    socket,
    connected: socket.connected,
    emit: (event, data) => socket.emit(event, data),
    disconnect: () => {
      socket.disconnect();
      isConnectedRef.current = false;
    }
  };
};

export default useSocket;
