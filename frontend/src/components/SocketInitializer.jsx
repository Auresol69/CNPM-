// src/components/SocketInitializer.jsx
import { useEffect } from 'react';
import { connectSocket } from '../services/socketService';
import { isAuthenticated } from '../services/authService';

/**
 * Component để tự động kết nối socket khi app load
 * Chỉ connect nếu user đã đăng nhập
 */
export default function SocketInitializer() {
    useEffect(() => {
        // Kiểm tra nếu user đã đăng nhập
        if (isAuthenticated()) {
            console.log('[SocketInitializer] User authenticated → Connecting socket...');
            connectSocket();
        } else {
            console.log('[SocketInitializer] User not authenticated → Skip socket connection');
        }
    }, []); // Chỉ chạy 1 lần khi mount

    return null; // Component này không render gì
}
