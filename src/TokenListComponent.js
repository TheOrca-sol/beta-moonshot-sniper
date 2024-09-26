import React, { useState, useEffect } from 'react';

const TokenListComponent = () => {
    const [tokens, setTokens] = useState([]);

    // Fetch new token data on component mount
    useEffect(() => {
        fetch("https://api.moonshot.cc/tokens/v1/new/solana")
            .then((response) => response.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setTokens(data);
                } else {
                    console.error("New tokens response is not an array", data);
                    setTokens([]); // set to empty array if response is not valid
                }
            })
            .catch((error) => {
                console.error("Error fetching new tokens", error);
                setTokens([]); // set to empty array in case of error
            });
    }, []);

    // Utility function to calculate and format the time difference (e.g., "5 min ago", "2 hours ago")
    const formatTimeAgo = (timestamp) => {
        const now = Date.now();
        const diffInSeconds = Math.floor((now - timestamp) / 1000);

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
    };

    return (
        <div>
            <h1>Sniper App - New Tokens</h1>

            <h2>Filtered Tokens (Bonding Curve 5% - 90% & Volume  500 in 5 min)</h2>
            <ul>
                {tokens.length > 0 ? (
                    tokens
                        .filter(token => token.volume?.m5?.total && token.volume.m5.total > 500) // Filtering by 5-minute volume
                        .map((token, index) => (
                            <li key={index}>
                                <strong>{token.baseToken.symbol} ({token.baseToken.name})</strong><br />
                                <strong>Price:</strong> ${token.priceUsd} / {token.priceNative} {token.quoteToken.symbol}<br />
                                <strong>FDV/Market Cap:</strong> ${token.fdv}<br />
                                <strong>Volume (5min):</strong> {token.volume?.m5?.total || 'N/A'}<br />

                                <strong>Volume (24h):</strong> {token.volume?.h24?.total || 'N/A'}<br />
                                <strong>Price Change (24h):</strong> {token.priceChange?.h24 || 0}%<br />
                                <strong>Transaction Count (24h):</strong> Buys: {token.txns?.h24?.buys || 0}, Sells: {token.txns?.h24?.sells || 0}, Total: {token.txns?.h24?.total || 0}<br />
                                <strong>Created:</strong> {formatTimeAgo(token.createdAt)}<br />
                                <strong>Bonding Curve Progress:</strong> {(token.moonshot?.progress).toFixed(2)}%<br />
                                <a href={token.url} target="_blank" rel="noopener noreferrer">View on Dex</a><br />
                                <img src={token.profile?.icon} alt={`${token.baseToken.name} icon`} style={{ width: '32px', height: '32px' }} />
                                <br /><br />
                            </li>
                        ))
                ) : (
                    <p>No tokens match the filter criteria.</p>
                )}
            </ul>
        </div>
    );
};

export default TokenListComponent;
