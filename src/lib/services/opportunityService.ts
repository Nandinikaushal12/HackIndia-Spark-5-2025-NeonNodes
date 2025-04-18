
import { TokenPrice, ArbitrageOpportunity } from '@/types/arbitrage';

export const findArbitrageOpportunities = (prices: TokenPrice[]): ArbitrageOpportunity[] => {
  const opportunities: ArbitrageOpportunity[] = [];
  const tokenGroups: Record<string, TokenPrice[]> = {};
  
  prices.forEach(price => {
    if (!tokenGroups[price.symbol]) {
      tokenGroups[price.symbol] = [];
    }
    tokenGroups[price.symbol].push(price);
  });
  
  Object.entries(tokenGroups).forEach(([symbol, tokenPrices]) => {
    if (tokenPrices.length < 2) return;
    
    for (let i = 0; i < tokenPrices.length; i++) {
      for (let j = i + 1; j < tokenPrices.length; j++) {
        const source = tokenPrices[i];
        const target = tokenPrices[j];
        
        const priceDiff = Math.abs(target.price - source.price);
        const priceDiffPercent = (priceDiff / Math.min(source.price, target.price)) * 100;
        
        let gasEstimate = source.chain === target.chain ? 0.001 : 0.005;
        
        const tradeSize = 1000;
        const gasCostUSD = gasEstimate * prices.find(p => p.symbol === 'ETH')?.price || 0;
        const grossProfit = (priceDiff / 100) * tradeSize;
        const netProfit = grossProfit - gasCostUSD;
        const profitPercent = (netProfit / tradeSize) * 100;
        
        if (priceDiffPercent > 0.5 && netProfit > 0) {
          opportunities.push({
            id: `${symbol}-${source.exchange}-${target.exchange}-${Date.now()}`,
            symbol,
            token: source.token,
            sourceExchange: source.exchange,
            targetExchange: target.exchange,
            sourceChain: source.chain,
            targetChain: target.chain,
            priceDifference: priceDiffPercent,
            profitPotential: netProfit,
            logo: source.logo,
            riskScore: Math.floor(Math.random() * 70) + 15,
            slippageEstimate: priceDiffPercent < 1 ? 0.1 : 0.5,
            gasEstimate: gasCostUSD,
            timestamp: Date.now(),
          });
        }
      }
    }
  });
  
  return opportunities.sort((a, b) => b.profitPotential - a.profitPotential);
};

