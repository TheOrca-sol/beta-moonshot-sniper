import { PublicKey, SystemProgram, Transaction, VersionedTransaction, TransactionMessage, sendAndConfirmRawTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import axios from 'axios';

export const sendBundle = async (transactions, blockhash, lastValidBlockHeight, tipLamports, feePayer, keypair, connection) => {
  try {
    // Fetch tip accounts
    const tipAccountsResponse = await axios.get('https://theorca.pythonanywhere.com/api/jito/get-tip-accounts');
    const tipAccounts = tipAccountsResponse.data;
    
    if (!tipAccounts || tipAccounts.length === 0) {
      throw new Error("No tip accounts available");
    }

    // Select a random tip account
    const tipAccount = new PublicKey(tipAccounts[Math.floor(Math.random() * tipAccounts.length)]);

    // Ensure feePayer is a PublicKey object
    const feePayerPubkey = feePayer instanceof PublicKey ? feePayer : new PublicKey(feePayer);

    // Create a tip transaction
    const tipTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: feePayerPubkey,
        toPubkey: tipAccount,
        lamports: tipLamports,
      })
    );

    // Create a TransactionMessage for the tip transaction
    const tipMessage = new TransactionMessage({
      payerKey: feePayerPubkey,
      recentBlockhash: blockhash,
      instructions: tipTx.instructions,
    }).compileToV0Message();

    // Create a VersionedTransaction for the tip and sign it
    const versionedTipTx = new VersionedTransaction(tipMessage);
    versionedTipTx.sign([keypair]);

    // Simulate and encode all transactions
    const bundleTransactions = await Promise.all(transactions.map(async (tx, index) => {
      if (tx instanceof VersionedTransaction) {
        // Simulate the transaction
        const simulation = await connection.simulateTransaction(tx);
        console.log(`Transaction ${index} simulation result:`, simulation);

        if (simulation.value.err) {
          console.error(`Transaction ${index} simulation failed:`, simulation.value.err);
          return null;
        }

        const serialized = tx.serialize();
        console.log(`Transaction ${index} (VersionedTransaction) serialized length:`, serialized.length);
        const encoded = bs58.encode(serialized);
        console.log(`Transaction ${index} encoded:`, encoded);
        return encoded;
      } else {
        console.error(`Unexpected transaction format at index ${index}:`, typeof tx);
        return null;
      }
    }));

    // Filter out any null transactions (failed simulations)
    const validTransactions = bundleTransactions.filter(tx => tx !== null);

    // Add the tip transaction to the end of the bundle
    const tipTxEncoded = bs58.encode(versionedTipTx.serialize());
    console.log('Tip transaction encoded:', tipTxEncoded);
    validTransactions.push(tipTxEncoded);

    console.log('Number of transactions in bundle (including tip):', validTransactions.length);
    validTransactions.forEach((tx, index) => {
      console.log(`Transaction ${index} encoded length:`, tx.length);
    });

    const payload = {
      jsonrpc: "2.0",
      id: 1,
      method: "sendBundle",
      params: [validTransactions, { maxSearchSpaceSize: 100000 }]
    };

    console.log('Sending Jito bundle with payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post('https://theorca.pythonanywhere.com/api/jito/send-bundle', payload);
    
    console.log('Jito bundle response:', response.data);
    
    if (response.data.error) {
      throw new Error(JSON.stringify(response.data.error));
    }
    
    return response.data.result; // Return the bundle ID
  } catch (error) {
    console.error('Error sending Jito bundle:', error.response ? error.response.data : error.message);
    throw error;
  }
};
