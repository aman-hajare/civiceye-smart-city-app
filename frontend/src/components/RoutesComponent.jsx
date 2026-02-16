import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Login";
import AdminDashboard from "../pages/AdminDashboard";
import WorkerDashboard from "../pages/WorkerDashboard";
import UserDashboard from "../pages/UserDashboard";
import IssueList from "../pages/IssueList";
import AnalyticsPage from "../pages/AnalyticsPage";
import MapView from "../pages/MapView";
import UsersPage from "../pages/UsersPage";
import ReportIssue from "../pages/ReportIssue";
import { getRole, isAuthenticated } from "../services/auth";

const DashboardRedirect = () => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;

  const role = getRole();
  if (role === "ADMIN") return <AdminDashboard />;
  if (role === "WORKER") return <WorkerDashboard />;
  return <UserDashboard />;
};

const RoutesComponent = () => {
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      <Route
        path="/issues"
        element={
          <ProtectedRoute>
            <IssueList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "WORKER"]}>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/map"
        element={
          <ProtectedRoute>
            <MapView />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/report"
        element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <ReportIssue />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
};

export default RoutesComponent;
