import React, { useContext } from 'react';
import { Button } from '@mui/material';
import { AuthContext } from './AuthContext';

function LogoutButton() {
  const { setAuth, setToken } = useContext(AuthContext);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(false);
    setToken(null);
    console.log('LogoutButton: User logged out'); // Debug
    window.location.href = '/login';
  };

  return (
    <Button variant="outlined" color="secondary" onClick={handleLogout}>
      Logout
    </Button>
  );
}

export default LogoutButton;
