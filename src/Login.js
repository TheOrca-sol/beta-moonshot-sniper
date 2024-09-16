// src/Login.js
import React from 'react';
import { Button, Container, Box, Typography } from '@mui/material';

const Login = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/discord';
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to the Moonshot Sniper App
        </Typography>
        <Button variant="contained" color="primary" onClick={handleLogin}>
          Login with Discord
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
