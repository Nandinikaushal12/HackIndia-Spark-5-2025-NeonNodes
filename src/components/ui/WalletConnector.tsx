// src/components/ui/WalletConnector.tsx

import React, { useState } from "react";
import { connectWallet } from "@/lib/wallet"; // Adjust path based on your folder structure

const WalletConnector: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleConnect = async () => {
    const address = await connectWallet();
    if (address) setWalletAddress(address);
  };

  return (
    <div className="wallet-connector">
      {walletAddress ? (
        <p>🔗 Connected: {walletAddress}</p>
      ) : (
        <button onClick={handleConnect}>Connect MetaMask</button>
      )}
    </div>
  );
};

export default WalletConnector;
