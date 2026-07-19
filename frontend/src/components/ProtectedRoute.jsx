import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireRole }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (requireRole && session.role !== requireRole) return <Navigate to="/" replace />;
  return children;
}
