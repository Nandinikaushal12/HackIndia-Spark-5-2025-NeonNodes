
// Helper function to get random number in range
export const getRandomNumber = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// Mock token data
export const tokens = [
  { 
    name: 'Ethereum', 
    symbol: 'ETH', 
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  { 
    name: 'Binance Coin', 
    symbol: 'BNB', 
    logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png'
  },
  { 
    name: 'Polygon', 
    symbol: 'MATIC', 
    logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png'
  },
  { 
    name: 'Solana', 
    symbol: 'SOL', 
    logo: 'https://cryptologos.cc/logos/solana-sol-logo.png'
  },
  { 
    name: 'Uniswap', 
    symbol: 'UNI', 
    logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png'
  },
];

// Mock exchanges
export const exchanges = {
  ethereum: ['uniswap', 'sushiswap'],
  binance: ['pancakeswap'],
  polygon: ['quickswap', 'sushiswap'],
  arbitrum: ['sushiswap', 'uniswap'],
  optimism: ['uniswap', 'trader_joe']
};
