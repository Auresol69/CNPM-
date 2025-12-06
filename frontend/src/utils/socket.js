// // src/utils/socket.js
// import { io } from 'socket.io-client';

// const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

// export const socket = io(SOCKET_URL, {
//   autoConnect: false,
//   transports: ['websocket'],
//   reconnection: true,
//   reconnectionAttempts: 5,
//   reconnectionDelay: 1000,
// });

// socket.on('connect', () => console.log('Socket connected:', socket.id));
// socket.on('connect_error', (err) => console.error('Socket error:', err.message));

// export const connectSocket = () => socket.connected || socket.connect();
// export const disconnectSocket = () => socket.disconnect();
// src/utils/socket.js
import { io } from 'socket.io-client';

// Backend Socket.IO server đang chạy trên port 3000 (theo backend/index.js)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
});

// Connection events
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket disconnected:', reason);
});

socket.on('connect_error', (err) => {
  console.error('🔴 Socket connect error:', err.message);
});

// Bus location tracking events
socket.on('bus:location:update', (data) => {
  console.log('📍 Bus location update:', data);
});

// Driver events
socket.on('driver:approaching_station', (data) => {
  console.log('🚌 Driver approaching station:', data);
});

socket.on('driver:arrived_at_station', (data) => {
  console.log('✓ Driver arrived at station:', data);
});

socket.on('driver:departed_at_station', (data) => {
  console.log('🚀 Driver departed from station:', data);
});

// Notification events
socket.on('notification:new', (data) => {
  console.log('🔔 New notification:', data);
});

export default socket;