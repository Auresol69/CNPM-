// src/hooks/useDriverData.js
import { useCallback, useEffect, useState } from 'react';
import { getMySchedule, getTripStudents } from '../services/tripService';
import { getMe } from '../services/userService';

/**
 * Custom hook để lấy dữ liệu cho tài xế
 * Bao gồm: lịch trình hôm nay, danh sách học sinh, thông tin xe
 */
export const useDriverData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [students, setStudents] = useState([]);
  const [trip, setTrip] = useState(null);
  const [driver, setDriver] = useState(null);

  const fetchDriverSchedule = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy thông tin driver
      const driverData = await getMe();
      setDriver(driverData);

      // Lấy lịch trình hôm nay
      const scheduleData = await getMySchedule();
      setSchedule(scheduleData.schedule);
      setTrip(scheduleData.trip);

      // Nếu có trip, lấy danh sách học sinh
      if (scheduleData.trip?._id) {
        const studentsData = await getTripStudents(scheduleData.trip._id);
        setStudents(studentsData);
      }

    } catch (err) {
      console.error('Error fetching driver data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDriverSchedule();
  }, [fetchDriverSchedule]);

  const refreshData = () => {
    fetchDriverSchedule();
  };

  return {
    loading,
    error,
    schedule,
    trip,
    students,
    driver,
    refreshData
  };
};

export default useDriverData;
