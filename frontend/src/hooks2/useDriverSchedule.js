import { useState, useEffect } from 'react';
import { getMySchedule } from '../services/tripService';

// Mock data để fallback khi API fail
const MOCK_SCHEDULE = [
  {
    _id: '690bfa12846d9b9fe6521502',
    status: 'NOT_STARTED',
    tripDate: '2025-11-23T00:00:00.000Z',
    direction: 'PICK_UP',
    scheduleId: {
      _id: '690bfa12846d9b9fe6521503',
      routeId: {
        name: 'Tuyến SGU 01'
      }
    },
    busId: {
      licensePlate: '51B-123.45'
    }
  },
  {
    _id: '690bfa12846d9b9fe6521504',
    status: 'NOT_STARTED',
    tripDate: '2025-11-23T00:00:00.000Z',
    direction: 'DROP_OFF',
    scheduleId: {
      _id: '690bfa12846d9b9fe6521505',
      routeId: {
        name: 'Tuyến SGU 01'
      }
    },
    busId: {
      licensePlate: '51B-123.45'
    }
  }
];

/**
 * Hook để lấy lịch trình của tài xế
 * @returns {Object} { schedule, loading, error, refetch, isUsingMockData }
 */
export const useDriverSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsUsingMockData(false);
      console.log('📤 Fetching driver schedule from API...');
      const data = await getMySchedule();
      console.log('✅ Driver schedule loaded from API:', data);
      setSchedule(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error('❌ Error fetching schedule from API:', err);
      console.warn('⚠️ Using mock data as fallback...');
      setError(err.message || 'Không thể lấy lịch trình, sử dụng dữ liệu mẫu');
      setSchedule(MOCK_SCHEDULE);
      setIsUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  return {
    schedule,
    loading,
    error,
    refetch: fetchSchedule,
    isUsingMockData,
  };
};

export default useDriverSchedule;
