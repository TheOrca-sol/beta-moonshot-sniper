// src/App.js

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainApp from './MainApp'; // Your sniper component
import Login from './Login';
import AuthCallback from './AuthCallback';
import ProtectedRoute from './ProtectedRoute';
import { AuthContext } from './AuthContext';
import TokenListComponent from './TokenListComponent';

function App() {
  const [auth, setAuth] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setAuth(true);
      setToken(storedToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, token, setToken }}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/tokenanlysis" element={<TokenListComponent />} />
          

          <Route path="/auth" element={<AuthCallback />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
