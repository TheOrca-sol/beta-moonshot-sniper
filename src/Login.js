// src/components/Login/Login.js
import React, { useState, useEffect } from 'react';
import { Button, Container, Typography, Box, Link, SvgIcon } from '@mui/material';
import TwitterIcon from '@mui/icons-material/Twitter';
import ChatIcon from '@mui/icons-material/Chat'; // We'll use this for Discord
import './Login.css'; // Import the CSS for our space-themed login page
import Starfield from './components/Starfield'; // Adjust the path based on your directory structure
import { theme } from './MainApp';
import { Palette } from 'lucide-react';

function Login() {
  const [terminalText, setTerminalText] = useState('');
  const fullText = "ATTENTION! SECRET TRANSMISSION RECEIVED. ACCESS CODE REQUIRED.";

  const DiscordIcon = (props) => (
    <SvgIcon {...props}>
      <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"/>
    </SvgIcon>
  );

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= fullText.length) {
        setTerminalText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
        // Restart typing after 2 seconds
        setTimeout(() => {
          setTerminalText('');
          index = 0;
          const newTypingInterval = setInterval(() => {
            if (index <= fullText.length) {
              setTerminalText(fullText.slice(0, index));
              index++;
            } else {
              clearInterval(newTypingInterval);
            }
          }, 100);
        }, 2000);
      }
    }, 100); // Speed of typing (in milliseconds)

    return () => clearInterval(typingInterval);
  }, [fullText]);

  const handleLogin = () => {
    window.location.href = 'https://theorca.pythonanywhere.com/login'; // Backend login endpoint
  };

  return (
    <div className="login-page">
      {/* Starfield Background */}
      <Starfield />

      {/* Login Container */}
      <Container maxWidth="sm" className="login-container">
        <Box className="login-box">
          <Typography variant="h4" className="login-title">
            Moonshot Sniper
          </Typography><br/>
          
          {/* Terminal Text */}
          <Box className="terminal-container">
            <Typography variant="body1" className="terminal-text">
              {terminalText}
              <span className="cursor">|</span>
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={handleLogin}
            className="login-button"
          >
            GRANT DISCORD ACCESS
          </Button>
        </Box>

        {/* Sniper Description and Instructions */}
        <Box className="sniper-info" mt={4}>
          <Typography variant="h5" gutterBottom>
            About the Moonshot Sniper App
          </Typography>
          <Typography variant="body1" paragraph>
  The Moonshot Sniper App is your go-to tool for grabbing memecoins before they take off.<br/>
  It helps you reduce risk with features like take profit (TP), stop-loss (SL), and trailing stop-loss to secure gains.<br/>
  You can also filter memecoins by volume, creation time, and social media, and check Twitter analytics to gauge hype.<br/>
  Plus, track creator holdings to avoid dumps. With more features coming, Moonshot Sniper keeps you ahead in the memecoins game.
</Typography>

          <Typography variant="h6" gutterBottom>
            How to Use:
          </Typography>
          <ol>
            <li>Authenticate with Discord (Tester role required).</li>
            <li>Enter your private key and set up your RPC URL (e.g., from <a href="https://dashboard.helius.dev/" target="_blank" rel="noopener noreferrer">Helius</a>).</li>
            <li>Configure your <strong>Take Profit (TP)</strong>, <strong>Stop-Loss (SL)</strong>, and <strong>Trailing Stop-Loss (TSL)</strong>...</li>
            <li>Apply filters like volume, 24H change, creation time, and social media links...</li>
            <li>Enable <strong>Auto-Buy</strong> to automatically purchase memecoins based on your criteria.</li>
          </ol>
        </Box>


        {/* Footer */}
        <Box className="footer" mt={4}>
          <Typography variant="body2" align="center">
            Made by <Link color='success' href="https://twitter.com/theorca_sol" target="_blank" rel="noopener">theorca.sol</Link>
          </Typography>
          <Box display="flex" justifyContent="center" mt={2}>
            <Link href="https://twitter.com/SPLabs_sol" target="_blank" rel="noopener" mr={2}>
              <TwitterIcon />
            </Link>
            <Link href="https://discord.gg/HWm34j7Fat" target="_blank" rel="noopener">
            <DiscordIcon /> {/* Use the Discord icon here */}
            </Link>
          </Box>
        </Box>
      </Container>
    </div>
  );
}

export default Login;
