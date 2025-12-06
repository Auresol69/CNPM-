// src/hooks/useParentData.js
import { useCallback, useEffect, useState } from 'react';
import { getMyNotifications } from '../services/notificationService';
import { getMyStudents } from '../services/studentService';

/**
 * Custom hook để lấy dữ liệu cho phụ huynh
 */
export const useParentData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const fetchParentData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch students và notifications song song
      const [studentsData, notificationsData] = await Promise.all([
        getMyStudents(),
        getMyNotifications().catch(() => []) // Không fail nếu notifications lỗi
      ]);

      setStudents(studentsData);
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
