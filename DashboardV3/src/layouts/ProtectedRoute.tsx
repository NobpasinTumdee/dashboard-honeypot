import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const Role = localStorage.getItem("status");

  useEffect(() => {
    if (Role !== 'Authenticated') {
        alert('You are not authorized to access this page. Please log in or contact the administrator.');
    }
  }, [Role]);

  if (Role !== 'Authenticated') {
    return <Navigate to="/home/login" replace />;
  }

  return children;
};

export default ProtectedRoute;