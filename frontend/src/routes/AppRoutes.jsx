// src/routes/AppRoutes.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import ParentLayout from "../components/layout/ParentLayout";
// --- Lazy loaded pages (one import per file) ---
// Parent pages
const ParentDashboard = lazy(() => import("../pages/parent/ParentDashboard"));
const ParentTracking = lazy(() => import("../pages/parent/ParentTracking"));
const ParentNotifications = lazy(() => import("../pages/parent/ParentNotifications"));
const ParentProfile = lazy(() => import("../pages/parent/ParentProfile"));
const ParentSettings = lazy(() => import("../pages/parent/ParentSettings"));
const Login_Parents = lazy(() => import("../pages/parent/Login_Parents"));

// Driver pages
const DriverDashboard = lazy(() => import("../pages/driver/DriverDashboard"));
const DriverFeatures = lazy(() => import("../pages/driver/DriverFeatures"));
const DriverContacts = lazy(() => import("../pages/driver/DriverContacts"));
const DriverDailySchedule = lazy(() => import("../pages/driver/DriverDailySchedule"));
const DriverOperations = lazy(() => import("../pages/driver/DriverOperations"));

// Manager pages
const ManagerDashboard = lazy(() => import("../pages/manager/ManagerDashboard"));
const ManagerFeatures = lazy(() => import("../pages/manager/ManagerFeatures"));
const ManagerContacts = lazy(() => import("../pages/manager/ManagerContacts"));
const Reports = lazy(() => import("../pages/manager/Reports"));
const CatalogManagement = lazy(() => import("../pages/manager/CatalogManagement"));
const ScheduleManagement = lazy(() => import("../pages/manager/ScheduleManagement"));
const BusTracking = lazy(() => import("../pages/manager/BusTracking"));
const SendNotifications = lazy(() => import("../pages/manager/SendNotifications"));

// Optional: a simple fallback while pages load
const Loader = () => (
  <div className="w-full h-64 flex items-center justify-center">
    <div className="text-sm text-gray-500">Loading...</div>
  </div>
);

/**
 * AppRoutes - wraps all application routes
 * - Uses a PageLayout at root which should contain an <Outlet />
 * - Nested routes for each role group
 */
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Standalone Parent Login */}
          <Route path="/parent/login" element={<Login_Parents />} />

          {/* Parent routes with dedicated layout */}
          <Route path="/parent" element={<ParentLayout />}>
            <Route path="" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ParentDashboard />} />
            <Route path="tracking" element={<ParentTracking />} />
            <Route path="notifications" element={<ParentNotifications />} />
            <Route path="profile" element={<ParentProfile />} />
            <Route path="settings" element={<ParentSettings />} />
          </Route>

          {/* Root layout for other roles or generic pages */}
          <Route path="/" element={<PageLayout />}>
            {/* path="" => simple landing or redirect to /parent/dashboard (adjust as desired) */}
            <Route
              path=""
              element={<Navigate to="/parent/login" replace />}
            />

            {/* Driver routes */}
            <Route path="driver">
              <Route path="" element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DriverDashboard />} />
              <Route path="features" element={<DriverFeatures />} />
              <Route path="contacts" element={<DriverContacts />} />
              <Route path="daily-schedule" element={<DriverDailySchedule />} />
              <Route path="operations" element={<DriverOperations />} />
            </Route>

            {/* Manager routes */}
            <Route path="manager">
              <Route path="" element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="features" element={<ManagerFeatures />} />
              <Route path="contacts" element={<ManagerContacts />} />
              <Route path="reports" element={<Reports />} />
              <Route path="catalog" element={<CatalogManagement />} />
              <Route path="schedules" element={<ScheduleManagement />} />
              <Route path="bus-tracking" element={<BusTracking />} />
              <Route
                path="send-notifications"
                element={<SendNotifications />}
              />
            </Route>

            {/* Fallback for unknown nested path */}
            <Route
              path="*"
              element={<div className="p-8">Trang không tồn tại (404)</div>}
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
