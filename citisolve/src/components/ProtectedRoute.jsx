import React from "react";
import { Navigate } from "react-router-dom";
import { getToken, getUserRole } from "../services/api";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = getToken();
  const userRole = getUserRole();

  console.log("ProtectedRoute check:", {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    userRole: userRole,
    allowedRoles: allowedRoles,
    pathname: window.location.pathname,
  });

  if (!token) {
    console.log("No token found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.log("Insufficient role, redirecting to home");
    return <Navigate to="/" replace />;
  }

  console.log("Access granted to protected route");
  return children;
};

export default ProtectedRoute;
