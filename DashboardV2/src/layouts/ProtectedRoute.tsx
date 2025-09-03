import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isLogin = localStorage.getItem("isLogin");

  if (isLogin !== 'true') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;