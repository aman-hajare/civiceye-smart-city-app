import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import UserDashboard from "./pages/UserDashboard";
import IssueList from "./pages/IssueList";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const ProtectedRoute = ({ children, allowedRole }) => {
    if (!token) return <Navigate to="/" />;
    if (allowedRole && role !== allowedRole) return <Navigate to="/" />;
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            role === "ADMIN" ? (
              <ProtectedRoute allowedRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            ) : role === "WORKER" ? (
              <ProtectedRoute allowedRole="WORKER">
                <WorkerDashboard />
              </ProtectedRoute>
            ) : (
              <ProtectedRoute allowedRole="USER">
                <UserDashboard />
              </ProtectedRoute>
            )
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

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
