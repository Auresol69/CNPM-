import React from 'react';
import { NavLink } from 'react-router-dom';
import { BellIcon, MenuIcon } from './Icons';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  unreadCount?: number;
}

export default function Header({ title, onMenuClick, unreadCount = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-white shadow-sm border-b border-slate-200">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Menu Button (Mobile) */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <MenuIcon className="w-6 h-6 text-slate-600" />
        </button>

        {/* Page Title */}
        <h1 className="text-lg md:text-xl font-bold text-slate-800">{title}</h1>

        {/* Notifications */}
        <NavLink
          to="/parent/notifications"
          className="relative p-2 rounded-lg hover:bg-slate-100"
        >
          <BellIcon className="w-6 h-6 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </NavLink>
      </div>
    </header>
  );
}
