// src/hooks/useNotifications.js
import { useCallback, useEffect, useState } from 'react';
import { getMyNotifications } from '../services/notificationService';
import { useSocket } from './useSocket';

/**
 * Custom hook để nhận thông báo real-time
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load notifications ban đầu
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getMyNotifications();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Handle new notification từ socket
  const handleNewNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Có thể thêm toast notification ở đây
    console.log('🔔 New notification received:', notification);
  }, []);

  useSocket({
    events: {
      'notification:new': handleNewNotification,
      'notification': handleNewNotification, // Backward compatibility
    }
  });

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n._id === notificationId || n.id === notificationId
          ? { ...n, isRead: true }
          : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  };
};

export default useNotifications;
