// src/hooks/useManagerData.js
import { useCallback, useEffect, useState } from 'react';
import { getAllRoutes } from '../services/routeService';
import { getAllStations } from '../services/stationService';
import { getAllStudents } from '../services/studentService';
import { getAllTrips } from '../services/tripService';
import { getAllBuses } from '../services/vehicleService';

/**
 * Custom hook để lấy dữ liệu cho quản lý
 */
export const useManagerData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [stations, setStations] = useState([]);
  const [students, setStudents] = useState([]);

  const fetchManagerData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [tripsData, routesData, busesData, stationsData, studentsData] = await Promise.all([
        getAllTrips().catch(() => []),
        getAllRoutes().catch(() => []),
        getAllBuses().catch(() => []),
        getAllStations().catch(() => []),
        getAllStudents().catch(() => [])
      ]);

      setTrips(tripsData);
      setRoutes(routesData);
      setBuses(busesData);
      setStations(stationsData);
      setStudents(studentsData);

    } catch (err) {
      console.error('Error fetching manager data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManagerData();
  }, [fetchManagerData]);

  const refreshData = () => {
    fetchManagerData();
  };

  return {
    loading,
    error,
    trips,
    routes,
    buses,
    stations,
    students,
    refreshData
  };
};

export default useManagerData;
