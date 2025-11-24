import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";

// --- Layout Components ---
import Sidebar from "../components/layout/Sidebar";

// --- Parent Page Components ---
import ParentDashboard from "../pages/parent/ParentDashboard";
import ParentTracking from "../pages/parent/ParentTracking";
import ParentNotifications from "../pages/parent/ParentNotifications";
import ParentFeatures from "../pages/parent/ParentFeatures";
import ParentRoles from "../pages/parent/ParentRoles";

/**
 * A shared layout for all parent pages.
 * It includes the Sidebar and a main content area for the child routes.
 */
const ParentLayout = () => (
  <div className="flex bg-gray-50 min-h-screen">
    <Sidebar />
    <main className="flex-grow">
      {/* The Outlet component renders the matched child route's element */}
      <Outlet />
    </main>
  </div>
);

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect base path to the parent dashboard */}
        <Route path="/" element={<Navigate to="/parent/dashboard" replace />} />

        {/* All parent routes will share the ParentLayout */}
        <Route path="/parent" element={<ParentLayout />}>
          <Route path="dashboard" element={<ParentDashboard />} />
          <Route path="tracking" element={<ParentTracking />} />
          <Route path="notifications" element={<ParentNotifications />} />
          <Route path="features" element={<ParentFeatures />} />
          <Route path="roles" element={<ParentRoles />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
