
// CoinGecko API base URL
export const API_BASE_URL = 'https://api.coingecko.com/api/v3';

// Map of exchanges to their identifiers for API calls
export const EXCHANGE_MAP: Record<string, string> = {
  'Uniswap': 'uniswap_v3',
  'SushiSwap': 'sushiswap',
  'PancakeSwap': 'pancakeswap_v3',
  'QuickSwap': 'quickswap',
  'SpookySwap': 'spookyswap',
};

// Map of blockchains to their identifiers for API calls
export const CHAIN_MAP: Record<string, Chain> = {
  'Ethereum': 'ethereum',
  'Binance': 'binance',
  'Polygon': 'polygon',
  'Avalanche': 'arbitrum',
  'Fantom': 'optimism',
};

// List of supported tokens
export const SUPPORTED_TOKENS = [
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin' },
  { id: 'tether', symbol: 'USDT', name: 'Tether' },
  { id: 'binancecoin', symbol: 'BNB', name: 'Binance Coin' },
  { id: 'matic-network', symbol: 'MATIC', name: 'Polygon' },
];

