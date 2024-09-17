// src/ProtectedRoute.js

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

function ProtectedRoute({ children }) {
  const { auth } = useContext(AuthContext);
  console.log('ProtectedRoute: auth state:', auth); // Debug Statement
  return auth ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
