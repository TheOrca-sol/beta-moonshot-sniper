import React from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  TextField, 
  Button, 
  Switch, 
  FormControlLabel,
  Paper,
  styled
} from '@mui/material';

const StyledSidebar = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(10, 10, 10, 0.8)',
  borderRadius: '16px',
  border: '1px solid rgba(0, 255, 0, 0.2)',
  boxShadow: '0 4px 30px rgba(0, 255, 0, 0.1)',
  backdropFilter: 'blur(5px)',
  padding: theme.spacing(2),
  color: theme.palette.primary.main,
  height: '100%',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 255, 0, 0.1)',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(0, 255, 0, 0.5)',
    borderRadius: '4px',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(0, 255, 0, 0.5)',
      borderRadius: '8px',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.primary.main,
  },
  '& .MuiInputBase-input': {
    color: theme.palette.primary.main,
  },
}));

const StyledSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: theme.palette.primary.main,
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: theme.palette.primary.main,
  },
}));

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
  maxRetries, 
  setMaxRetries,
  stopLoss,
  setStopLoss,
  takeProfitPercentage,
  setTakeProfitPercentage,
  requireTelegram,
  setRequireTelegram,
  trailingStopLoss,
  setTrailingStopLoss,
  inactivityThreshold,
  setInactivityThreshold,
  minVolume,
  setMinVolume,
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
  const handleTakeProfitChange = (e) => {
    const takeProfitValue = parseFloat(e.target.value);
  
    if (takeProfitValue <= 0 || isNaN(takeProfitValue)) {
      console.error("Invalid Take Profit percentage. Cannot proceed.");
      return;
    }
  
    setTakeProfitPercentage(takeProfitValue); // Assuming `setTakeProfitPercentage` is the state setter
  };
  const handleMinVolumeChange = (e) => {
    setMinVolume(parseFloat(e.target.value) || 0); // Handle empty input as 0
  };
  

  return (
    <StyledSidebar elevation={3}>
      <Typography variant="h6" component="div" gutterBottom>
        Configuration
      </Typography>
      <Divider sx={{ mb: 2, bgcolor: 'rgba(0, 255, 0, 0.2)' }} />

      {/* Private Key and RPC URL Inputs */}
      <Box sx={{ mt: 2 }}>
        {/* Private Key Input */}
        

        <StyledTextField
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
        <StyledTextField
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
            <StyledSwitch
              checked={autoBuyEnabled}
              onChange={(e) => setAutoBuyEnabled(e.target.checked)}
              color="primary"
            />
          }
          label="Enable Auto-Buy"
        />
      </Box>
      <Divider sx={{ my: 2, bgcolor: 'rgba(0, 255, 0, 0.2)' }} />

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
         <TextField
        label="TX Max Retries"
        type="number"
        value={maxRetries}
        onChange={(e) => setMaxRetries(Number(e.target.value))}
        fullWidth
        sx={{ mt: 2 }}
        InputProps={{ inputProps: { min: 0 } }} // Ensure it's a non-negative number
      />
       
      <TextField
          label="Stop Loss (%)"
          type="number"
          value={stopLoss}
          onChange={(e) => setStopLoss(Number(e.target.value))}
          fullWidth
          sx={{ mt: 2 }}
          inputProps={{ min: "0", step: "0.1" }}


        />
        <TextField
          label="Take Profit (%)"
          variant="outlined"
          value={takeProfitPercentage}
          onChange={(e) => setTakeProfitPercentage(e.target.value)}
          type="number"
          sx={{ mt: 2 }}
          inputProps={{ min: "0", step: "0.1" }}
          fullWidth

        />
        <TextField
          label="Trailing Stop Loss (%)"
          variant="outlined"
          value={trailingStopLoss}
          onChange={(e) => setTrailingStopLoss(e.target.value)}
          type="number"
          sx={{ mt: 2 }}
          inputProps={{ min: "0", step: "0.1" }}
          fullWidth
        />
        <TextField
          label="Inactivity Threshold (minutes)"
          variant="outlined"
          value={inactivityThreshold}
          onChange={(e) => setInactivityThreshold(Number(e.target.value))}
          type="number"
          sx={{ mt: 2 }}
          inputProps={{ min: "0", step: "0.1" }}
          fullWidth
        />

      </Box>
      {/* Stop Loss input */}
        



      <Box sx={{ mt: 2 }}>
      <Divider/>

      <Typography variant="subtitle1" gutterBottom>
        Filters
      </Typography>

      {/* 24-Hour Price Change Filters */}
      <TextField
        label="Min 5 min Volume (USD)"
        type="number"
        fullWidth
        margin="normal"
        variant="outlined"
        value={minVolume}
        onChange={handleMinVolumeChange}
        inputProps={{ min: "0", step: "0.1" }}
        placeholder="Enter minimum 5 min volume"
        sx={{ mt: 2 }}

      />
     
      <TextField
        label="Max 24h Change (%)"
        type="number"
        fullWidth
        margin="normal"
        variant="outlined"
        value={maxPriceChange}
        inputProps={{ min: "0", step: "0.1" }}

        onChange={(e) => setMaxPriceChange(e.target.value)}


      />
      <TextField
          label="Token Name"
          variant="outlined"
          value={nameFilter}
          inputProps={{ min: "0", step: "0.1" }}
          fullWidth
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
      <FormControlLabel
        control={
          <Switch
            checked={requireTelegram}
            onChange={(e) => setRequireTelegram(e.target.checked)}
            color="primary"
          />
        }
        label="Require Telegram Link"
      />

    </Box>
    </StyledSidebar>
  );
}

export default Sidebar;
