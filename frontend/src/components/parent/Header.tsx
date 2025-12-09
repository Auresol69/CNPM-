import { useNavigate } from 'react-router-dom';
import { MenuIcon, BellIcon, UserIcon } from './Icons';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  unreadCount?: number;
}

export default function Header({ title, onMenuClick, unreadCount = 0 }: HeaderProps) {
  const navigate = useNavigate();
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

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        {/* Notifications */}
        <button 
          onClick={() => navigate('/parent/notifications')}
          className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
        >
          <BellIcon className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
          )}
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