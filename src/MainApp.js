import React, { useEffect, useState, useRef } from "react";
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
  Language as WebsiteIcon,
  Twitter as TwitterIcon,
  Telegram as TelegramIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import { Environment, FixedSide, Moonshot } from "@wen-moon-ser/moonshot-sdk";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  TransactionMessage,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import Big from "big.js";
import bs58 from "bs58";
import { Buffer } from "buffer";
import process from "process";
import BN from 'bn.js'; // Ensure this import is present

import Sidebar from './Sidebar';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { InsertChart as InsertChartIcon } from '@mui/icons-material';
import axios from 'axios';



window.Buffer = Buffer;
window.process = process;

// Custom Discord icon component
function DiscordIcon(props) {
  return (
    <SvgIcon {...props}>
      {/* Replace the path below with the actual SVG path for Discord */}
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515..." />
    </SvgIcon>
  );
}

function App() {
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
  const [collateralAmountSol, setCollateralAmountSol] = useState(0.01); // Default value
  const [slippageBps, setSlippageBps] = useState(1500); // Default slippage in basis points
  const pendingTransactions = useRef([]);
  // State for Private Key and RPC URL
  const [privateKey, setPrivateKey] = useState('');
  const [rpcUrl, setRpcUrl] = useState(''); // Default RPC URL

  // State for Connection and Keypair
  const [keypair, setKeypair] = useState(null);
  const [maxPriceChange, setMaxPriceChange] = useState(10);
  const [minPriceChange, setMinPriceChange] = useState('');
  const [requireTwitter, setRequireTwitter] = useState(false);
  const [nameFilter, setNameFilter] = useState(''); // New state for name filter
  const [user, setUser] = useState(null); // Holds the authenticated user data
  const [hasRole, setHasRole] = useState(false); // Determines if user has the required role
  const [authLoading, setAuthLoading] = useState(true); // New loading state for user verification
  const [authError, setAuthError] = useState(null); // New error state for user verification



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
  const CREATION_TIME_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

  // Function to fetch prices using DexScreener API
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
      intervalIdRef.current = setInterval(fetchAndDisplayTokens, 15000); // Fetch every 15 seconds to reduce rate limits
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

  // Update open positions every 10 seconds based on latest prices from DexScreener
  useEffect(() => {
    const updatePositions = async () => {
      const positions = openPositionsRef.current;
      if (positions.length === 0) return;

      try {
        // Extract all token addresses from open positions
        const tokenAddresses = positions.map((position) => position.address);

        // Fetch current prices from DexScreener
        const prices = await fetchTokenPricesFromDexScreener(tokenAddresses);

        const updatedPositions = positions.map((position) => {
          const currentPrice = prices[position.address] || position.currentPrice; // Fallback to existing price
          const roi =
            position.purchasePrice > 0
              ? ((currentPrice - position.purchasePrice) / position.purchasePrice) * 100
              : 0;

          return {
            ...position,
            currentPrice,
            roi,
          };
        });

        setOpenPositions(updatedPositions);
        openPositionsRef.current = updatedPositions; // Update the ref
        setError(null); // Clear previous errors
      } catch (error) {
        console.error("Error updating positions:", error);
        setError("Failed to update positions. Please try again later.");
      }
    };

    const interval = setInterval(updatePositions, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []); // Removed [tokens] dependency to allow continuous updates

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
      const prices = await fetchTokenPricesFromDexScreener(tokenAddresses);

      // Update token data with fetched prices
      const updatedTokens = data.map((token) => ({
        ...token,
        currentPriceUsd: prices[token.baseToken.address] || parseFloat(token.priceUsd) || 0,
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
    const createdAt = new Date(token.createdAt);
    const creationTimeThreshold = new Date(Date.now() - CREATION_TIME_WINDOW_MS);

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
    const creationTimeCondition = createdAt > creationTimeThreshold;

    return changeCondition && twitterCondition && creationTimeCondition && nameCondition;
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
    const interval = setInterval(checkPendingTransactions, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [connection]);
  
  // Function to buy a token
  async function buyToken(token) {
    if (!moonshot || !connection || !keypair || !autoBuyEnabled) return;
  
    const tokenAddress = token.baseToken.address;
  
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
      processingTokensRef.current.add(tokenAddress);
  
      // Fetch the user's associated token account before the transaction
      const userTokenAccountAddress = await getAssociatedTokenAddress(
        new PublicKey(tokenAddress),
        keypair.publicKey
      );
  
      let previousBalance = 0;
      try {
        const accountInfo = await getAccount(connection, userTokenAccountAddress);
        previousBalance = Number(accountInfo.amount);
      } catch (error) {
        // If the account doesn't exist, previous balance is 0
        previousBalance = 0;
      }
  
      const moonshotToken = moonshot.Token({
        mintAddress: tokenAddress,
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
        tokenAmount,
        collateralAmount,
        tradeDirection: "BUY",
        fixedSide: FixedSide.IN,
      });
  
      if (!ixs || ixs.length === 0) {
        throw new Error("No instructions to send in transaction.");
      }
  
      const priorityIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 200_000,
      });
  
      const blockhash = await connection.getLatestBlockhash("confirmed");
      const messageV0 = new TransactionMessage({
        payerKey: keypair.publicKey,
        recentBlockhash: blockhash.blockhash,
        instructions: [priorityIx, ...ixs],
      }).compileToV0Message();
  
      const transaction = new VersionedTransaction(messageV0);
      transaction.sign([keypair]);
  
      const txHash = await connection.sendTransaction(transaction, {
        skipPreflight: false,
        maxRetries: 0,
        preflightCommitment: "confirmed",
      });
  
      // Confirm the transaction with extended timeout
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
        throw error; // Re-throw to prevent adding to openPositions
      }
  
      // Fetch the user's associated token account after the transaction
      let newBalance = 0;
      try {
        const accountInfo = await getAccount(connection, userTokenAccountAddress);
        newBalance = Number(accountInfo.amount);
      } catch (error) {
        // If the account doesn't exist post-transaction, which is unlikely, set to 0
        newBalance = 0;
      }
  
      // Calculate the actual amount bought
      const actualAmountBought = newBalance - previousBalance;
  
      // Ensure that some tokens were actually bought
      if (actualAmountBought <= 0) {
        throw new Error("No tokens were bought. Please check the transaction.");
      }
  
      console.log(`Actual amount bought: ${actualAmountBought}`);
  
      // Convert to human-readable format based on decimals
      const amountBoughtDecimals =
        token.decimals !== undefined ? token.decimals : 9;
      const amountBought = Number(
        Big(actualAmountBought.toString()).div(Big(10).pow(amountBoughtDecimals))
      );
  
      console.log(`Amount bought (human-readable): ${amountBought}`);
  
      // Fetch latest price
      const priceResponse = await fetchTokenPricesFromDexScreener([tokenAddress]);
      const currentPriceUsd =
        priceResponse[tokenAddress] || parseFloat(token.priceUsd) || 0;
  
      // Add to open positions
      const newPosition = {
        id: txHash, // Unique identifier for React keys
        address: tokenAddress,
        symbol: token.baseToken.symbol,
        name: token.baseToken.name,
        purchasePrice: currentPriceUsd,
        amountBought,
        collateralAmountSol,
        totalCostUsd: collateralAmountSol * solPrice,
        purchaseTime: new Date(),
        currentPrice: currentPriceUsd,
        roi: 0,
        sellStatus: "idle",
        decimals: amountBoughtDecimals, // Store the token decimals
      };
  
      setOpenPositions((prevPositions) => {
        // Check if position already exists
        const exists = prevPositions.some((p) => p.address === tokenAddress);
        if (exists) {
          console.log(`Position for ${newPosition.symbol} already exists.`);
          return prevPositions;
        }
        const updatedPositions = [...prevPositions, newPosition];
        openPositionsRef.current = updatedPositions;
        return updatedPositions;
      });
  
      setError(null); // Clear previous errors
    } catch (error) {
      console.error(`Error buying token ${token.baseToken.symbol}:`, error);
      setError(`Error buying token ${token.baseToken.symbol}. Please try again.`);
    } finally {
      // Remove token from processingTokensRef regardless of success or failure
      processingTokensRef.current.delete(tokenAddress);
    }
  }
  
  
  
  
  

  // Function to sell a token
  async function sellToken(position) {
    const {
      address: tokenAddress,
      symbol,
      sellStatus,
      amountBought,
      decimals, // Get the stored decimals
    } = position;
  
    // Prevent initiating another sell if already in progress or recently sold
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
  
      // Initialize Moonshot Token for Selling
      const moonshotToken = moonshot.Token({
        mintAddress: tokenAddress,
      });
  
      // Use the stored decimals, fallback to 9 if undefined
      const tokenDecimals = decimals !== undefined ? decimals : 9;
  
      // Convert amountBought back to smallest unit
      const tokenAmount = BigInt(
        Math.round(amountBought * Math.pow(10, tokenDecimals))
      );
  
      console.log(`Attempting to sell ${tokenAmount.toString()} units of token ${symbol}`);
  
      // Calculate the collateral amount for selling
      const collateralAmount = await moonshotToken.getCollateralAmountByTokens({
        tokenAmount,
        tradeDirection: "SELL",
      });
  
      // Prepare the transaction instructions using Moonshot SDK
      const { ixs } = await moonshotToken.prepareIxs({
        slippageBps: slippageBps,
        creatorPK: keypair.publicKey.toBase58(),
        tokenAmount,
        collateralAmount,
        tradeDirection: "SELL",
        fixedSide: FixedSide.IN,
      });
  
      const priorityIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 200_000,
      });
  
      const blockhash = await connection.getLatestBlockhash("confirmed");
  
      const messageV0 = new TransactionMessage({
        payerKey: keypair.publicKey,
        recentBlockhash: blockhash.blockhash,
        instructions: [priorityIx, ...ixs],
      }).compileToV0Message();
  
      const transaction = new VersionedTransaction(messageV0);
      transaction.sign([keypair]);
  
      const txHash = await connection.sendTransaction(transaction, {
        skipPreflight: false,
        maxRetries: 0,
        preflightCommitment: "confirmed",
      });
  
      // Confirm the transaction with extended timeout
      try {
        await confirmTransactionWithTimeout(
          connection,
          txHash,
          30000 // 60 seconds
        );
        console.log(`Sold token ${symbol}. Transaction Hash:`, txHash);
  
        // Update Sell Status to 'success'
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

      }, 30 * 1000); // 60 seconds (1 minute)

      } catch (error) {
        console.warn(
          `Transaction ${txHash} not confirmed within timeout. It may still succeed.`
        );
         // Optionally, set sell status to 'pending' or handle retries
         setOpenPositions((prevPositions) =>
          prevPositions.map((p) =>
            p.address === tokenAddress ? { ...p, sellStatus: "pending" } : p
          )
        );
  
        toast.warn(`Transaction not confirmed within timeout for token ${symbol}.`);
      }
  
  
      
  
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
  
      // Update Sell Status to 'failed'
      setOpenPositions((prevPositions) =>
        prevPositions.map((p) =>
          p.address === tokenAddress ? { ...p, sellStatus: "failed" } : p
        )
      );
  
      // Revert Sell Status Back to 'idle' After 3 Seconds
      setTimeout(() => {
        setOpenPositions((prevPositions) =>
          prevPositions.map((p) =>
            p.address === tokenAddress ? { ...p, sellStatus: "idle" } : p
          )
        );
      }, 3000); // 3 seconds
  
      // Remove token from purchasedTokensRef.current to allow retrying
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
    const creationTimeThreshold = new Date(Date.now() - CREATION_TIME_WINDOW_MS);

    // Hardcoded minPriceChange set to 0
    const minPriceChange = 0;

    // Apply filtering logic
    const changeCondition =
      change >= minPriceChange &&
      (!maxPriceChange || change <= parseFloat(maxPriceChange));

    const twitterCondition = !requireTwitter || hasTwitter;
    const creationTimeCondition = createdAt > creationTimeThreshold;

    return changeCondition && twitterCondition && creationTimeCondition;
  });


  
  

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
      <Grid container spacing={2}>
        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Box sx={{ pr: { md: 2 }, width: "100%",
            overflowX: "auto",}}>
            {/* Header */}
        <Box
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Moonshot Tokens
          </Typography>
          {/* Auto-Buy Switch moved to Sidebar */}
        </Box>
        {error && (
          <Typography variant="body1" color="error" align="center" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredTokens.length > 0 ? (
          <TableContainer component={Paper} sx={{ maxWidth: "100%", overflowX: "auto" }}>
            <Table sx={{ minWidth: 650 }} aria-label="token table">
              <TableHead>
                <TableRow>
                  <TableCell>Token</TableCell>
                  <TableCell>Symbol</TableCell>
                  <TableCell align="right">Price (USD)</TableCell>
                  <TableCell align="right">24h Volume</TableCell>
                  <TableCell align="right">24h Change</TableCell>
                  <TableCell align="right">Market Cap</TableCell>
                  <TableCell align="right">Progress</TableCell>
                  <TableCell>Links</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTokens.map((token) => (
                  <TableRow
                    key={token.baseToken.address}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {token.baseToken.name}
                    </TableCell>
                    <TableCell>{token.baseToken.symbol}</TableCell>
                    <TableCell align="right">
                      $
                      {token.currentPriceUsd
                        ? token.currentPriceUsd.toFixed(6)
                        : "N/A"}
                    </TableCell>
                    <TableCell align="right">
                      $
                      {token.volume?.h24?.total
                        ? token.volume.h24.total.toFixed(2)
                        : "N/A"}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color:
                          token.priceChange?.h24 >= 0 ? "green" : "red",
                      }}
                    >
                      {token.priceChange?.h24
                        ? token.priceChange.h24.toFixed(2)
                        : "N/A"}
                      %
                    </TableCell>
                    <TableCell align="right">
                      $
                      {token.marketCap
                        ? token.marketCap.toFixed(2)
                        : "N/A"}
                    </TableCell>
                    <TableCell align="right" sx={{ width: "100px" }}>
                      {token.moonshot?.progress !== undefined ? (
                        <LinearProgress
                          variant="determinate"
                          value={token.moonshot.progress * 100}
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {token.profile?.links && token.profile.links.length > 0 ? (
                        token.profile.links.slice(0, 6).map((link, index) => (
                          <Tooltip key={index} title={link} arrow>
                            <IconButton
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              {getLinkIcon(link)}
                            </IconButton>
                          </Tooltip>
                        ))
                      ) : (
                        "No links available"
                      )}
                    </TableCell>
                    <TableCell>{formatTimeAgo(token.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="h6" align="center" sx={{ mt: 4 }}>
            No tokens currently meet the criteria.
          </Typography>
        )}

      {/* Open Positions Table */}
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Open Positions
        </Typography>
        {openPositions.length > 0 ? (
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
                  <TableCell align="right">Sell</TableCell>
                  <TableCell align="center">Chart</TableCell> {/* New Column for Chart */}
                </TableRow>
              </TableHead>
              <TableBody>
  {openPositions.map((position) => {
    const amountBoughtFloat = parseFloat(position.amountBought.toString());
    const currentValue =
      amountBoughtFloat * position.currentPrice;
    const profitLoss = currentValue - position.totalCostUsd;
  

    const dexScreenerUrl = `https://dexscreener.com/solana/${position.address}`; // DexScreener URL
    return (
      <TableRow key={position.id}> {/* Use unique transaction hash as key */}
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
          $
          {position.currentPrice
            ? position.currentPrice.toFixed(6)
            : "N/A"}
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
            color={
              position.sellStatus === "success"
                ? "success"
                : position.sellStatus === "failed"
                ? "error"
                : "secondary"
            }
            onClick={() => sellToken(position)}
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
              href={dexScreenerUrl} // DexScreener link
              target="_blank"
              rel="noopener noreferrer"
            >
              <InsertChartIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    );
  })}
</TableBody>

            </Table>
          </TableContainer>
        ) : (
          <Typography variant="h6" align="center" sx={{ mt: 4 }}>
            No open positions.
          </Typography>
        )}
        </Box>
          </Box>
        </Grid>
        

        {/* Sidebar */}<Grid item xs={12} md={3}>
        <Box
      sx={{
        position: "fixed",        // Set position to fixed
        top: 0,                   // Stick to the top
        right: 0,                 // Stick to the right
        height: "100vh",   
        backgroundColor: "background.paper",
        p: 2,
        zIndex: 999,              // Ensure it's above other content
      }}
    >

          <Sidebar
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
            nameFilter={nameFilter} // Pass nameFilter state
  setNameFilter={setNameFilter} // Pass setter function
          />

          </Box>

      </Grid>

      </Grid>

      </Box>
      <ToastContainer />

    </Container>
  );
}

export default App;
