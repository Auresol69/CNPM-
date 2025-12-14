// // src/fixLeafletIcon.js
// import L from 'leaflet';
// import markerUrl from 'leaflet/dist/images/marker-icon.png';
// import markerRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// delete L.Icon.Default.prototype._getIconUrl;

// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerRetinaUrl,
//   iconUrl: markerUrl,
//   shadowUrl: markerShadow,
// });
// src/fixLeafletIcon.js
import L from 'leaflet';

// Fix lỗi icon không hiển thị trong React + Vite
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});