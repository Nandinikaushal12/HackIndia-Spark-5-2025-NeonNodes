
import { generateMockPrices } from './mockPrices';
import { generateMockArbitrageOpportunities } from './mockOpportunities';
import { generateMockAIInsights } from './mockInsights';
import { generateMockTradeExecutions, generateMockBridgeTransactions } from './mockTrades';
export { tokens, exchanges } from './mockUtils';

// Generate full mock data set
export const generateMockData = () => {
  const prices = generateMockPrices();
  const opportunities = generateMockArbitrageOpportunities(prices);
  const insights = generateMockAIInsights(opportunities);
  const trades = generateMockTradeExecutions(opportunities);
  const bridges = generateMockBridgeTransactions(trades, opportunities);
  
  return {
    prices,
    opportunities,
    insights,
    trades,
    bridges
  };
};
