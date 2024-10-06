import React from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  TextField, 
  Switch, 
  FormControlLabel,
  Paper,
  Link,
  styled
} from '@mui/material';

const StyledPanel = styled(Paper)(({ theme }) => ({
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
    color: theme.palette.text.primary,
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

function ControlPanel({
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
  creationTimeFilter,
  setCreationTimeFilter,
  useJito,
  setUseJito,
  jitoTipLamports,
  setJitoTipLamports,
  priorityFee,
  setPriorityFee,
}) {
  const handleCollateralChange = (e) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value) || value <= 0) {
      value = 0.01;
    }
    setCollateralAmountSol(value);
  };
  
  const handleSlippageChange = (e) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0) {
      value = 0;
    }
    setSlippageBps(value * 100);
  };

  const handleMinVolumeChange = (e) => {
    setMinVolume(parseFloat(e.target.value) || 0);
  };

  return (
    <StyledPanel elevation={3}>
      <Typography variant="h6" component="div" gutterBottom>
        Control Panel
      </Typography>
      <Divider sx={{ mb: 2, bgcolor: 'rgba(0, 255, 0, 0.2)' }} />

      <Box sx={{ mt: 2 }}>
        <StyledTextField
          label="Private Key"
          variant="outlined"
          fullWidth
          margin="normal"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          type="password"
          helperText="Ensure your private key is kept secure."
        />

        <StyledTextField
          label="RPC URL"
          variant="outlined"
          fullWidth
          margin="normal"
          value={rpcUrl}
          onChange={(e) => setRpcUrl(e.target.value)}
          helperText="Provide a valid Solana RPC endpoint."
        />

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

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Auto-Buy Settings
        </Typography>
        <StyledTextField
          label="Collateral Amount (SOL)"
          type="number"
          fullWidth
          margin="normal"
          variant="outlined"
          value={collateralAmountSol}
          onChange={handleCollateralChange}
          inputProps={{ min: "0", step: "0.01" }}
        />
        <StyledTextField
          label="Slippage (%)"
          type="number"
          fullWidth
          margin="normal"
          variant="outlined"
          value={slippageBps / 100}
          onChange={handleSlippageChange}
          inputProps={{ min: "0", step: "0.1" }}
        />
        <StyledTextField
          label="TX Max Retries"
          type="number"
          value={maxRetries}
          onChange={(e) => setMaxRetries(Number(e.target.value))}
          fullWidth
          InputProps={{ inputProps: { min: 0 } }}
        />
        <StyledTextField
          label="Stop Loss (%)"
          type="number"
          value={stopLoss}
          onChange={(e) => setStopLoss(Number(e.target.value))}
          fullWidth
          inputProps={{ min: "0", step: "0.1" }}
        />
        <StyledTextField
          label="Take Profit (%)"
          variant="outlined"
          value={takeProfitPercentage}
          onChange={(e) => setTakeProfitPercentage(e.target.value)}
          type="number"
          inputProps={{ min: "0", step: "0.1" }}
          fullWidth
        />
        <StyledTextField
          label="Trailing Stop Loss (%)"
          variant="outlined"
          value={trailingStopLoss}
          onChange={(e) => setTrailingStopLoss(e.target.value)}
          type="number"
          inputProps={{ min: "0", step: "0.1" }}
          fullWidth
        />
        <StyledTextField
          label="Inactivity Threshold (minutes)"
          variant="outlined"
          value={inactivityThreshold}
          onChange={(e) => setInactivityThreshold(Number(e.target.value))}
          type="number"
          inputProps={{ min: "0", step: "0.1" }}
          fullWidth
        />
        <StyledTextField
          label="Priority Fee (Lamports)"
          type="number"
          fullWidth
          margin="normal"
          variant="outlined"
          value={priorityFee}
          onChange={(e) => setPriorityFee(Number(e.target.value))}
          inputProps={{ min: "0", step: "1000" }}
        />
      </Box>

      <Divider sx={{ my: 2, bgcolor: 'rgba(0, 255, 0, 0.2)' }} />

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Filters
        </Typography> <br/>
        <StyledTextField
          label="Max Creation Time (minutes)"
          type="number"
          fullWidth
          value={creationTimeFilter}
          onChange={(e) => setCreationTimeFilter(Number(e.target.value))}
          inputProps={{ min: "0", step: "1" }}
        />
        <StyledTextField
          label="Min 5 min Volume (USD)"
          type="number"
          fullWidth
          margin="normal"
          variant="outlined"
          value={minVolume}
          onChange={handleMinVolumeChange}
          inputProps={{ min: "0", step: "0.1" }}
          placeholder="Enter minimum 5 min volume"
        />
        <StyledTextField
          label="Max 24h Change (%)"
          type="number"
          fullWidth
          margin="normal"
          variant="outlined"
          value={maxPriceChange}
          onChange={(e) => setMaxPriceChange(e.target.value)}
          inputProps={{ min: "0", step: "0.1" }}
        />
        <StyledTextField
          label="Token Name"
          variant="outlined"
          value={nameFilter}
          fullWidth
          onChange={(e) => setNameFilter(e.target.value)}
          placeholder="Enter exact token name"
        />
        <FormControlLabel
          control={
            <StyledSwitch
              checked={requireTwitter}
              onChange={(e) => setRequireTwitter(e.target.checked)}
              color="primary"
            />
          }
          label="Require Twitter Link"
        />
        <FormControlLabel
          control={
            <StyledSwitch
              checked={requireTelegram}
              onChange={(e) => setRequireTelegram(e.target.checked)}
              color="primary"
            />
          }
          label="Require Telegram Link"
        />
      </Box>

      <Divider sx={{ my: 2, bgcolor: 'rgba(0, 255, 0, 0.2)' }} />

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Jito Settings
        </Typography>
        <FormControlLabel
          control={
            <StyledSwitch
              checked={useJito}
              onChange={(e) => setUseJito(e.target.checked)}
              color="primary"
            />
          }
          label="Use Jito Bundles"
        />
        {useJito && (
          <StyledTextField
            label="Jito Tip (Lamports)"
            type="number"
            fullWidth
            value={jitoTipLamports}
            onChange={(e) => setJitoTipLamports(Number(e.target.value))}
            inputProps={{ min: "1000", step: "1000" }}
          />
        )}
      </Box>

      <Divider sx={{ my: 2, bgcolor: 'rgba(0, 255, 0, 0.2)' }} />
      <Typography variant="body2" align="center">
        Made by <Link href="https://twitter.com/theorca_sol" target="_blank" rel="noopener">theorca.sol</Link>
      </Typography>
      
    </StyledPanel>
  );
}

export default ControlPanel;