import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { getAccessToken, getRole } from './services/auth';
import { NotificationProvider } from './context/NotificationContext';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IssueList from './pages/IssueList';
import AnalyticsPage from './pages/AnalyticsPage';
import MapView from './pages/MapView';
import ReportIssue from './pages/ReportIssue';
import UsersPage from './pages/UsersPage';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

const ProtectedRoute = ({ children, requiredRole = null, disallowedRoles = [] }) => {
  const token = getAccessToken();
  const role = getRole();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  if (disallowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const DashboardLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <Navbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const isAuthenticated = Boolean(getAccessToken());

  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/issues"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <IssueList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AnalyticsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MapView />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ReportIssue />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UsersPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />} />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;

