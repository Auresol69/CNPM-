import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BusIcon, DashboardIcon, MapIcon, BellIcon, UserIcon, LogOutIcon } from '../parent/Icons';
import authService from '../../services/authService';
import Header from '../parent/Header';
import Footer from '../parent/Footer';

const SidebarItem = ({ to, icon: Icon, label, onClick }: { to: string; icon: any; label: string, onClick?: () => void }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
          isActive
            ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </NavLink>
  );
};

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.includes('dashboard')) return 'Dashboard';
    if (location.pathname.includes('tracking')) return 'Live Tracking';
    if (location.pathname.includes('notifications')) return 'Notifications';
    return 'School Bus';
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col shadow-xl lg:shadow-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <BusIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-none">SmartBus</h1>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-wide">Parent Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 py-6 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
          <SidebarItem to="/parent/dashboard" icon={DashboardIcon} label="Dashboard" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/parent/tracking" icon={MapIcon} label="Live Tracking" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/parent/notifications" icon={BellIcon} label="Notifications" onClick={() => setIsSidebarOpen(false)} />
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50/50">
          <button
            onClick={() => authService.logout()}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOutIcon className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Unified Header */}
        <Header title={getPageTitle()} onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto scroll-smooth bg-slate-50">
           <div className="min-h-full flex flex-col">
              {/* Page Content */}
              <div className="flex-1 p-4 md:p-6 lg:p-8">
                 <Outlet />
              </div>
              
              {/* Footer */}
              <Footer />
           </div>
        </main>
      </div>
    </div>
  );
}