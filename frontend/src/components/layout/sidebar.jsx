// // src/components/layout/Sidebar.jsx
// import React from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';

// export default function Sidebar({ className = '', open = true, role = 'driver' }) {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const menus = {
//     driver: [
//       { label: 'Tổng quan', path: '/driver/dashboard' },
//       { label: 'Tuyến xe', path: '/driver/features' },
//       { label: 'Lịch trình', path: '/driver/daily-schedule' },
//       { label: 'Học sinh', path: '/driver/contacts' },
//       { label: 'Vận hành', path: '/driver/operations' },
//     ],
//     parent: [
//       { label: 'Tổng quan', path: '/parent/dashboard' },
//       { label: 'Tính năng', path: '/parent/features' },
//       { label: 'Theo dõi', path: '/parent/tracking' },
//       { label: 'Thông báo', path: '/parent/notifications' },
//     ],
//     manager: [
//       { label: 'Dashboard', path: '/manager/dashboard' },
//       { label: 'Báo cáo', path: '/manager/reports' },
//       { label: 'Danh mục', path: '/manager/catalog' },
//       { label: 'Lịch trình', path: '/manager/schedules' },
//       { label: 'Theo dõi xe', path: '/manager/bus-tracking' },
//     ],
//   };

//   const items = menus[role] || [];

//   const isActivePath = (path) => {
//     return location.pathname === path || location.pathname.startsWith(path + '/');
//   };

//   // When closed, hide visually (but still accessible if needed)
//   return (
//     <aside
//       className={`fixed top-16 left-0 bottom-0 bg-white border-r overflow-auto transition-all duration-200
//         ${open ? 'w-64 block' : 'w-0 hidden'} ${className}`}
//       aria-hidden={!open}
//     >
//       <div className="h-full p-4">
//         <div className="text-sm text-gray-500 mb-4">Sản phẩm</div>

//         <ul className="space-y-1">
//           {items.map((it) => {
//             const active = isActivePath(it.path);
//             return (
//               <li key={it.path}>
//                 <button
//                   onClick={() => navigate(it.path)}
//                   className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition-colors
//                     ${active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}
//                   `}
//                 >
//                   <div className={`w-8 h-8 flex items-center justify-center rounded-md ${active ? 'bg-indigo-100' : 'bg-gray-100'}`}>
//                     <svg className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
//                     </svg>
//                   </div>
//                   <span className="text-sm">{it.label}</span>
//                 </button>
//               </li>
//             );
//           })}
//         </ul>

//         <div className="mt-6 p-3 bg-indigo-50 rounded-md">
//           <div className="text-xs text-indigo-700 font-semibold">Bạn đã sẵn sàng để bảo vệ con mình an toàn chưa?</div>
//           <div className="text-xs text-indigo-600 mt-1">Hãy cùng hàng ngàn phụ huynh và trường học tin tưởng sử dụng.</div>
//           <button className="mt-3 w-full rounded-md bg-indigo-600 text-white py-2 text-sm">Bắt đầu ngay hôm nay</button>
//         </div>
//       </div>
//     </aside>
//   );
// }
// src/components/layout/Sidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ className = '', open = true, role = 'driver' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menus = {
    driver: [
      { label: 'Tổng quan', path: '/driver' }, // use '/driver' index
      { label: 'Tuyến xe', path: '/driver/features' },
      { label: 'Lịch trình', path: '/driver/daily-schedule' },
      { label: 'Học sinh', path: '/driver/contacts' },
      { label: 'Vận hành', path: '/driver/operations' },
    ],
    // parent/manager omitted for brevity
  };

  const items = menus[role] || [];

  const isActivePath = (path) => {
    // treat '/driver' and '/driver/dashboard' as same base
    if (path === '/driver') {
      return location.pathname === '/driver' || location.pathname === '/driver/' || location.pathname === '/driver/dashboard';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 bg-white border-r overflow-auto transition-all duration-200
        ${open ? 'w-64 block' : 'w-0 hidden'} ${className}`}
      aria-hidden={!open}
    >
      <div className="h-full p-4">
        <div className="text-sm text-gray-500 mb-4">Sản phẩm</div>

        <ul className="space-y-1">
          {items.map((it) => {
            const active = isActivePath(it.path);
            return (
              <li key={it.path}>
                <button
                  onClick={() => navigate(it.path)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                    ${active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}
                  `}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-md ${active ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                    <svg className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>
                  <span className="text-sm">{it.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 p-3 bg-indigo-50 rounded-md">
          <div className="text-xs text-indigo-700 font-semibold">Bạn đã sẵn sàng để bảo vệ con mình an toàn chưa?</div>
          <div className="text-xs text-indigo-600 mt-1">Hãy cùng hàng ngàn phụ huynh và trường học tin tưởng sử dụng.</div>
          <button className="mt-3 w-full rounded-md bg-indigo-600 text-white py-2 text-sm">Bắt đầu ngay hôm nay</button>
        </div>
      </div>
    </aside>
  );
}
