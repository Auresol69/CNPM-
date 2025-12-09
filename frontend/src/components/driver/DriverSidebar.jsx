// src/components/driver/DriverSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Phone, Calendar, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const menuItems = [
  { to: "/driver",             icon: Home,      label: "Tổng quan" },
  { to: "/driver/contacts",    icon: Phone,     label: "Danh bạ" },
  { to: "/driver/daily-schedule", icon: Calendar, label: "Lịch hôm nay" },
  { to: "/driver/operations",  icon: Settings,  label: "Thao tác nhanh" },
];

export default function DriverSidebar() {
  const { logout } = useAuth();

  return (
    <div className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-indigo-700 text-white p-4 flex flex-col z-40 overflow-y-auto">
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-center">TÀI XẾ XE BUÝT</h2>
        <p className="text-indigo-200 text-sm text-center mt-1">Hệ thống đưa đón học sinh</p>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/driver"} // active chính xác ở root
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-lg font-semibold'
                    : 'hover:bg-indigo-600'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-indigo-600">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-600 transition w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}