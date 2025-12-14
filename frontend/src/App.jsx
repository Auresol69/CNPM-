// // import React from 'react';
// // import AppRoutes from './routes/AppRoutes';

// // export default function App() {
// //   return <AppRoutes />;
// // }
// // src/App.jsx
// import React from 'react';
// import { RouteTrackingProvider } from './context/RouteTrackingContext';
// import AppRoutes from './routes/AppRoutes';

// export default function App() {
//   return (
//     <RouteTrackingProvider>
//       <AppRoutes />
//     </RouteTrackingProvider>
//   );
// }
// src/App.jsx
import React from 'react';
import AppRoutes from './routes/AppRoutes';

// Không cần import RouteTrackingProvider ở đây nữa
// → Đã được wrap ở main.jsx

export default function App() {
  return <AppRoutes />;
}