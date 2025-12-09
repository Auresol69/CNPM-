// src/hooks/useSocket.js
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://smart-school-bus-api.onrender.com';

const useSocket = (eventHandlers) => {
  const socketRef = useRef();

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('⚠️ No token found - Socket connection may fail');
    }

    // Connect to socket
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        token: token, // Backend will check this
      },
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
      if (err.message.includes('Authentication') || err.message.includes('auth')) {
        console.warn('⚠️ Socket authentication failed - Please login again');
        console.log('🔍 Debug - Token present:', !!token);
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
