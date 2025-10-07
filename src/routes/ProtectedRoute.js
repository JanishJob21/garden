import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles) {
    const norm = (s) => (s || '').charAt(0).toUpperCase() + (s || '').slice(1).toLowerCase();
    const allowed = roles.map(norm);
    if (!allowed.includes(norm(user.role))) return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
