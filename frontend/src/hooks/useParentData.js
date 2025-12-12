// src/hooks/useParentData.js
import { useCallback, useEffect, useState } from 'react';
import { getMyNotifications } from '../services/notificationService';
// getMyStudents - API đã bị xóa

/**
 * Custom hook để lấy dữ liệu cho phụ huynh
 */
export const useParentData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]); // Giữ lại để tương thích
  const [notifications, setNotifications] = useState([]);

  const fetchParentData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Chỉ fetch notifications, students lấy từ trip data
      const notificationsData = await getMyNotifications().catch(() => []);
      setNotifications(notificationsData);

    } catch (err) {
      console.error('Error fetching parent data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParentData();
  }, [fetchParentData]);

  const refreshData = () => {
    fetchParentData();
  };

  return {
    loading,
    error,
    students,
    notifications,
    refreshData
  };
};

export default useParentData;

