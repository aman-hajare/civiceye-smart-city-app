import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import UserDashboard from "./pages/UserDashboard";
import IssueList from "./pages/IssueList";
import IssueMap from "./pages/IssueMap";
import ReportIssue from "./pages/ReportIssue";


function App() {
  const role = localStorage.getItem("role");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/report" element={<ReportIssue />} />

        <Route path="/dashboard"
          element={
            role === "ADMIN" ? (
              <AdminDashboard />
            ) : role === "WORKER" ? (
              <WorkerDashboard />
            ) : role === "USER" ? (
              <UserDashboard />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route path="/issues" element={<IssueList />} />
        <Route path="/map" element={<IssueMap />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
