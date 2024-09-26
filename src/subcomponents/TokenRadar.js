import React, { useState, useEffect } from 'react';
import { Box, Typography, styled, keyframes } from '@mui/material';




const RadarContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '400px',
  aspectRatio: '1 / 1',
  margin: '0 auto',
  position: 'relative',
  backgroundColor: 'rgba(0, 20, 0, 0.2)',
  borderRadius: '50%',
  overflow: 'hidden',
  boxShadow: '0 0 20px rgba(0, 255, 0, 0.2)',
}));

const RadarContent = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
});

const RadarSVG = styled('svg')({
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
});

const RadarCircle = styled('circle')({
  fill: 'none',
  stroke: 'rgba(0, 255, 0, 0.2)',
  strokeWidth: 1,
});

const RadarLine = styled('line')({
  stroke: 'rgba(0, 255, 0, 0.2)',
  strokeWidth: 1,
});

const RadarSweep = styled('circle')({
  fill: 'rgba(0, 255, 0, 0.1)',
  stroke: 'rgba(0, 255, 0, 0.5)',
  strokeWidth: 2,
  animation: 'pulse 4s infinite',
  '@keyframes pulse': {
    '0%': { r: 0, opacity: 1 },
    '100%': { r: '50%', opacity: 0 },
  },
});

const TokenDot = styled('circle')({
  fill: 'red',
  stroke: 'rgba(255, 0, 0, 0.5)',
  strokeWidth: 2,
  transition: 'all 0.3s ease',
});

const TokenLabel = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  fontSize: '0.75rem',
  color: theme.palette.primary.main,
  textShadow: '0 0 5px rgba(0, 255, 0, 0.5)',
  transform: 'translate(-50%, -100%)',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  backgroundColor: 'rgba(0, 20, 0, 0.7)',
  padding: '2px 4px',
  borderRadius: '4px',
  border: '1px solid rgba(0, 255, 0, 0.3)',
}));

const pulseAnimation = keyframes`
  0% {
    r: 0;
    opacity: 1;
  }
  100% {
    r: 45;
    opacity: 0;
  }
`;

const LoadingPulse = styled('circle')({
  fill: 'none',
  stroke: 'rgba(0, 255, 0, 0.5)',
  strokeWidth: 2,
  animation: `${pulseAnimation} 2s infinite`,
});

function TokenRadar({ tokens = [], loading = false }) {
  const [displayedTokens, setDisplayedTokens] = useState([]);

  useEffect(() => {
    if (tokens && tokens.length > 0) {
      const updatedTokens = tokens.slice(0, 10).map((token, index) => ({
        name: token.baseToken?.symbol || `Token ${index + 1}`,
        x: 50 + Math.cos(index * (Math.PI / 5)) * 42,
        y: 50 + Math.sin(index * (Math.PI / 5)) * 42,
      }));
      setDisplayedTokens(updatedTokens);
    } else {
      setDisplayedTokens([]);
    }
  }, [tokens]);

  const GlowingText = styled(Typography)(({ theme }) => ({
    textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00',
  }));
  
  const AlienSymbol = styled('span')(({ theme }) => ({
    fontFamily: '"Orbitron", sans-serif',
    color: theme.palette.secondary.main,
    textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff',
  }));

  return (
    <Box >
       <GlowingText variant="h3" align="center">
            Moonshot Sniper <AlienSymbol>&#x2732;</AlienSymbol>
          </GlowingText><br/><br/>
      <RadarContainer>
        <RadarContent>
          <RadarSVG viewBox="0 0 100 100">
            <RadarCircle cx="50" cy="50" r="45" />
            <RadarCircle cx="50" cy="50" r="30" />
            <RadarCircle cx="50" cy="50" r="15" />
            <RadarLine x1="50" y1="5" x2="50" y2="95" />
            <RadarLine x1="5" y1="50" x2="95" y2="50" />
            <RadarSweep cx="50" cy="50" />
            {loading && <LoadingPulse cx="50" cy="50" />}
            {displayedTokens.map((token, index) => (
              <TokenDot key={index} cx={`${token.x}%`} cy={`${token.y}%`} r="1.5" />
            ))}
          </RadarSVG>
          {displayedTokens.map((token, index) => (
            <TokenLabel 
              key={index} 
              style={{ 
                left: `${token.x}%`, 
                top: `${token.y}%` 
              }}
            >
              {token.name}
            </TokenLabel>
          ))}
        </RadarContent>
      </RadarContainer>
    </Box>
  );
}

export default TokenRadar;