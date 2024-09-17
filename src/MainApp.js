import React from 'react';
import LogoutButton from './LogoutButton';
import UserInfo from './UserInfo';
import { Container, Box, Typography } from '@mui/material';
import SniperComponent from './SniperComponent'; // Replace with your actual sniper component

function MainApp() {
  console.log('MainApp: Rendered'); // Debug
  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <LogoutButton />
      </Box>
      <Box mt={2}>
        <UserInfo />
        
        <SniperComponent /> {/* Include your existing sniper components here */}
      </Box>
    </Container>
  );
}

export default MainApp;
