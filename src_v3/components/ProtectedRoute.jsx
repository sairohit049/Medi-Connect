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

export default ProtectedRoute;
