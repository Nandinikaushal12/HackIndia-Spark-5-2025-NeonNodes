
import { ArbitrageOpportunity, TokenPrice } from '@/types/arbitrage';
import { getRandomNumber } from './mockUtils';

export const generateMockArbitrageOpportunities = (prices: TokenPrice[]): ArbitrageOpportunity[] => {
  const opportunities: ArbitrageOpportunity[] = [];
  const seenTokens = new Set(prices.map(p => p.symbol));
  
  seenTokens.forEach(symbol => {
    const tokenPrices = prices.filter(p => p.symbol === symbol);
    
    if (tokenPrices.length > 1) {
      const sortedPrices = [...tokenPrices].sort((a, b) => a.price - b.price);
      const lowestPrice = sortedPrices[0];
      
      const numOpportunities = Math.floor(Math.random() * 3);
      for (let i = 0; i < numOpportunities; i++) {
        const higherPriceIndex = Math.floor(Math.random() * (sortedPrices.length - 1)) + 1;
        const highestPrice = sortedPrices[higherPriceIndex];
        
        const priceDiff = ((highestPrice.price - lowestPrice.price) / lowestPrice.price) * 100;
        
        if (priceDiff > 1) {
          const gasEstimate = getRandomNumber(5, 30);
          const slippageEstimate = getRandomNumber(0.1, 2);
          const profitPotential = (priceDiff / 100) * 1000 - gasEstimate;
          
          opportunities.push({
            id: `arb-${symbol}-${Date.now()}-${i}`,
            sourceExchange: lowestPrice.exchange,
            targetExchange: highestPrice.exchange,
            sourceChain: lowestPrice.chain,
            targetChain: highestPrice.chain,
            token: lowestPrice.token,
            symbol,
            logo: lowestPrice.logo,
            priceDifference: priceDiff,
            profitPotential,
            riskScore: getRandomNumber(10, 80),
            slippageEstimate,
            gasEstimate,
            timestamp: Date.now()
          });
        }
      }
    }
  });
  
  return opportunities;
};
