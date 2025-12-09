// // src/main.jsx
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
// import App from './App';
// import './index.css';
// import 'leaflet/dist/leaflet.css';
// import './fixLeafletIcon';
// import AuthProvider from './context/AuthProvider';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <AuthProvider>
//         <App />
//       </AuthProvider>
//     </BrowserRouter>
//   </React.StrictMode>
// );
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';
import './fixLeafletIcon';

// Providers
import AuthProvider from './context/AuthProvider';
import { RouteTrackingProvider } from './context/RouteTrackingContext';

// --- Sửa lỗi TypeScript: document.getElementById('root')! ---
// Cách 1: Dùng non-null assertion (đã dùng) → OK
// Cách 2: Kiểm tra null (an toàn hơn, tránh crash nếu root không tồn tại)
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Không tìm thấy element #root trong HTML. Vui lòng kiểm tra index.html');
}

// createRoot nhận HTMLElement → không còn lỗi ts(8013)
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* AuthProvider phải bao ngoài để RouteTrackingProvider dùng được getCurrentUser() */}
      <AuthProvider>
        {/* RouteTrackingProvider cần token + user → nằm trong AuthProvider */}
        <RouteTrackingProvider>
          <App />
        </RouteTrackingProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);