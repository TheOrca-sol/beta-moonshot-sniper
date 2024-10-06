import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Connection, PublicKey, Keypair, ComputeBudgetProgram, TransactionMessage, VersionedTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Moonshot, Environment, FixedSide } from '@wen-moon-ser/moonshot-sdk';
import { getAssociatedTokenAddress } from "@solana/spl-token";
import bs58 from 'bs58';
import Big from 'big.js';

function VolumeBooster() {
  const [address, setAddress] = useState('GPvHnTpRZHZdabPYSCqSdb25quk8RgfZNRBNws1ir7qJ');
  const [privateKey, setPrivateKey] = useState('5vcmkN2Ge5yryUv7Z5q8AjJC4Gw6LpYUJLXGqUivL2izJfrGANJDUDsebPkNczvVV2rzT3EwR9QayxyQumYrEuLQ');
  const [rpcUrl, setRpcUrl] = useState('https://mainnet.helius-rpc.com/?api-key=d8d8052a-72db-4652-8942-9ae97f24cdec');
  const [slippageBps, setSlippageBps] = useState(1000);
  const [timeBetweenBuys, setTimeBetweenBuys] = useState(4000);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [buyCount, setBuyCount] = useState(0);
  const [shouldStartBoost, setShouldStartBoost] = useState(false);
  const [moonshot, setMoonshot] = useState(null);
  const [connection, setConnection] = useState(null);
  const [minCollateralAmount, setMinCollateralAmount] = useState(0.0001);
  const [maxCollateralAmount, setMaxCollateralAmount] = useState(0.001);
  const [sellAfterBuys, setSellAfterBuys] = useState(0);
  const [isSelling, setIsSelling] = useState(false);
  const intervalIdRef = useRef(null);

  const startVolumeBoost = useCallback(() => {
    console.log('startVolumeBoost function called');
    setIsRunning(true);
    setShouldStartBoost(true);
  }, []);

  useEffect(() => {
    console.log('isRunning changed:', isRunning);
  }, [isRunning]);

  const runVolumeBoost = useCallback(async () => {
    setError('');
    setStatus('Starting volume boost...');
    setBuyCount(0);
    console.log('Volume boost started');

    try {
      console.log('Initializing connection...');
      const connection = new Connection(rpcUrl, 'confirmed');
      setConnection(connection);
      
      console.log('Decoding private key...');
      const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
      
      console.log('Initializing Moonshot...');
      const moonshot = new Moonshot({
        rpcUrl,
        environment: Environment.MAINNET,
        chainOptions: {
          solana: { confirmOptions: { commitment: 'confirmed' } },
        },
      });
      setMoonshot(moonshot);

      console.log('Creating Moonshot token...');
      const moonshotToken = moonshot.Token({
        mintAddress: address,
      });

      console.log('Starting buying interval...');
      intervalIdRef.current = setInterval(async () => {
        if (!isRunning) {
          clearInterval(intervalIdRef.current);
          setStatus('Volume boost stopped');
          console.log('Volume boost stopped');
          return;
        }

        try {
          if (isSelling) {
            console.log('Waiting for sell to complete...');
            return;
          }

          console.log('Checking balance...');
          const balance = await connection.getBalance(keypair.publicKey);
          console.log(`Current balance: ${balance / LAMPORTS_PER_SOL} SOL`);

          // Randomly choose collateral amount between min and max
          const randomCollateralAmount = Math.random() * (maxCollateralAmount - minCollateralAmount) + minCollateralAmount;
          const collateralAmountLamports = BigInt(Math.round(randomCollateralAmount * LAMPORTS_PER_SOL));

          if (balance < Number(collateralAmountLamports)) {
            throw new Error('Insufficient SOL balance');
          }

          setStatus(`Preparing transaction ${buyCount + 1}...`);
          console.log('Preparing transaction...');
          console.log('Collateral amount (SOL):', randomCollateralAmount);
          console.log('Collateral amount (lamports):', collateralAmountLamports.toString());
          console.log('Slippage (BPS):', slippageBps);
          console.log('Creator public key:', keypair.publicKey.toBase58());

          const tokenAmount = await moonshotToken.getTokenAmountByCollateral({
            collateralAmount: collateralAmountLamports,
            tradeDirection: "BUY",
          });

          const prepareResult = await moonshotToken.prepareIxs({
            slippageBps,
            creatorPK: keypair.publicKey.toBase58(),
            tokenAmount,
            collateralAmount: collateralAmountLamports,
            tradeDirection: 'BUY',
            fixedSide: FixedSide.IN,
          });

          const ixs = prepareResult.ixs;

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
            maxRetries: 3,
            preflightCommitment: "confirmed",
          });

          console.log(`Transaction ${buyCount + 1} successful:`, txHash);
          
          // Update buy count
          setBuyCount(prevCount => {
            const newCount = prevCount + 1;
            console.log(`Updated buy count: ${newCount}`);
            
            // Check if we need to sell
            if (sellAfterBuys > 0 && newCount >= sellAfterBuys) {
              sellTokens();
            }
            
            return newCount;
          });
          
        } catch (err) {
          console.error('Error during buy:', err);
          setError(`Error during buy: ${err.message}`);
        }
      }, timeBetweenBuys);

      return () => {
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
        }
      };
    } catch (err) {
      console.error('Error initializing volume boost:', err);
      setError(`Error initializing volume boost: ${err.message}`);
    }
  }, [address, privateKey, rpcUrl, minCollateralAmount, maxCollateralAmount, slippageBps, timeBetweenBuys, isRunning, sellAfterBuys]);

  const sellTokens = useCallback(async () => {
    setIsSelling(true);
    try {
      console.log('Preparing to sell tokens...');
      const connection = new Connection(rpcUrl, 'confirmed');
      const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
      const moonshot = new Moonshot({
        rpcUrl,
        environment: Environment.MAINNET,
        chainOptions: {
          solana: { confirmOptions: { commitment: 'confirmed' } },
        },
      });
      const moonshotToken = moonshot.Token({
        mintAddress: address,
      });

      // Get the associated token account
      const associatedTokenAddress = await getAssociatedTokenAddress(
        new PublicKey(address),
        keypair.publicKey
      );

      // Get the token balance
      const tokenAccountInfo = await connection.getTokenAccountBalance(associatedTokenAddress);
      const tokenAmount = BigInt(tokenAccountInfo.value.amount);

      console.log(`Token balance to sell: ${tokenAmount.toString()}`);

      if (tokenAmount === BigInt(0)) {
        console.log('No tokens to sell');
        setIsSelling(false);
        return;
      }

      // Calculate the collateral amount for selling
      const collateralAmount = await moonshotToken.getCollateralAmountByTokens({
        tokenAmount,
        tradeDirection: "SELL",
      });

      // Prepare sell transaction
      const { ixs } = await moonshotToken.prepareIxs({
        slippageBps,
        creatorPK: keypair.publicKey.toBase58(),
        tokenAmount: tokenAmount.toString(),
        collateralAmount,
        tradeDirection: 'SELL',
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
        maxRetries: 3,
        preflightCommitment: "confirmed",
      });

      console.log('Sell transaction sent:', txHash);
      setStatus(`Sell transaction sent. Transaction: ${txHash}`);

      // Confirm the transaction with extended timeout
      try {
        await connection.confirmTransaction({
          signature: txHash,
          blockhash: blockhash.blockhash,
          lastValidBlockHeight: blockhash.lastValidBlockHeight,
        }, 'confirmed');
        console.log('Sell transaction confirmed:', txHash);
        setStatus(`Sold tokens. Transaction: ${txHash}`);
        setBuyCount(0);  // Reset buy count after selling
      } catch (error) {
        console.warn(`Transaction ${txHash} not confirmed within timeout. It may still succeed.`);
        setStatus(`Transaction not confirmed within timeout. Hash: ${txHash}`);
      }

    } catch (err) {
      console.error('Error selling tokens:', err);
      let errorMessage = `Error selling tokens: ${err.message}`;

      // Parse specific errors based on error messages
      if (err.message.includes("SlippageOverflow")) {
        errorMessage = "Transaction failed due to slippage overflow. Please adjust your slippage settings.";
      } else if (err.message.includes("insufficient funds")) {
        errorMessage = "You do not have enough tokens to complete this transaction.";
      } else if (err.message.includes("No tokens available")) {
        errorMessage = "No tokens available to sell.";
      } else if (err.message.includes("Account does not exist")) {
        errorMessage = "The token account does not exist. Please try again later.";
      }

      setError(errorMessage);
    } finally {
      setIsSelling(false);
    }
  }, [address, privateKey, rpcUrl, slippageBps]);

  useEffect(() => {
    if (shouldStartBoost && isRunning) {
      runVolumeBoost();
    }
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [shouldStartBoost, isRunning, runVolumeBoost]);

  const stopVolumeBoost = useCallback(() => {
    console.log('Stopping volume boost...');
    setIsRunning(false);
    setShouldStartBoost(false);
    setStatus('Stopping volume boost...');
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
  }, []);

  return (
    <Box>
      <Typography variant="h6">Volume Booster</Typography>
      <TextField
        label="Token Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Private Key"
        value={privateKey}
        onChange={(e) => setPrivateKey(e.target.value)}
        fullWidth
        margin="normal"
        type="password"
      />
      <TextField
        label="RPC URL"
        value={rpcUrl}
        onChange={(e) => setRpcUrl(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Slippage (BPS)"
        value={slippageBps}
        onChange={(e) => setSlippageBps(parseInt(e.target.value))}
        fullWidth
        margin="normal"
        type="number"
      />
      <TextField
        label="Time Between Buys (ms)"
        value={timeBetweenBuys}
        onChange={(e) => setTimeBetweenBuys(parseInt(e.target.value))}
        fullWidth
        margin="normal"
        type="number"
      />
      <TextField
        label="Min Collateral Amount (SOL)"
        value={minCollateralAmount}
        onChange={(e) => setMinCollateralAmount(parseFloat(e.target.value))}
        fullWidth
        margin="normal"
        type="number"
        inputProps={{ step: "0.000000001" }}
      />
      <TextField
        label="Max Collateral Amount (SOL)"
        value={maxCollateralAmount}
        onChange={(e) => setMaxCollateralAmount(parseFloat(e.target.value))}
        fullWidth
        margin="normal"
        type="number"
        inputProps={{ step: "0.000000001" }}
      />
      <TextField
        label="Sell after X buys"
        value={sellAfterBuys}
        onChange={(e) => setSellAfterBuys(parseInt(e.target.value))}
        fullWidth
        margin="normal"
        type="number"
      />
      {isRunning ? (
        <Button onClick={stopVolumeBoost} variant="contained" color="secondary" fullWidth>
          Stop Volume Boost
        </Button>
      ) : (
        <Button onClick={startVolumeBoost} variant="contained" color="primary" fullWidth>
          Start Volume Boost
        </Button>
      )}
      {isRunning && <CircularProgress />}
      {status && <Alert severity="info">{status}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <Typography>Total Buys: {buyCount}</Typography>
    </Box>
  );
}

export default VolumeBooster;