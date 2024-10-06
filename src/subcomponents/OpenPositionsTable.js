import React, { useState, useCallback, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link

} from '@mui/material';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import InfoIcon from '@mui/icons-material/Info';
import ImageIcon from '@mui/icons-material/Image';
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import evaluateTwitterProfile from '../utils/twitterEvaluator';
import { extractTwitterHandle } from '../utils/extractTwitterHandle';
import PnLCard from './PnLCard';
import html2canvas from 'html2canvas';

function OpenPositionsTable({ openPositions, sellToken, connection, useJito, jitoTipLamports, solPrice }) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedToken, setSelectedToken] = useState(null);
    const [creatorSupply, setCreatorSupply] = useState(null);
    const [twitterEvaluation, setTwitterEvaluation] = useState(null);
    const [isEvaluatingTwitter, setIsEvaluatingTwitter] = useState(false);
    const [twitterAnalytics, setTwitterAnalytics] = useState(null);
    const [isLoadingTwitter, setIsLoadingTwitter] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [isPnLCardOpen, setIsPnLCardOpen] = useState(false);
  
    const fetchTokenAmount = async (ownerAddress, tokenAddress) => {
      try {
        const ownerPublicKey = new PublicKey(ownerAddress);
        const tokenPublicKey = new PublicKey(tokenAddress);
        const userTokenAccountAddress = await getAssociatedTokenAddress(
          tokenPublicKey,
          ownerPublicKey
        );
        const accountInfo = await getAccount(connection, userTokenAccountAddress);
        return Number(accountInfo.amount);
      } catch (error) {
        console.error("Error fetching token amount:", error);
        return 0; // If the account doesn't exist or there's an error, return 0
      }
    };

    const handleOpenPopup = async (token) => {
      console.log('Opening popup for token:', token);
      setSelectedToken(token);
      setIsPopupOpen(true);
      setTwitterAnalytics(null);
      setIsLoadingTwitter(true);

      const twitterLink = token.profile?.links?.find(link => 
        link.includes('twitter.com') || link.includes('x.com')
      );
      console.log('Twitter link:', twitterLink);

      if (twitterLink) {
        const twitterHandle = extractTwitterHandle(twitterLink);
        console.log('Extracted Twitter handle:', twitterHandle);

        if (twitterHandle) {
          try {
            console.log('Calling evaluateTwitterProfile with handle:', twitterHandle);
            const analytics = await evaluateTwitterProfile(twitterHandle);
            console.log('Received Twitter analytics:', analytics);
            setTwitterAnalytics(analytics);
          } catch (error) {
            console.error('Failed to fetch Twitter analytics:', error);
          }
        } else {
          console.log('Failed to extract Twitter handle from link');
        }
      } else {
        console.log('No Twitter link found for this token');
      }
      setIsLoadingTwitter(false);

      console.log("Token details:", {
        name: token.name,
        symbol: token.symbol,
        address: token.address,
        moonshot: token.moonshot,
        baseToken: token.baseToken,
        decimals: token.decimals, // Make sure this is passed from the parent component
      });

      if (token && token.moonshot && token.moonshot.creator) {
        console.log("Token has moonshot data:", token.moonshot);
        try {
          const creatorAmount = await fetchTokenAmount(token.moonshot.creator, token.address);
          console.log("Creator amount:", creatorAmount);
          
          // Calculate total supply based on decimals (assuming 1 billion total supply)
          const totalSupply = 1000000000 * (10 ** token.decimals);
          
          // Calculate the percentage
          const supplyPercentage = (creatorAmount / totalSupply) * 100;
          
          setCreatorSupply(supplyPercentage.toFixed(2));
        } catch (error) {
          console.error("Error calculating creator supply:", error);
          setCreatorSupply("Error");
        }
      } else {
        console.log("Token does not have moonshot data");
      }

      
    };
  
    const handleClosePopup = () => {
      setIsPopupOpen(false);
      setSelectedToken(null);
      setTwitterEvaluation(null);
    };

    const handleOpenPnLCard = useCallback((position) => {
      const invested = position.collateralAmountSol;
      const currentValue = position.amountBought * position.currentPrice / solPrice;
      const profit = currentValue - invested;
      
      setSelectedPosition({
        ...position,
        invested,
        currentValue,
        profit
      });
      setIsPnLCardOpen(true);
    }, [solPrice]);

    const handleClosePnLCard = () => {
      setIsPnLCardOpen(false);
    };

    const handleDownloadPnLCard = () => {
      const card = document.getElementById('pnl-card');
      html2canvas(card, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true
      }).then((canvas) => {
        // Create a new canvas with the same dimensions
        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;
        const ctx = newCanvas.getContext('2d');

        // Draw a rounded rectangle path
        const radius = 48; // Adjust this value to match the card's border radius
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(canvas.width - radius, 0);
        ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
        ctx.lineTo(canvas.width, canvas.height - radius);
        ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
        ctx.lineTo(radius, canvas.height);
        ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();

        // Clip to the rounded rectangle and draw the original canvas
        ctx.clip();
        ctx.drawImage(canvas, 0, 0);

        const link = document.createElement('a');
        link.download = `${selectedPosition.symbol}_pnl.png`;
        link.href = newCanvas.toDataURL('image/png');
        link.click();
      });
    };

    const memoizedPnLCard = useMemo(() => {
      if (selectedPosition && isPnLCardOpen) {
        return (
          <PnLCard
            coinName={selectedPosition.symbol}
            invested={selectedPosition.invested}
            roi={selectedPosition.roi}
            profit={selectedPosition.profit}
            solPrice={solPrice}
          />
        );
      }
      return null;
    }, [selectedPosition, isPnLCardOpen]);

  if (openPositions.length === 0) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 4 }}>
        No open positions.
      </Typography>
    );
  }

  return (
    <>
    <TableContainer component={Paper} sx={{ maxWidth: "100%", overflowX: "auto" }}>
      <Table sx={{ minWidth: 750 }} aria-label="open positions table">
        <TableHead>
          <TableRow>
            <TableCell>Token</TableCell>
            <TableCell align="right">Amount Bought</TableCell>
            <TableCell align="right">Purchase Price (USD)</TableCell>
            <TableCell align="right">Current Price (USD)</TableCell>
            <TableCell align="right">ROI (%)</TableCell>
            <TableCell align="right">Current Value (USD)</TableCell>
            <TableCell align="right">Profit/Loss (USD)</TableCell>
            
          </TableRow>
        </TableHead>
        <TableBody>
          {openPositions.map((position) => {
            const amountBoughtFloat = parseFloat(position.amountBought.toString());
            const currentValue = amountBoughtFloat * position.currentPrice;
            const profitLoss = currentValue - position.totalCostUsd;
            const dexScreenerUrl = `https://dexscreener.com/solana/${position.address}`;

            return (
              <TableRow key={position.id}>
                <TableCell component="th" scope="row">
                  {position.name}
                </TableCell>
                <TableCell align="right">
                  {amountBoughtFloat.toFixed(4)}
                </TableCell>
                <TableCell align="right">
                  ${position.purchasePrice.toFixed(6)}
                </TableCell>
                <TableCell align="right">
                  ${position.currentPrice ? position.currentPrice.toFixed(6) : "N/A"}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: position.roi >= 0 ? "green" : "red" }}
                >
                  {position.roi.toFixed(2)}%
                </TableCell>
                <TableCell align="right">
                  ${currentValue.toFixed(2)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: profitLoss >= 0 ? "green" : "red" }}
                >
                  ${profitLoss.toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => sellToken(position, useJito, jitoTipLamports)}
                    disabled={
                      position.sellStatus === "loading" ||
                      position.sellStatus === "success" ||
                      position.sellStatus === "failed"
                    }
                  >
                    {position.sellStatus === "idle" && "Sell"}
                    {position.sellStatus === "loading" && (
                      <>
                        <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                        Loading...
                      </>
                    )}
                    {position.sellStatus === "success" && "Succeeded"}
                    {position.sellStatus === "failed" && "Failed"}
                  </Button>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Chart" arrow>
                    <IconButton
                      href={dexScreenerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <InsertChartIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View More Details" arrow>
                    <IconButton onClick={() => handleOpenPopup(position)}>
                    <InfoIcon />
                    </IconButton>
                    </Tooltip>
                    <Tooltip title="View PnL Card" arrow>
                    <IconButton onClick={() => handleOpenPnLCard(position)}>
                    <ImageIcon />
                    </IconButton>
                    </Tooltip>
                </TableCell>
                
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
    
    <Dialog open={isPopupOpen} onClose={handleClosePopup}>
        <DialogTitle>Token Details</DialogTitle>
        <DialogContent>
          {selectedToken && (
            <>
              <Typography variant="h6">{selectedToken.name} ({selectedToken.symbol})</Typography>
              <Typography>Purchase Price: ${selectedToken.purchasePrice.toFixed(6)}</Typography>
              <Typography>Current Price: ${selectedToken.currentPrice.toFixed(6)}</Typography>
              <Typography>ROI: {selectedToken.roi.toFixed(2)}%</Typography>
              
              {selectedToken.moonshot && (
                <>
                  <Typography>Creator: {selectedToken.moonshot.creator}</Typography>
                  <Typography>Progress: {selectedToken.moonshot.progress}%</Typography>
                  <Typography>Curve Type: {selectedToken.moonshot.curveType}</Typography>
                  {creatorSupply && (
                    <Typography>Creator Supply: {creatorSupply}%</Typography>
                  )}
                </>
              )}

              {selectedToken.profile?.links && (
                <Typography>
                  Twitter: {
                    selectedToken.profile.links.find(link => 
                      link.includes('twitter.com') || link.includes('x.com')
                    ) ? (
                      <Link 
                        href={selectedToken.profile.links.find(link => 
                          link.includes('twitter.com') || link.includes('x.com')
                        )} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {selectedToken.profile.links.find(link => 
                          link.includes('twitter.com') || link.includes('x.com')
                        )}
                      </Link>
                    ) : 'N/A'
                  }
                </Typography>
              )}

              {isLoadingTwitter && <CircularProgress />}
              
              {!isLoadingTwitter && twitterAnalytics && (
                <>
                  <Typography variant="h6" style={{ marginTop: '20px' }}>Twitter Analytics</Typography>
                  <Typography>Followers: {twitterAnalytics.followerCount || 'N/A'}</Typography>
                  <Typography>Following: {twitterAnalytics.followingCount || 'N/A'}</Typography>
                  <Typography>Tweet Count: {twitterAnalytics.tweetCount || 'N/A'}</Typography>
                  <Typography>Account Age (days): {twitterAnalytics.accountAge ? twitterAnalytics.accountAge.toFixed(2) : 'N/A'}</Typography>
                </>
              )}
              
              {!isLoadingTwitter && !twitterAnalytics && selectedToken.profile?.links?.find(link => 
                link.includes('twitter.com') || link.includes('x.com')
              ) && (
                <Typography>Twitter analytics not available</Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePopup} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    
    <Dialog open={isPnLCardOpen} onClose={handleClosePnLCard}>
      <DialogTitle>PnL Card</DialogTitle>
      <DialogContent>
        <div id="pnl-card-outer">
          {memoizedPnLCard}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDownloadPnLCard}>Download</Button>
        <Button onClick={handleClosePnLCard}>Close</Button>
      </DialogActions>
    </Dialog>
  </>
  );
}

export default React.memo(OpenPositionsTable);