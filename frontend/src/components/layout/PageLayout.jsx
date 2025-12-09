// src/components/layout/PageLayout.jsx
import React, { useState } from 'react';
import Header from './header';
import Sidebar from './sidebar';
import Footer from './footer';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function PageLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth(); // requires AuthProvider in main.jsx
  const role = user?.role || 'driver';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onToggleSidebar={() => setSidebarOpen((s) => !s)} role={role} />

      <div className="flex flex-1 pt-16">
        <Sidebar open={sidebarOpen} role={role} />

        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer open={sidebarOpen} />
    </div>
  );
}
