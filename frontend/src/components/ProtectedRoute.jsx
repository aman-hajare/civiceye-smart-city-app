import { Navigate } from "react-router-dom";
import { getRole, isAuthenticated } from "../services/auth";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    const role = getRole();
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
