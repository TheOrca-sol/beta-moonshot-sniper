// src/UserInfo.js

import React, { useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Typography, Box } from '@mui/material';
import { AuthContext } from './AuthContext';

function UserInfo() {
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error("Failed to decode JWT:", error);
      }
    }
  }, [token]);

  if (!user) return null;

  return (
    <Box mb={4}>
      <Typography variant="h6">Logged in as: {user.username}#{user.discriminator}</Typography>
    </Box>
  );
}

export default UserInfo;
