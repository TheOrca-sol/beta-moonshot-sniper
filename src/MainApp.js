import React from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Box, Typography, styled } from '@mui/material';
import LogoutButton from './LogoutButton';
import UserInfo from './UserInfo';
import SniperComponent from './SniperComponent';
import Starfield from './components/Starfield';
import AdvancedSniperDashboard from './AdvancedSniperDashboard';

// Create a custom theme
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00ff00' },
    secondary: { main: '#ff00ff' },
    background: { default: '#000000', paper: 'rgba(10, 10, 10, 0.8)' },
    text: { primary: '#FFFFFF', secondary: '#ff00ff' },
  },
  typography: {
    fontFamily: '"Orbitron", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&display=swap');
        body {
          overflow: auto;
        }
      `,
    },
  },
});

const GlowingText = styled(Typography)(({ theme }) => ({
  textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00',
}));

const AlienSymbol = styled('span')(({ theme }) => ({
  fontFamily: '"Orbitron", sans-serif',
  color: theme.palette.secondary.main,
  textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff',
}));

function MainApp() {
  console.log('MainApp: Rendered'); // Debug
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Starfield />
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          
          {/*<LogoutButton />*/}
        </Box>
        <Box mt={2}>
          {/*<UserInfo />*/}
          {/*<SniperComponent/>*/}
          <AdvancedSniperDashboard/>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default MainApp;
