// src/routes/AppRoutes.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import ParentLayout from "../components/layout/ParentLayout";
import DriverLayout from "../layouts/DriverLayout";

// --- Lazy loaded pages ---

// Parent pages
const ParentDashboard = lazy(() => import("../pages/parent/ParentDashboard"));
const ParentTracking = lazy(() => import("../pages/parent/ParentTracking"));
const ParentNotifications = lazy(() => import("../pages/parent/ParentNotifications"));
const ParentProfile = lazy(() => import("../pages/parent/ParentProfile"));
const ParentSettings = lazy(() => import("../pages/parent/ParentSettings"));
const Login_Parents = lazy(() => import("../pages/parent/Login_Parents"));

// Driver pages
const DriverHome = lazy(() => import("../pages/driver/DriverHome"));
const DriverContacts = lazy(() => import("../pages/driver/DriverContacts"));
const DriverDailySchedule = lazy(() => import("../pages/driver/DriverDailySchedule"));
const DriverOperations = lazy(() => import("../pages/driver/DriverOperations"));

// Shared pages
const Login = lazy(() => import("../pages/shared/login"));
const NotFound = lazy(() => import("../pages/shared/NotFound"));

// Manager pages
const ManagerDashboard = lazy(() => import("../pages/manager/ManagerDashboard"));
const ManagerFeatures = lazy(() => import("../pages/manager/ManagerFeatures"));
const ManagerContacts = lazy(() => import("../pages/manager/ManagerContacts"));
const Reports = lazy(() => import("../pages/manager/Reports"));
const CatalogManagement = lazy(() => import("../pages/manager/CatalogManagement"));
const ScheduleManagement = lazy(() => import("../pages/manager/ScheduleManagement"));
const BusTracking = lazy(() => import("../pages/manager/BusTracking"));
const SendNotifications = lazy(() => import("../pages/manager/SendNotifications"));

// Loading component
const Loader = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center z-50">
    <div className="text-white text-3xl font-bold animate-pulse">SchoolBus Tracker</div>
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/login" element={<Login />} />
        <Route path="/parent/login" element={<Login_Parents />} />

        {/* ===== PARENT ROUTES ===== */}
        <Route path="/parent" element={<ParentLayout />}>
          <Route path="" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ParentDashboard />} />
          <Route path="tracking" element={<ParentTracking />} />
          <Route path="notifications" element={<ParentNotifications />} />
          <Route path="profile" element={<ParentProfile />} />
          <Route path="settings" element={<ParentSettings />} />
        </Route>

        {/* ===== DRIVER ROUTES ===== */}
        <Route element={<DriverLayout />}>
          <Route path="/driver" element={<DriverHome />} />
          <Route path="/driver/contacts" element={<DriverContacts />} />
          <Route path="/driver/daily-schedule" element={<DriverDailySchedule />} />
          <Route path="/driver/operations" element={<DriverOperations />} />
          {/* Redirect old links */}
          <Route path="/driver/features" element={<Navigate to="/driver" replace />} />
        </Route>

        {/* ===== MANAGER ROUTES ===== */}
        <Route path="/" element={<PageLayout />}>
          <Route path="" element={<Navigate to="/parent/login" replace />} />
          
          <Route path="manager">
            <Route path="" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="features" element={<ManagerFeatures />} />
            <Route path="contacts" element={<ManagerContacts />} />
            <Route path="reports" element={<Reports />} />
            <Route path="catalog" element={<CatalogManagement />} />
            <Route path="schedules" element={<ScheduleManagement />} />
            <Route path="bus-tracking" element={<BusTracking />} />
            <Route path="send-notifications" element={<SendNotifications />} />
          </Route>
        </Route>

        {/* ===== 404 FALLBACK ===== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}