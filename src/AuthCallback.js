// src/AuthCallback.js

import React, { useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Container, Typography } from '@mui/material';
import { AuthContext } from './AuthContext';
import {jwtDecode} from 'jwt-decode'; // Correct import without braces

function AuthCallback() {
  const navigate = useNavigate();
  const { setAuth, setToken } = useContext(AuthContext);
  const hasProcessed = useRef(false); // Flag to prevent multiple processing

  useEffect(() => {
    if (hasProcessed.current) return; // If already processed, exit
    hasProcessed.current = true; // Mark as processed

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    console.log('AuthCallback: Extracted token from URL:', token); // Debug

    if (token) {
      try {
        // Decode the token to verify its integrity (optional)
        const decoded = jwtDecode(token);
        console.log('AuthCallback: Decoded JWT:', decoded); // Debug
      } catch (error) {
        console.error('AuthCallback: Invalid token:', error);
        // Optionally, handle invalid token scenario
      }

      // Store token in localStorage
      localStorage.setItem('token', token);
      console.log('AuthCallback: Token stored in localStorage'); // Debug

      // Update authentication state
      setAuth(true);
      setToken(token);
      console.log('AuthCallback: Authentication state updated'); // Debug

      // Redirect to main app with replace to avoid history issues
      navigate('/', { replace: true });
    } else {
      // Handle error or redirect to login
      console.error('AuthCallback: No token found in URL'); // Debug
      navigate('/login');
    }
  }, [navigate, setAuth, setToken]);

  return (
    <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '100px' }}>
      <Typography variant="h6" gutterBottom>
        Processing authentication...
      </Typography>
      <CircularProgress />
    </Container>
  );
}

export default AuthCallback;
