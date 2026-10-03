import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth, homeFor } from "../context/AuthContext";

const LOGIN_BY_ROLE = {
  doctor: "/doctor/login",
  admin: "/staff/login",
  receptionist: "/staff/login",
};

// Sends people to the right login page, and to their own dashboard if they open another role's page.
const ProtectedRoute = ({ role, children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={LOGIN_BY_ROLE[role] || "/login"} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={homeFor(user.role)} replace />;
  }

  return children;
};

// Login / register pages: signed-in people go straight to their dashboard.
export const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to={homeFor(user.role)} replace /> : children;
};

// "/" goes to the dashboard when signed in, otherwise to the login page.
export const RootRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={user ? homeFor(user.role) : "/login"} replace />;
};

export default ProtectedRoute;
