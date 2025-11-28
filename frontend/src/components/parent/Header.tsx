import React from 'react';
import { MenuIcon, BellIcon, SearchIcon, UserIcon } from './Icons';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 z-20 sticky top-0">
      {/* Left: Hamburger (Mobile) & Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick} 
          className="p-2 -ml-2 text-slate-600 lg:hidden hover:bg-slate-100 rounded-lg transition-colors"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
      </div>

      {/* Middle: Search (Hidden on small mobile) */}
      <div className="hidden md:block flex-1 max-w-md mx-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all shadow-sm"
            placeholder="Search student, route, or driver..."
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <BellIcon className="w-6 h-6" />
          <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* User Profile Snippet */}
        <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-slate-200">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-slate-900">Parent User</p>
            <p className="text-xs text-slate-500">ID: 123123</p>
          </div>
          <button className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center border-2 border-white shadow-sm text-brand-700 hover:bg-brand-200 transition-colors">
            <UserIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}