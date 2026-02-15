import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import UserDashboard from "./pages/UserDashboard";
import IssueList from "./pages/IssueList";
import UsersPage from "./pages/UsersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import MapView from "./pages/MapView";
import ReportIssue from "./pages/ReportIssue";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/dashboard" />} />

        <Route
          path="/dashboard"
          element={
            role === "ADMIN" ? (
              <AdminDashboard />
            ) : role === "WORKER" ? (
              <WorkerDashboard />
            ) : (
              <UserDashboard />
            )
          }
        />

        <Route path="/issues" element={<IssueList />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/report" element={<ReportIssue />} />

        <Route path="*" element={<Navigate to="/dashboard" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
