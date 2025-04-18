// src/lib/wallet.ts

import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function connectWallet(): Promise<string | null> {
  if (!window.ethereum) {
    alert("MetaMask not detected!");
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    return accounts[0]; // return connected address
  } catch (err) {
    console.error("Wallet connection failed:", err);
    return null;
  }
}

export async function getProvider(): Promise<ethers.BrowserProvider | null> {
  if (!window.ethereum) return null;
  return new ethers.BrowserProvider(window.ethereum);
}
