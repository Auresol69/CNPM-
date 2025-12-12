// src/services/mapService.js
// Helper functions để làm việc với backend ORS API

import api from '../api/apiClient';

/**
 * Lấy walking directions từ vị trí hiện tại đến trạm
 * @param {string} stationId - ID của trạm
 * @param {number} userLat - Vĩ độ hiện tại
 * @param {number} userLng - Kinh độ hiện tại
 * @returns {Promise<Object>} - { destination, distanceMeters, durationSeconds, shape, steps }
 */
export const getWalkingDirectionsToStation = async (stationId, userLat, userLng) => {
    try {
        const response = await api.get(`/stations/${stationId}/walking-directions`, {
            params: { lat: userLat, lng: userLng }
        });

        // Backend returns: { status: 'success', data: {...} }
        return response.data.data;
    } catch (error) {
        console.error('[MapService] getWalkingDirections failed:', error);
        throw new Error(error.response?.data?.message || 'Không thể tìm đường đi bộ');
    }
};

/**
 * Convert backend GeoJSON coordinates thành Leaflet format
 * Backend (ORS): [[lng, lat], [lng, lat], ...]
 * Leaflet: [[lat, lng], [lat, lng], ...]
 */
export const convertBackendCoordsToLeaflet = (coordinates) => {
    if (!Array.isArray(coordinates)) return [];
    return coordinates.map(coord => [coord[1], coord[0]]);
};

/**
 * Convert Leaflet coordinates thành backend format
 * Leaflet: [[lat, lng], [lat, lng], ...]
 * Backend (ORS): [[lng, lat], [lng, lat], ...]
 */
export const convertLeafletCoordsToBackend = (positions) => {
    if (!Array.isArray(positions)) return [];
    return positions.map(pos => [pos[1], pos[0]]);
};

export default {
    getWalkingDirectionsToStation,
    convertBackendCoordsToLeaflet,
    convertLeafletCoordsToBackend,
};
