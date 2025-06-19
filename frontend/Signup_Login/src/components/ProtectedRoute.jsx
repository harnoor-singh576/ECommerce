// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, children }) => {
    
    if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

    return children; // User is authenticated, render the children components
};

export default ProtectedRoute;