/**
 * Protected Route Component
 *
 * Wraps routes that require authentication.
 * Redirects unauthenticated users to Layer 1 (login).
 */
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const authenticated = isAuthenticated();

  if (!authenticated) {
    // Redirect to login, preserving the attempted URL
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
