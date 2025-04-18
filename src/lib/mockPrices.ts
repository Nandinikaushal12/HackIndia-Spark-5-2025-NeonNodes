
import { TokenPrice, Chain } from '@/types/arbitrage';
import { tokens, exchanges, getRandomNumber } from './mockUtils';

export const generateMockPrices = (): TokenPrice[] => {
  const prices: TokenPrice[] = [];
  
  tokens.forEach(token => {
    const basePrice = token.symbol === 'ETH' ? 2500 + getRandomNumber(-50, 50) :
                     token.symbol === 'BNB' ? 300 + getRandomNumber(-10, 10) :
                     token.symbol === 'MATIC' ? 0.7 + getRandomNumber(-0.05, 0.05) :
                     token.symbol === 'SOL' ? 70 + getRandomNumber(-5, 5) :
                     token.symbol === 'UNI' ? 6 + getRandomNumber(-0.5, 0.5) : 10;
                      
    Object.entries(exchanges).forEach(([chain, exchangeList]) => {
      exchangeList.forEach(exchange => {
        const variance = getRandomNumber(-3, 3) / 100;
        const price = basePrice * (1 + variance);
        
        prices.push({
          id: `${token.symbol}-${exchange}-${chain}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          token: token.name,
          symbol: token.symbol,
          price,
          timestamp: Date.now(),
          exchange,
          chain: chain as Chain,
          logo: token.logo,
          volume: getRandomNumber(1000, 1000000),
          change24h: getRandomNumber(-5, 5)
        });
      });
    });
  });
  
  return prices;
};
