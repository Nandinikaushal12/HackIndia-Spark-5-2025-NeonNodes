export interface Token {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
    logoURI?: string;
  }
  
  export interface PriceData {
    token: Token;
    price: string;
    priceChange24h: string;
    exchange: string;
    timestamp: number;
  }
  
  export interface ArbitrageOpportunity {
    id: string;
    buyToken: Token;
    sellToken: Token;
    buyExchange: string;
    sellExchange: string;
    profitPercentage: string;
    buyPrice: string;
    sellPrice: string;
    estimatedProfit: string;
    timestamp: number;
    isNew?: boolean;
  }
  
  export interface TransactionStatus {
    id: string;
    type: 'buy' | 'sell' | 'bridge';
    status: 'pending' | 'confirmed' | 'failed';
    hash: string;
    timestamp: number;
    token: Token;
    amount: string;
    exchange?: string;
  }
  
  export interface WalletBalance {
    token: Token;
    balance: string;
    valueUsd: string;
  }
  
  export interface NetworkInfo {
    id: number;
    name: string;
    rpcUrl: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    blockExplorerUrl: string;
  }