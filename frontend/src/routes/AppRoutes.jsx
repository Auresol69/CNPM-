// src/routes/AppRoutes.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ParentLayout from "../components/layout/ParentLayout";
import { RouteTrackingProvider } from "../context/RouteTrackingContext";

// --- Lazy loaded pages ---

// Home page
const TrangChu = lazy(() => import("../pages/shared/trang_chu"));

// Login pages
const Login = lazy(() => import("../pages/shared/login"));
const Login_Parents = lazy(() => import("../pages/parent/Login_Parents"));
const Login_Admin = lazy(() => import("../pages/shared/Login_Admin"));
const Login_Driver = lazy(() => import("../pages/shared/Login_Driver"));

// Parent pages
const ParentDashboard = lazy(() => import("../pages/parent/ParentDashboard"));
const ParentTracking = lazy(() => import("../pages/parent/ParentTracking"));
const ParentNotifications = lazy(() => import("../pages/parent/ParentNotifications"));
const ParentProfile = lazy(() => import("../pages/parent/ParentProfile"));
const ParentSettings = lazy(() => import("../pages/parent/ParentSettings"));

// Driver pages
const DriverHome = lazy(() => import("../pages/driver/components/driver/DriverHome"));
const DriverDailySchedule = lazy(() => import("../pages/driver/components/driver/DriverDailySchedule"));
const DriverContacts = lazy(() => import("../pages/driver/components/driver/DriverContacts"));
const DriverOperations = lazy(() => import("../pages/driver/components/driver/DriverOperations"));
const DriverLayout = lazy(() => import("../layouts/DriverLayout"));

// Admin pages
const AdminLayout = lazy(() => import("../components/layout/Admin_Layouts"));
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard"));
const AdminStudents = lazy(() => import("../pages/admin/Students"));
const AdminDriver = lazy(() => import("../pages/admin/Driver"));
const AdminBus = lazy(() => import("../pages/admin/Bus"));
const AdminStations = lazy(() => import("../pages/admin/Stations"));
const AdminRoutes = lazy(() => import("../pages/admin/Routes"));
const AdminSchedules = lazy(() => import("../pages/admin/Schedules"));
const AdminScheduleDetail = lazy(() => import("../pages/admin/ScheduleDetail"));
const AdminTrips = lazy(() => import("../pages/admin/Trips"));
const AdminTripDetail = lazy(() => import("../pages/admin/TripDetail"));
const AdminAlerts = lazy(() => import("../pages/admin/Alerts"));
const AdminMessages = lazy(() => import("../pages/admin/Messages"));
const AdminTracking = lazy(() => import("../pages/admin/Tracking"));

// Shared pages
const NotFound = lazy(() => import("../pages/shared/NotFound"));

// Loading component
const Loader = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center z-50">
    <div className="text-white text-3xl font-bold animate-pulse">Safe to School</div>
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* ===== HOME PAGE ===== */}
        <Route path="/" element={<TrangChu />} />

        {/* ===== PUBLIC LOGIN ROUTES ===== */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<Login_Admin />} />
        <Route path="/parent/login" element={<Login_Parents />} />
        <Route path="/driver/login" element={<Login_Driver />} />

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
        {/* ===== DRIVER ROUTES ===== */}
        <Route path="/driver" element={<RouteTrackingProvider><DriverLayout /></RouteTrackingProvider>}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<DriverHome />} />
          <Route path="schedule" element={<DriverDailySchedule />} />
          <Route path="contacts" element={<DriverContacts />} />
          <Route path="operations" element={<DriverOperations />} />
        </Route>

        {/* ===== ADMIN ROUTES ===== */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="drivers" element={<AdminDriver />} />
          <Route path="buses" element={<AdminBus />} />
          <Route path="stations" element={<AdminStations />} />
          <Route path="routes" element={<AdminRoutes />} />
          <Route path="schedules" element={<AdminSchedules />} />
          <Route path="schedules/:id" element={<AdminScheduleDetail />} />
          <Route path="trips" element={<AdminTrips />} />
          <Route path="trips/:id" element={<AdminTripDetail />} />
          <Route path="alerts" element={<AdminAlerts />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="tracking" element={<AdminTracking />} />
        </Route>

        {/* ===== 404 FALLBACK ===== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}