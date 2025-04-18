
import { ethers } from 'ethers';

export const connectWallet = async (): Promise<string | null> => {
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed. Please install MetaMask to connect your wallet.");
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Request account access
    const accounts = await provider.send("eth_requestAccounts", []);
    
    if (accounts.length === 0) {
      throw new Error("No accounts found");
    }
    
    // Get the user's wallet address
    const address = accounts[0];
    
    // Get the network information
    const network = await provider.getNetwork();
    console.log(`Connected to network: ${network.name} (${network.chainId})`);
    
    return address;
  } catch (error) {
    console.error("Error connecting to wallet:", error);
    throw error;
  }
};

// Add window.ethereum type for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
