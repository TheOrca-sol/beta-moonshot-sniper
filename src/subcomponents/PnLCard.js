import React from 'react';
import styled from '@emotion/styled';
import { Box, Typography, Grid } from '@mui/material';

const CardContainer = styled(Box)`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 24px;
  padding: 32px;
  color: #fff;
  width: 320px;
  height: 460px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const GlowingText = styled(Typography)`
  text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff;
  font-weight: bold;
`;

const StarBackground = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 50px 160px, #ddd, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 160px 120px, #ddd, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  opacity: 0.1;
  animation: twinkle 5s infinite;
`;

const Planet = styled(Box)`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(45deg, #ff4e50, #f9d423);
  box-shadow: 0 0 20px rgba(255, 78, 80, 0.5);
`;

const DataContainer = styled(Box)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Footer = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  margin-top: 16px;
  font-size: 10px;
  opacity: 0.7;
`;

const DataGrid = styled(Grid)`
  width: 100%;
`;

const DataLabel = styled(Typography)`
  text-align: left;
`;

const DataValue = styled(Typography)`
  text-align: right;
`;

const formatNumber = (number) => {
  return Number(number).toFixed(2);
};

const PnLCard = React.memo(({ coinName, invested, roi, profit, solPrice }) => {
  console.log('PnLCard props:', { coinName, invested, roi, profit, solPrice });

  const currentDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <CardContainer id="pnl-card">
      <StarBackground />
      <Planet />
      <Box>
        <GlowingText variant="h4" gutterBottom>{'$'+coinName}</GlowingText>
        <Typography variant="subtitle1" sx={{ opacity: 0.7 }}>Profit/Loss Statement</Typography>
      </Box>
      <DataContainer>
        <DataGrid container spacing={1}>
          <Grid item xs={6}>
            <DataLabel variant="h5">Invested:</DataLabel>
          </Grid>
          <Grid item xs={6}>
            <DataValue variant="h5">{formatNumber(invested)} SOL</DataValue>
          </Grid>
          <Grid item xs={6}>
            <DataLabel variant="h5">ROI:</DataLabel>
          </Grid>
          <Grid item xs={6}>
            <DataValue variant="h5"  sx={{ color: roi >= 0 ? "#00ff00" : "#ff4e50" }}>
              {formatNumber(roi)}%
            </DataValue>
          </Grid>
          <Grid item xs={6}>
            <DataLabel variant="h5">Profit:</DataLabel>
          </Grid>
          <Grid item xs={6}>
            <DataValue variant="h5" sx={{ color: profit >= 0 ? "#00ff00" : "#ff4e50" }}>
              {profit >= 0 ? '+' : ''}{formatNumber(profit * solPrice )} $
            </DataValue>
          </Grid>
        </DataGrid>
      </DataContainer>
      <Footer>
        <Typography variant="caption">SUCCESS BY SPLABS ON {currentDate}</Typography>
        <Typography variant="caption">FOLLOW US ON TWITTER @SPLabs_sol</Typography>
      </Footer>
    </CardContainer>
  );
});

export default PnLCard;