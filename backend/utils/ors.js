// utils/ors.js
// Hàm gọi ORS Directions API để lấy durations giữa các trạm
const axios = require('axios');

const ORS_API_KEY = process.env.ORS_API_KEY;
const ORS_URL = 'https://api.openrouteservice.org/v2/directions/driving-car';

/**
 * Lấy durations (giây) giữa các trạm theo thứ tự
 * @param {[{lat: number, lng: number}]} stops - Danh sách trạm (tọa độ)
 * @returns {Promise<number[]>} - Mảng durations (giây) giữa các trạm liên tiếp
 */
async function getDurationsBetweenStops(stops) {
  if (!ORS_API_KEY) throw new Error('ORS_API_KEY missing');
  if (!stops || stops.length < 2) throw new Error('Cần ít nhất 2 trạm');
  const coordinates = stops.map(s => [s.lng, s.lat]);
  const body = { coordinates };
  const res = await axios.post(ORS_URL, body, {
    headers: { 'Authorization': ORS_API_KEY }
  });
  // segments: [{distance, duration}] cho từng đoạn
  const segments = res.data.routes[0].segments;
  return segments.map(seg => seg.duration); // giây
}

module.exports = { getDurationsBetweenStops };