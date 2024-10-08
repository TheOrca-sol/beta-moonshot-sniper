import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Container,
    Box,
    IconButton,
    Tooltip,
    LinearProgress,
    SvgIcon,
    CircularProgress,
    Switch,
    FormControlLabel,
    Button,
    Grid,
  } from "@mui/material";
  import {
    ComputeBudgetProgram,
    Connection,
    Keypair,
    TransactionMessage,
    VersionedTransaction,
    LAMPORTS_PER_SOL,
    PublicKey,
  } from "@solana/web3.js";
  import TokenRadar from './subcomponents/TokenRadar';
import ControlPanel from './subcomponents/ControlPanel';
import ActivityFeed from './subcomponents/ActivityFeed';
import PerformanceMetrics from './subcomponents/PerformanceMetrics';
import OpenPositionsTable from './subcomponents/OpenPositionsTable';
import { toast, ToastContainer } from 'react-toastify';
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import Big from "big.js";
import 'react-toastify/dist/ReactToastify.css';
import bs58 from 'bs58';
import bs64 from 'base64-js'; // Install this library if you haven't already
import { debounce } from 'lodash';

import {
    Language as WebsiteIcon,
    Twitter as TwitterIcon,
    Telegram as TelegramIcon,
    Link as LinkIcon,
  } from "@mui/icons-material";
  import { Environment, FixedSide, Moonshot } from "@wen-moon-ser/moonshot-sdk";
  import { styled } from '@mui/system';
  import { sendBundle } from './utils/jitoUtils';
  import notificationSound from './assets/notification.mp3';
  


const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#000',
  minHeight: '100vh',
  color: theme.palette.primary.main,
}));

const LeftColumnContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

// Custom Discord icon component
function DiscordIcon(props) {
    return (
      <SvgIcon {...props}>
        {/* Replace the path below with the actual SVG path for Discord */}
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515..." />
      </SvgIcon>
    );
  }

function AdvancedSniperDashboard() {
    const [tokens, setTokens] = useState([]);
    const [moonshot, setMoonshot] = useState(null);
    const [connection, setConnection] = useState(null);
    const processingTokensRef = useRef(new Set()); // To track tokens being processed
    const purchasedTokensRef = useRef(new Set()); // Use useRef to store purchased tokens
    const [loading, setLoading] = useState(false); // Loading state for data fetching
    const [autoBuyEnabled, setAutoBuyEnabled] = useState(false); // Auto-buy switch
    const intervalIdRef = useRef(null); // To store interval ID
    const [openPositions, setOpenPositions] = useState([]);
    const openPositionsRef = useRef([]);
    const [solPrice, setSolPrice] = useState(null); // SOL price in USD
    const [error, setError] = useState(null); // Error state for user feedback
    const [collateralAmountSol, setCollateralAmountSol] = useState(0.1); // Default value
    const [slippageBps, setSlippageBps] = useState(1500); // Default slippage in basis points
    const pendingTransactions = useRef([]);
    // State for Private Key and RPC URL
    const [privateKey, setPrivateKey] = useState('');
    const [rpcUrl, setRpcUrl] = useState(''); // Default RPC URL
    const [creationTimeFilter, setCreationTimeFilter] = useState(2);

    // State for Connection and Keypair
    const [keypair, setKeypair] = useState(null);
    const [maxPriceChange, setMaxPriceChange] = useState(15);
    const [minPriceChange, setMinPriceChange] = useState('');
    const [requireTwitter, setRequireTwitter] = useState(false);
    const [nameFilter, setNameFilter] = useState(''); // New state for name filter
    const [hasRole, setHasRole] = useState(false); // Determines if user has the required role
    const [authLoading, setAuthLoading] = useState(true); // New loading state for user verification
    const [authError, setAuthError] = useState(null); // New error state for user verification
    const [maxRetries, setMaxRetries] = useState(3); // Default to 0 retries
    const [stopLoss, setStopLoss] = useState(10); // Default stop loss set to 10%
    const [takeProfitPercentage, setTakeProfitPercentage] = useState(100); // Default to 0 or any valid value
    const [requireTelegram, setRequireTelegram] = useState(false); // New state for Telegram filter
    const [trailingStopLoss, setTrailingStopLoss] = useState(0);
    const [inactivityThreshold, setInactivityThreshold] = useState(10);
    const [minVolume, setMinVolume] = useState(0); // Add volume state
    const [useJito, setUseJito] = useState(false);
    const [jitoTipLamports, setJitoTipLamports] = useState(200000);
    const [priorityFee, setPriorityFee] = useState(200000);
    const audio = new Audio(notificationSound);
  
  
  
  
    // Initialize Connection and Moonshot when connection and keypair are set
    useEffect(() => {
      if (rpcUrl && keypair) {
        const newConnection = new Connection(rpcUrl, 'confirmed');
        setConnection(newConnection);
  
        const newMoonshot = new Moonshot({
          rpcUrl,
          environment: Environment.MAINNET,
          chainOptions: {
            solana: { confirmOptions: { commitment: "confirmed" } },
          },
        });
        setMoonshot(newMoonshot);
  
        // Fetch data immediately
        fetchAndDisplayTokens();
  
        return () => {
          // Clear interval when component unmounts
          if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
          }
        };
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rpcUrl, keypair]);
  
    // Initialize Connection and Keypair based on user input
    useEffect(() => {
      if (privateKey && rpcUrl) {
        try {
          // Decode the Base58 private key
          const decodedKey = bs58.decode(privateKey);
          
          // Ensure the private key has the correct length (64 bytes)
          if (decodedKey.length !== 64) {
            throw new Error('Invalid private key length. Expected 64 bytes.');
          }
          
          // Create Keypair
          const userKeypair = Keypair.fromSecretKey(decodedKey);
          setKeypair(userKeypair);
  
          // Initialize Connection will be handled by the previous useEffect
  
          toast.success('Private key and RPC URL set successfully.');
        } catch (error) {
          console.error('Error initializing keypair or connection:', error);
          toast.error(`Initialization Error: ${error.message}`);
          setKeypair(null);
          setConnection(null);
        }
      } else {
        // Reset connection and keypair if inputs are cleared
        setConnection(null);
        setKeypair(null);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [privateKey, rpcUrl]);
  
  
  
  
    // Constants
    const TOTAL_SUPPLY = 1000000000; // 1,000,000,000 tokens
  
  
    const fetchTokenPricesFromDexScreener = async (tokenAddresses) => {
      try {
        const chunkSize = 30; // DexScreener allows up to 30 token addresses per request
        const chunks = [];
    
        for (let i = 0; i < tokenAddresses.length; i += chunkSize) {
          chunks.push(tokenAddresses.slice(i, i + chunkSize));
        }
    
        const priceData = {};
    
        const fetchPromises = chunks.map(async (chunk) => {
          const addresses = chunk.join(",");
          const response = await fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${addresses}`
          );
    
          if (!response.ok) {
            throw new Error(`DexScreener API error! Status: ${response.status}`);
          }
    
          const data = await response.json();
    
          if (data && data.pairs) {
            data.pairs.forEach((pair) => {
              if (pair.priceUsd) {
                priceData[pair.baseToken.address] = parseFloat(pair.priceUsd);
              } else {
                priceData[pair.baseToken.address] = null; // Price not available
              }
            });
          }
        });
    
        await Promise.all(fetchPromises);
    
        return priceData;
      } catch (error) {
        console.error("Error fetching token prices from DexScreener:", error);
        setError("Failed to fetch token prices. Please try again later.");
        return {};
      }
    };
    
  
  
    // Initialize Moonshot and Connection
    
  
    // Fetch SOL price using CoinGecko API when the component mounts
    useEffect(() => {
      const fetchSolPrice = async () => {
        try {
          const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
          );
          if (!response.ok) {
            throw new Error(`CoinGecko API error! Status: ${response.status}`);
          }
          const data = await response.json();
  
          if (data && data.solana && typeof data.solana.usd === "number") {
            const solPriceUsd = parseFloat(data.solana.usd);
            setSolPrice(solPriceUsd);
            setError(null); // Clear previous errors
          } else {
            throw new Error("Invalid CoinGecko SOL price response.");
          }
        } catch (error) {
          console.error("Error fetching SOL price:", error);
          setError("Failed to fetch SOL price. Please try again later.");
        }
      };
      fetchSolPrice();
    }, []);
  
    // Start or stop the interval based on autoBuyEnabled
    // Start or stop the interval based on autoBuyEnabled
    useEffect(() => {
      if (autoBuyEnabled && connection && moonshot) {
        // Start interval
        intervalIdRef.current = setInterval(fetchAndDisplayTokens, 5000); // Fetch every 15 seconds to reduce rate limits
      } else {
        // Stop interval
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }
      }
  
      // Clean up on unmount
      return () => {
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoBuyEnabled, connection, moonshot]);
  
    const debouncedSetOpenPositions = useCallback(
      debounce((updatedPositions) => {
        setOpenPositions(updatedPositions);
        openPositionsRef.current = updatedPositions;
      }, 200),
      []
    );

    const updatePositions = useCallback(async () => {
      const positions = openPositionsRef.current;
      if (positions.length === 0) return;

      try {
        const tokenAddresses = positions.map(position => position.address);
        const pricesFromDexScreener = await fetchTokenPricesFromDexScreener(tokenAddresses);

        const updatedPositions = positions.map((position) => {
          const currentPrice = pricesFromDexScreener[position.address] || position.currentPrice || 0;
          const roi = position.purchasePrice > 0
            ? ((currentPrice - position.purchasePrice) / position.purchasePrice) * 100
            : 0;

          // Only update highestPrice and check trailing stop if trailingStopLoss > 0
          let highestPrice = position.highestPrice || position.purchasePrice;
          let shouldSellDueToTrailingStop = false;

          if (trailingStopLoss > 0) {
            highestPrice = Math.max(highestPrice, currentPrice);
            const trailingStopPrice = highestPrice * (1 - trailingStopLoss / 100);
            shouldSellDueToTrailingStop = currentPrice <= trailingStopPrice;
          }

          // Check if the price has dropped below the stop loss percentage
          const shouldSellDueToStopLoss = stopLoss > 0 && roi <= -stopLoss;

          // Check if the price has reached or exceeded the take profit percentage
          const shouldSellDueToTakeProfit = takeProfitPercentage > 0 && roi >= takeProfitPercentage;

          // Trigger a sell if any of the conditions are met
          if (shouldSellDueToTrailingStop || shouldSellDueToStopLoss || shouldSellDueToTakeProfit) {
            sellToken(position);
          }

          return {
            ...position,
            currentPrice,
            highestPrice,
            roi,
          };
        });

        debouncedSetOpenPositions(updatedPositions);
        setError(null);
      } catch (error) {
        console.error("Error updating positions:", error);
        setError("Failed to update positions. Please try again later.");
      }
    }, [stopLoss, takeProfitPercentage, trailingStopLoss, sellToken]);

    useEffect(() => {
      const interval = setInterval(updatePositions, 2000); // Update every 2 seconds

      return () => clearInterval(interval);
    }, [updatePositions]);
  
    // Function to fetch and display tokens
    async function fetchAndDisplayTokens() {
      setLoading(true); // Set loading to true before fetching
      try {
        const response = await fetch("https://api.moonshot.cc/tokens/v1/new/solana");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTokens(data);
  
        // Extract all token addresses
        const tokenAddresses = data.map((token) => token.baseToken.address);
  
        // Fetch prices from DexScreener
        const pricesFromDexScreener = await fetchTokenPricesFromDexScreener(tokenAddresses);
  
        // Update token data with fetched prices
        const updatedTokens = data.map((token) => ({
          ...token,
          currentPriceUsd: pricesFromDexScreener[token.baseToken.address] || parseFloat(token.priceUsd) || 0, // Use DexScreener price or fallback to Moonshot's price
        }));
  
        setTokens(updatedTokens);
  
        if (autoBuyEnabled) {
          await checkAndBuyTokens(updatedTokens); // Wait for token purchases to complete
        }
  
        setError(null); // Clear previous errors
      } catch (error) {
        console.error("Error fetching token data:", error);
        setError("Failed to fetch token data. Please try again later.");
      } finally {
        setLoading(false); // Set loading to false after fetching is done
      }
    }
  
    // Function to check and buy tokens based on criteria
    async function checkAndBuyTokens(tokens) {
      // Exit early if auto-buy is disabled
      if (!autoBuyEnabled) return;
    
      // Filter tokens based on the criteria from the sidebar
    const filteredTokens = tokens.filter((token) => {
      const change = token.priceChange?.h24;
      const hasTwitter = token.profile?.links?.some((link) =>
        link.includes('twitter.com') || link.includes('x.com')
      );
      const hasTelegram = token.profile?.links?.some((link) =>
        link.includes('t.me') || link.includes('telegram')
      );
      const createdAt = new Date(token.createdAt);
      const creationTimeWindowMs = creationTimeFilter * 60 * 1000; // Convert minutes to milliseconds

      const creationTimeThreshold = new Date(Date.now() - creationTimeWindowMs);
      const volume = token.volume?.m5?.total || 0;
  
  
      const volumeCondition = volume >= minVolume;
  
      // Hardcoded minPriceChange set to 0
      const minPriceChange = 0;
  
       // Name filter condition
      const nameCondition = nameFilter
      ? token.baseToken.name.toLowerCase() === nameFilter.trim().toLowerCase()
      : true; // If no filter, include all
  
      // Apply filtering logic
      const changeCondition =
        change >= minPriceChange &&
        (!maxPriceChange || change <= parseFloat(maxPriceChange));
  
      const twitterCondition = !requireTwitter || hasTwitter;
      const telegramCondition = !requireTelegram || hasTelegram;
      const creationTimeCondition = createdAt > creationTimeThreshold;
  
      return changeCondition && twitterCondition && telegramCondition && creationTimeCondition && nameCondition && volumeCondition;
    });
    
      // Process token purchases sequentially
      for (const token of filteredTokens) {
        const tokenAddress = token.baseToken.address;
    
        // Check if the token is already purchased or being processed
        if (
          processingTokensRef.current.has(tokenAddress) ||
          purchasedTokensRef.current.has(tokenAddress)
        ) {
          console.log(`Token ${token.baseToken.symbol} already purchased or in process.`);
          continue;
        }
    
        // Mark token as being processed
        processingTokensRef.current.add(tokenAddress);
    
        try {
          await buyToken(token);
          // After successful purchase, mark as purchased
          purchasedTokensRef.current.add(tokenAddress);
        } catch (error) {
          console.error(`Error buying token ${token.baseToken.symbol}:`, error);
          setError(`Error buying token ${token.baseToken.symbol}. Please try again.`);
          // If there was an error, remove the token from the tracking set
          processingTokensRef.current.delete(tokenAddress);
        }
      }
    }
    
      // Utility function to confirm transaction with timeout
    async function confirmTransactionWithTimeout(connection, txHash, timeout) {
      const startTime = Date.now();
      let status = null;
    
      while (Date.now() - startTime < timeout) {
        const signatureStatuses = await connection.getSignatureStatuses([txHash]);
        status = signatureStatuses && signatureStatuses.value[0];
    
        if (status && status.confirmations) {
          if (status.err) {
            throw new Error(
              `Transaction ${txHash} failed: ${JSON.stringify(status.err)}`
            );
          } else {
            console.log(`Transaction ${txHash} confirmed in slot ${status.slot}`);
            return status;
          }
        }
    
        // Wait for 2 seconds before checking again
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    
      throw new Error(
        `Transaction ${txHash} was not confirmed within ${timeout / 1000} seconds`
      );
    }
      // Function to check pending transactions
    async function checkPendingTransactions() {
      const txHashes = pendingTransactions.current;
      if (txHashes.length === 0) return;
    
      const statuses = await connection.getSignatureStatuses(txHashes);
      statuses.value.forEach((status, index) => {
        const txHash = txHashes[index];
        if (status && status.confirmations) {
          if (status.err) {
            console.error(`Transaction ${txHash} failed: ${JSON.stringify(status.err)}`);
            // Handle failed transaction
          } else {
            console.log(`Transaction ${txHash} confirmed in slot ${status.slot}`);
            // Update application state
          }
          // Remove from pendingTransactions
          pendingTransactions.current = pendingTransactions.current.filter((hash) => hash !== txHash);
        }
      });
    }
    // Set up interval to check pending transactions
    useEffect(() => {
      const interval = setInterval(checkPendingTransactions, 3000); // Check every 5 seconds
      return () => clearInterval(interval);
    }, [connection]);
    
    // Function to buy a token
    async function buyToken(token) {
      if (!moonshot || !connection || !keypair || !autoBuyEnabled) return;

      const tokenAddress = new PublicKey(token.baseToken.address);
      const userTokenAccountAddress = await getAssociatedTokenAddress(
        tokenAddress,
        keypair.publicKey
      );

      // Fetch the previous balance
      let previousBalance = 0;
      try {
        const accountInfo = await getAccount(connection, userTokenAccountAddress);
        previousBalance = Number(accountInfo.amount);
      } catch (error) {
        // If the account doesn't exist pre-transaction, it's fine, leave it as 0
        console.log("No previous balance found, assuming 0");
      }

      // Validate collateral amount
      if (collateralAmountSol <= 0 || isNaN(collateralAmountSol)) {
        console.error("Invalid collateral amount. Cannot proceed with purchase.");
        setError("Invalid collateral amount. Cannot proceed with purchase.");
        return;
      }

      // Ensure SOL price is available
      if (!solPrice) {
        console.error("SOL price not available. Cannot proceed with purchase.");
        setError("SOL price not available. Cannot proceed with purchase.");
        return;
      }

      try {
        // Mark token as being processed
        processingTokensRef.current.add(tokenAddress.toString());

        const moonshotToken = moonshot.Token({
          mintAddress: tokenAddress.toString(),
        });

        // Prepare transaction
        const collateralAmount = BigInt(
          Math.round(collateralAmountSol * LAMPORTS_PER_SOL)
        );
        const tokenAmount = await moonshotToken.getTokenAmountByCollateral({
          collateralAmount,
          tradeDirection: "BUY",
        });

        const { ixs } = await moonshotToken.prepareIxs({
          slippageBps: slippageBps,
          creatorPK: keypair.publicKey.toBase58(),
          tokenAmount: tokenAmount.toString(),
          collateralAmount: collateralAmount.toString(),
          tradeDirection: "BUY",
          fixedSide: FixedSide.IN,
        });

        if (!ixs || ixs.length === 0) {
          throw new Error("No instructions to send in transaction.");
        }

        const priorityIx = ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: priorityFee,
        });

        const blockhash = await connection.getLatestBlockhash("confirmed");
        const messageV0 = new TransactionMessage({
          payerKey: keypair.publicKey,
          recentBlockhash: blockhash.blockhash,
          instructions: [priorityIx, ...ixs],
        }).compileToV0Message();

        const transaction = new VersionedTransaction(messageV0);
        transaction.sign([keypair]);

        let txHash;

        if (useJito) {
          // Use Jito for transaction
          const tipLamports = jitoTipLamports;
          txHash = await sendBundle(
            [transaction], 
            blockhash.blockhash, 
            blockhash.lastValidBlockHeight, 
            tipLamports, 
            keypair.publicKey, 
            keypair, 
            connection
          );
          
          console.log(`Jito bundle sent for token ${token.baseToken.symbol}. Bundle ID:`, txHash);
          // For Jito transactions, we need to wait a bit longer
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
        } else {
          // Use normal transaction sending
          txHash = await connection.sendTransaction(transaction, {
            skipPreflight: false,
            maxRetries: maxRetries,
            preflightCommitment: "confirmed",
          });

          // Confirm the transaction with extended timeout only for non-Jito transactions
          try {
            const confirmation = await confirmTransactionWithTimeout(
              connection,
              txHash,
              60000 // 60 seconds
            );
            console.log(
              `Bought token ${token.baseToken.symbol} for ${collateralAmountSol} SOL. Transaction Hash:`,
              txHash
            );
          } catch (error) {
            console.warn(
              `Transaction ${txHash} not confirmed within timeout. It may still succeed.`
            );
          }
        }

        // Fetch the user's associated token account after the transaction
        let newBalance = 0;
        let retries = 5;
        while (retries > 0) {
          try {
            const accountInfo = await getAccount(connection, userTokenAccountAddress);
            newBalance = Number(accountInfo.amount);
            break; // If successful, exit the loop
          } catch (error) {
            console.log(`Attempt to fetch new balance failed. Retries left: ${retries}`);
            retries--;
            if (retries === 0) {
              console.error("Error fetching new balance:", error);
              throw new Error("Failed to fetch new token balance after purchase");
            }
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds before retrying
          }
        }

        // Calculate the actual amount bought
        const actualAmountBought = newBalance - previousBalance;

        // Ensure that some tokens were actually bought
        if (actualAmountBought <= 0) {
          throw new Error("No tokens were bought. Please check the transaction.");
        }

        console.log(`Actual amount bought: ${actualAmountBought}`);

        // Convert to human-readable format based on decimals
        const amountBoughtDecimals = token.baseToken.decimals || 9;
        const amountBought = Number(
          Big(actualAmountBought.toString()).div(Big(10).pow(amountBoughtDecimals))
        );

        console.log(`Amount bought (human-readable): ${amountBought}`);

        // Fetch latest price
        const currentPriceUsd = parseFloat(token.priceUsd) || 0;

        // Add to open positions
        const newPosition = {
          id: txHash,
          address: tokenAddress.toString(),
          symbol: token.baseToken.symbol,
          name: token.baseToken.name,
          purchasePrice: currentPriceUsd,
          amountBought: amountBought,
          collateralAmountSol,
          totalCostUsd: collateralAmountSol * solPrice,
          purchaseTime: new Date(),
          currentPrice: currentPriceUsd,
          roi: 0,
          sellStatus: "idle",
          decimals: amountBoughtDecimals,
          baseToken: token.baseToken,
          moonshot: token.moonshot,
          profile: token.profile,
        };

        setOpenPositions((prevPositions) => {
          const exists = prevPositions.some((p) => p.address === tokenAddress.toString());
          if (exists) {
            console.log(`Position for ${newPosition.symbol} already exists.`);
            return prevPositions;
          }
          const updatedPositions = [...prevPositions, newPosition];
          openPositionsRef.current = updatedPositions;

          // Play notification sound
          audio.play().catch(error => console.error("Error playing audio:", error));

          return updatedPositions;
        });

        setError(null); // Clear previous errors
      } catch (error) {
        console.error(`Error buying token ${token.baseToken.symbol}:`, error);
        setError(`Error buying token ${token.baseToken.symbol}. Please try again.`);
      } finally {
        // Remove token from processingTokensRef regardless of success or failure
        processingTokensRef.current.delete(tokenAddress.toString());
      }
    }
    
    
    
    
    
    
  
    // Function to sell a token
    async function sellToken(position, useJito = false) {
      const {
        address: tokenAddress,
        symbol,
        sellStatus,
        amountBought,
        decimals,
      } = position;

      if (sellStatus === "loading" || sellStatus === "success") {
        console.log(`Sell operation already in progress for ${symbol}.`);
        return;
      }

      try {
        setOpenPositions((prevPositions) =>
          prevPositions.map((p) =>
            p.address === tokenAddress ? { ...p, sellStatus: "loading" } : p
          )
        );

        if (!moonshot || !connection || !keypair) {
          throw new Error("Moonshot SDK, connection, or keypair not initialized.");
        }

        const moonshotToken = moonshot.Token({
          mintAddress: tokenAddress,
        });

        const tokenDecimals = decimals !== undefined ? decimals : 9;
        const tokenAmount = BigInt(
          Math.round(amountBought * Math.pow(10, tokenDecimals))
        );

        console.log(`Attempting to sell ${tokenAmount.toString()} units of token ${symbol}`);

        const collateralAmount = await moonshotToken.getCollateralAmountByTokens({
          tokenAmount,
          tradeDirection: "SELL",
        });

        const { ixs } = await moonshotToken.prepareIxs({
          slippageBps: slippageBps,
          creatorPK: keypair.publicKey.toBase58(),
          tokenAmount: tokenAmount.toString(),
          collateralAmount: collateralAmount.toString(),
          tradeDirection: "SELL",
          fixedSide: FixedSide.IN,
        });

        const priorityIx = ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: priorityFee,
        });

        const blockhash = await connection.getLatestBlockhash("confirmed");

        const messageV0 = new TransactionMessage({
          payerKey: keypair.publicKey,
          recentBlockhash: blockhash.blockhash,
          instructions: [priorityIx, ...ixs],
        }).compileToV0Message();

        const transaction = new VersionedTransaction(messageV0);
        transaction.sign([keypair]);

        let txHash;

        if (useJito) {
          // Use Jito for transaction
          const tipLamports = jitoTipLamports;
          txHash = await sendBundle([transaction], blockhash.blockhash, blockhash.lastValidBlockHeight, tipLamports, keypair.publicKey, keypair, connection);
          console.log(`Jito bundle sent for selling token ${symbol}. Bundle ID:`, txHash);
          // For Jito transactions, we need to wait a bit longer
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
        } else {
          // Use normal transaction sending
          txHash = await connection.sendTransaction(transaction, {
            skipPreflight: false,
            maxRetries: maxRetries,
            preflightCommitment: "confirmed",
          });
        }

        // Confirm the transaction with extended timeout
        try {
          await confirmTransactionWithTimeout(
            connection,
            txHash,
            30000 // 30 seconds
          );
          console.log(`Sold token ${symbol}. Transaction Hash:`, txHash);
        } catch (error) {
          console.warn(
            `Transaction ${txHash} not confirmed within timeout. It may still succeed.`
          );
        }

        setOpenPositions((prevPositions) =>
          prevPositions.map((p) =>
            p.address === tokenAddress ? { ...p, sellStatus: "success" } : p
          )
        );
        toast.success(`Successfully sold token ${symbol}!`);

        // Set a timeout to remove the sold token after 1 minute
        setTimeout(() => {
          setOpenPositions((prevPositions) =>
            prevPositions.filter((p) => p.address !== tokenAddress)
          );
          openPositionsRef.current = openPositionsRef.current.filter((p) => p.address !== tokenAddress);
        }, 2 * 1000); // 60 seconds (1 minute)

      } catch (error) {
        console.error(`Error selling token ${symbol}:`, error);

        let errorMessage = `Error selling token ${symbol}. Please try again.`;

        // Parse specific errors based on error messages
        if (error.message.includes("SlippageOverflow")) {
          errorMessage = "Transaction failed due to slippage overflow. Please adjust your slippage settings.";
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "You do not have enough tokens to complete this transaction.";
        } else if (error.message.includes("No tokens available")) {
          errorMessage = "No tokens available to sell.";
        } else if (error.message.includes("Account does not exist")) {
          errorMessage = "The token account does not exist. Please try again later.";
        }

        setError(errorMessage);
        toast.error(errorMessage);

        setOpenPositions((prevPositions) =>
          prevPositions.map((p) =>
            p.address === tokenAddress ? { ...p, sellStatus: "failed" } : p
          )
        );

        setTimeout(() => {
          setOpenPositions((prevPositions) =>
            prevPositions.map((p) =>
              p.address === tokenAddress ? { ...p, sellStatus: "idle" } : p
            )
          );
        }, 3000); // 3 seconds

        purchasedTokensRef.current.delete(tokenAddress);
        toast.error(`Failed to sell token ${symbol}: ${error.message}`);
      }
    }
    
    
    
    
    
    // Utility function to format time ago
    function formatTimeAgo(timestamp) {
      if (!timestamp) return "N/A";
      const now = Date.now();
      const createdDate = new Date(timestamp);
  
      // Check if the timestamp is in the future
      if (createdDate > now) {
        console.log("Future timestamp detected:", timestamp);
        return "Coming soon";
      }
  
      const diffInSeconds = Math.floor((now - createdDate) / 1000);
  
      if (diffInSeconds < 60) {
        return `${diffInSeconds} sec ago`;
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} min ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hours ago`;
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} days ago`;
      }
    }
  
    // Utility function to get the appropriate icon for a link
    function getLinkIcon(url) {
      if (url.includes("twitter.com") || url.includes("x.com")) {
        return <TwitterIcon />;
      } else if (url.includes("t.me") || url.includes("telegram")) {
        return <TelegramIcon />;
      } else if (url.includes("discord")) {
        return <DiscordIcon />;
      } else if (url.startsWith("http") || url.startsWith("www")) {
        return <WebsiteIcon />;
      } else {
        return <LinkIcon />;
      }
    }
  
    // Filter tokens based on 24h change, presence of Twitter link, and creation time
    const filteredTokens = tokens.filter((token) => {
      const change = token.priceChange?.h24;
      const hasTwitter = token.profile?.links?.some((link) =>
        link.includes('twitter.com') || link.includes('x.com')
      );
      const createdAt = new Date(token.createdAt);
      const creationTimeWindowMs = creationTimeFilter * 60 * 1000; // Convert minutes to milliseconds

      const creationTimeThreshold = new Date(Date.now() - creationTimeWindowMs);
  
      // Hardcoded minPriceChange set to 0
      const minPriceChange = 0;
  
      // Apply filtering logic
      const changeCondition =
        change >= minPriceChange &&
        (!maxPriceChange || change <= parseFloat(maxPriceChange));
  
      const twitterCondition = !requireTwitter || hasTwitter;
      const creationTimeCondition = createdAt > creationTimeThreshold;
      
  
      return changeCondition && twitterCondition && creationTimeCondition ;
    });
  
  

  return (
    <DashboardContainer>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <LeftColumnContainer>
            <TokenRadar tokens={filteredTokens} loading={loading} />
            <Box>
              
              <OpenPositionsTable 
                openPositions={openPositions} 
                sellToken={sellToken}
                connection={connection}
                useJito={useJito}
                jitoTipLamports={jitoTipLamports}
                solPrice={solPrice}
                keypair={keypair}

              />
            </Box>
          </LeftColumnContainer>
        </Grid>
        <Grid item xs={12} lg={4}>
          <ControlPanel
            privateKey={privateKey}
            setPrivateKey={setPrivateKey}
            rpcUrl={rpcUrl}
            setRpcUrl={setRpcUrl}
            autoBuyEnabled={autoBuyEnabled}
            setAutoBuyEnabled={setAutoBuyEnabled}
            collateralAmountSol={collateralAmountSol}
            setCollateralAmountSol={setCollateralAmountSol}
            slippageBps={slippageBps}
            setSlippageBps={setSlippageBps}
            maxPriceChange={maxPriceChange}
            setMaxPriceChange={setMaxPriceChange}
            requireTwitter={requireTwitter}
            setRequireTwitter={setRequireTwitter}
            nameFilter={nameFilter}
            setNameFilter={setNameFilter}
            maxRetries={maxRetries}
            setMaxRetries={setMaxRetries}
            stopLoss={stopLoss}
            setStopLoss={setStopLoss}
            takeProfitPercentage={takeProfitPercentage}
            setTakeProfitPercentage={setTakeProfitPercentage}
            requireTelegram={requireTelegram}
            setRequireTelegram={setRequireTelegram}
            trailingStopLoss={trailingStopLoss}
            setTrailingStopLoss={setTrailingStopLoss}
            inactivityThreshold={inactivityThreshold}
            setInactivityThreshold={setInactivityThreshold}
            minVolume={minVolume}
            setMinVolume={setMinVolume}
            creationTimeFilter={creationTimeFilter}
            setCreationTimeFilter={setCreationTimeFilter}
            useJito={useJito}
            setUseJito={setUseJito}
            jitoTipLamports={jitoTipLamports}
            setJitoTipLamports={setJitoTipLamports}
            priorityFee={priorityFee}
            setPriorityFee={setPriorityFee}
         
          />
        </Grid>
        <Grid item xs={12} md={6} display='none'>
          <ActivityFeed />
        </Grid>
        <Grid item xs={12} md={6} display='none'>
          <PerformanceMetrics />
        </Grid>
      </Grid>
      <ToastContainer />
    </DashboardContainer>
  );
}

export default React.memo(AdvancedSniperDashboard);
