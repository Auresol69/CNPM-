// // src/components/layout/Header.jsx
// import React from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { Bell, LogOut, User } from 'lucide-react';

// export default function Header() {
//   const { user, logout } = useAuth();

//   if (!user) return null; // Ẩn header ở trang login

//   return (
//     <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 border-b border-gray-200">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
//               S
//             </div>
//             <div>
//               <div className="text-gray-900 font-bold text-lg">Safe to School</div>
//             </div>
//           </div>

//           <div className="flex items-center gap-4">
//             <button className="relative p-2 hover:bg-gray-100 rounded-full">
//               <Bell className="w-6 h-6 text-gray-600" />
//               <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
//             </button>

//             <div className="relative group">
//               <button className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg">
//                 <img
//                   src={user.avatar}
//                   alt={user.name}
//                   className="w-10 h-10 rounded-full ring-2 ring-indigo-600"
//                 />
//                 <span className="font-medium text-gray-700">{user.name}</span>
//               </button>

//               <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
//                 <div className="px-4 py-3 border-b">
//                   <div className="font-medium">{user.name}</div>
//                   <div className="text-sm text-gray-500 capitalize">{user.role === 'driver' ? 'Tài xế' : 'Quản lý'}</div>
//                 </div>
//                 <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2">
//                   <User className="w-4 h-4" /> Hồ sơ
//                 </button>
//                 <button
//                   onClick={logout}
//                   className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 flex items-center gap-2"
//                 >
//                   <LogOut className="w-4 h-4" /> Đăng xuất
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
// src/components/layout/Header.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Bell, LogOut, User } from 'lucide-react';
import { useRouteTracking } from '../../context/RouteTrackingContext';
import logo from '../../assets/logo.jpg';

export default function Header() {
  const { user, logout } = useAuth();
  const {
    isTracking,
    currentRoute,
    currentStation,
    isStationActive,
  } = useRouteTracking();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem('header_notifications');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // refs to detect transitions
  const prevIsTracking = useRef(isTracking);
  const prevIsStationActive = useRef(isStationActive);

  // compute unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // helper to push notification (persisted)
  const pushNotification = (title, body) => {
    const now = new Date();
    const item = {
      id: `${now.getTime()}-${Math.floor(Math.random() * 1000)}`,
      title,
      body,
      time: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setNotifications(prev => {
      const next = [item, ...prev].slice(0, 50); // cap size
      try { localStorage.setItem('header_notifications', JSON.stringify(next)); } catch (e) { /* ignore */ }
      return next;
    });
  };

  // mark all read when open menu
  useEffect(() => {
    if (open && unreadCount > 0) {
      setNotifications(prev => {
        const next = prev.map(n => ({ ...n, read: true }));
        try { localStorage.setItem('header_notifications', JSON.stringify(next)); } catch (e) { /* ignore */ }
        return next;
      });
    }
  }, [open, unreadCount]);

  // detect transitions for isTracking and station departure
  useEffect(() => {
    // isTracking: false -> true (bắt đầu tuyến)
    if (!prevIsTracking.current && isTracking) {
      const routeName = currentRoute?.name || 'tuyến';
      pushNotification('Xe bắt đầu tuyến', `Xe đã bắt đầu ${routeName}`);
    }
    // station departure: isStationActive true -> false => rời trạm
    if (prevIsStationActive.current && !isStationActive) {
      const stationName = currentStation?.name || 'một trạm';
      pushNotification('Đã rời trạm', `Xe đang rời ${stationName}`);
    }

    prevIsTracking.current = isTracking;
    prevIsStationActive.current = isStationActive;
  }, [isTracking, isStationActive, currentRoute, currentStation]);

  // click outside to close
  useEffect(() => {
    const onDoc = (e) => {
      if (!(e.target instanceof Element)) return;
      if (!e.target.closest('.header-bell-wrapper')) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  if (!user) return null; // Ẩn header ở trang login

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Safe to School Logo"
              className="w-14 h-14 rounded-lg object-cover"
            />
            <div>
              <div className="text-gray-900 font-bold text-lg">Safe to School</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative header-bell-wrapper">
              <button
                onClick={() => setOpen(v => !v)}
                className="relative p-2 hover:bg-gray-100 rounded-full"
                aria-label="Thông báo"
              >
                <Bell className="w-6 h-6 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-semibold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* dropdown */}
              {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-20">
                  <div className="px-4 py-3 border-b flex items-center justify-between">
                    <div className="font-medium">Thông báo</div>
                    <div className="text-xs text-gray-500">{notifications.length} mục</div>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">Chưa có thông báo</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`px-4 py-3 border-b hover:bg-gray-50 ${n.read ? 'opacity-90' : 'bg-white'}`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-sm">{n.title}</div>
                              <div className="text-xs text-gray-600 mt-1">{n.body}</div>
                            </div>
                            <div className="text-xs text-gray-400 ml-3">{n.time}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-3 py-2 border-t flex items-center justify-between">
                    <button
                      onClick={() => {
                        setNotifications([]);
                        try { localStorage.removeItem('header_notifications'); } catch (e) { }
                      }}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      Xóa tất cả
                    </button>
                    <div className="text-xs text-gray-400">—</div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative group">
              <button className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full ring-2 ring-indigo-600"
                />
                <span className="font-medium text-gray-700">{user.name}</span>
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div className="px-4 py-3 border-b">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500 capitalize">{user.role === 'driver' ? 'Tài xế' : 'Quản lý'}</div>
                </div>
                <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2">
                  <User className="w-4 h-4" /> Hồ sơ
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
