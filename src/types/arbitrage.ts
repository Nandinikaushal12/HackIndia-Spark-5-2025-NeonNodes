
export interface TokenPrice {
  id: string;
  token: string;
  symbol: string;
  price: number;
  timestamp: number;
  exchange: string;
  chain: Chain;
  logo: string;
  volume?: number;
  change24h?: number;
}

export interface ArbitrageOpportunity {
  id: string;
  sourceExchange: string;
  targetExchange: string;
  sourceChain: Chain;
  targetChain: Chain;
  token: string;
  symbol: string;
  logo: string;
  priceDifference: number; // Percentage
  profitPotential: number; // In USD
  riskScore: number; // 0-100, higher is riskier
  slippageEstimate: number; // Percentage
  gasEstimate: number; // In USD
  timestamp: number;
}

export type Chain = 
  | 'ethereum' 
  | 'binance' 
  | 'polygon' 
  | 'arbitrum' 
  | 'optimism';

export type Exchange =
  | 'uniswap'
  | 'sushiswap'
  | 'pancakeswap'
  | 'quickswap'
  | 'spookyswap'
  | 'trader_joe';
  
export interface AIInsight {
  id: string;
  opportunityId: string;
  slippagePrediction: number;
  liquidityShiftRisk: number; // 0-100
  timeWindowSuggestion: {
    min: number; // minutes
    max: number; // minutes
  };
  confidence: number; // 0-100
  reasoning: string;
  timestamp: number;
}

export interface TradeExecution {
  id: string;
  opportunityId: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  txHash?: string;
  startTime: number;
  completionTime?: number;
  profit?: number;
  actualSlippage?: number;
  gasUsed?: number;
  errorMessage?: string;
}

export interface BridgeTransaction {
  id: string;
  tradeId: string;
  sourceChain: Chain;
  targetChain: Chain;
  amount: number;
  token: string;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
  timestamp: number;
}
