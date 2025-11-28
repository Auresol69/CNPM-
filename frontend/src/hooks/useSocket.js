import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const useSocket = (eventHandlers) => {
  const socketRef = useRef();

  useEffect(() => {
    // Connect to socket
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      if (err.message === 'Authentication error') {
        console.warn('Vui lòng đăng nhập để kết nối socket.');
      }
    });

    // Register event handlers
    if (eventHandlers) {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        socketRef.current.on(event, handler);
      });
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [eventHandlers]);

  return socketRef.current;
};

export default useSocket;
