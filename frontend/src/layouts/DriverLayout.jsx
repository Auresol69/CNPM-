// src/layouts/DriverLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import DriverSidebar from '../components/driver/DriverSidebar';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function DriverLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header cố định */}
      <Header role="driver" />

      {/* Nội dung chính: có padding-top để tránh bị header đè */}
      <div className="flex flex-1 pt-16">
        <DriverSidebar />
        <main className="flex-1 pl-64 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer open={true} />
    </div>
  );
}
// // src/layouts/DriverLayout.jsx (chỉ phần menu cần sửa)
// import { NavLink } from 'react-router-dom';
// import { Map, Home, Users, Settings, AlertCircle } from 'lucide-react';

// const navItems = [
//   { to: "/driver", icon: Home, label: "Trang chủ" },
//   { to: "/driver/live-route", icon: Map, label: "Lộ trình trực tiếp" },
//   { to: "/driver/contacts", icon: Users, label: "Liên hệ" },
//   { to: "/driver/features", icon: Settings, label: "Tính năng" },
//   { to: "/driver/operations", icon: AlertCircle, label: "Thao tác nhanh" },
// ];

// <nav className="space-y-2">
//   {navItems.map(item => (
//     <NavLink
//       key={item.to}
//       to={item.to}
//       className={({ isActive }) =>
//         `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
//           isActive ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-gray-100'
//         }`
//       }
//     >
//       <item.icon className="w-5 h-5" />
//       <span className="font-medium">{item.label}</span>
//     </NavLink>
//   ))}
// </nav>