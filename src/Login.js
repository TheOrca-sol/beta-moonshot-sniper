// src/Login.js

import React, { useContext } from 'react';
import { Button, Container, Typography } from '@mui/material';
import { AuthContext } from './AuthContext';

function Login() {

  const handleLogin = () => {
    window.location.href = 'http://theorca.pythonanywhere.com/login'; // Backend login endpoint
  };

  return (
    <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '100px' }}>
      <Typography variant="h4" gutterBottom>
        Welcome to the Sniper App
      </Typography>
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Login with Discord
      </Button>
    </Container>
  );
}

export default Login;
