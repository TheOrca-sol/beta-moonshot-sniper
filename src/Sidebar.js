// Sidebar.js
import React from 'react';
import { Box, Typography, Divider, TextField, Button, Switch, FormControlLabel } from '@mui/material';

function Sidebar({
  privateKey,
  setPrivateKey,
  rpcUrl,
  setRpcUrl,
  autoBuyEnabled,
  setAutoBuyEnabled,
  collateralAmountSol,
  setCollateralAmountSol,
  slippageBps,
  setSlippageBps,
  maxPriceChange,
  setMaxPriceChange,
  requireTwitter,
  setRequireTwitter,
  nameFilter,
  setNameFilter,    
}) {
  // Function to handle collateral amount change
  const handleCollateralChange = (e) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value) || value <= 0) {
      value = 0.01; // Set a default minimum value
    }
    setCollateralAmountSol(value);
  };
  
  const handleSlippageChange = (e) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0) {
      value = 0; // Slippage cannot be negative
    }
    setSlippageBps(value * 100); // Convert percentage to basis points
  };

  return (
    <Box
      sx={{
        width: { xs: '100%', sm: '300px' },
        p: 2,
        backgroundColor: 'background.paper',
        borderLeft: { xs: 'none', md: '1px solid #e0e0e0' },
      }}
    >
      <Typography variant="h6" component="div" gutterBottom>
        Configuration
      </Typography>
      <Divider />

      {/* Private Key and RPC URL Inputs */}
      <Box sx={{ mt: 2 }}>
        {/* Private Key Input */}
        

        <TextField
          label="Private Key"
          variant="outlined"
          fullWidth
          margin="normal"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          placeholder="Enter your Base58 private key"
          type="password" // Obscures the input
          helperText="Ensure your private key is kept secure. Do not share it with anyone."
        />

        {/* RPC URL Input */}
        <TextField
          label="RPC URL"
          variant="outlined"
          fullWidth
          margin="normal"
          value={rpcUrl}
          onChange={(e) => setRpcUrl(e.target.value)}
          placeholder="https://mainnet.helius-rpc.com/"
          helperText="Provide a valid Solana RPC endpoint."
        />

        {/* Auto-Buy Switch */}
        <FormControlLabel
          control={
            <Switch
              checked={autoBuyEnabled}
              onChange={(e) => setAutoBuyEnabled(e.target.checked)}
              color="primary"
            />
          }
          label="Enable Auto-Buy"
        />
      </Box>

      {/* Auto-Buy Settings */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Auto-Buy Settings
        </Typography>
        <TextField
          label="Collateral Amount (SOL)"
          type="number"
          fullWidth
          margin="normal"
          variant="outlined"
          value={collateralAmountSol}
          onChange={handleCollateralChange}
          inputProps={{ min: "0", step: "0.01" }}
        />
        <TextField
          label="Slippage (%)"
          type="number"
          fullWidth
          margin="normal"
          variant="outlined"
          value={slippageBps / 100} // Convert basis points to percentage
          onChange={handleSlippageChange}
          inputProps={{ min: "0", step: "0.1" }}
        />
      </Box>
      <Box sx={{ width: '300px', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>

      {/* 24-Hour Price Change Filters */}
      
     
      <TextField
        label="Max 24h Change (%)"
        type="number"
        fullWidth
        margin="normal"
        variant="outlined"
        value={maxPriceChange}
        onChange={(e) => setMaxPriceChange(e.target.value)}
      />
      <TextField
          label="Token Name"
          variant="outlined"
          fullWidth
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          placeholder="Enter exact token name"
        />

      {/* Require Twitter Link */}
      <FormControlLabel
        control={
          <Switch
            checked={requireTwitter}
            onChange={(e) => setRequireTwitter(e.target.checked)}
            color="primary"
          />
        }
        label="Require Twitter Link"
      />
    </Box>
    </Box>
  );
}

export default Sidebar;
