
import { AIInsight, ArbitrageOpportunity } from '@/types/arbitrage';
import { getRandomNumber } from './mockUtils';

const getRandomReasoning = (opp: ArbitrageOpportunity): string => {
  const reasons = [
    `Price spread between ${opp.sourceExchange} and ${opp.targetExchange} appears stable. Historical volatility suggests low risk.`,
    `${opp.token} has shown consistent liquidity on both chains. Bridge operations should complete within expected timeframe.`,
    `Recent increase in volatility for ${opp.token} suggests caution. Consider reducing position size.`,
    `Gas prices on ${opp.targetChain} have been fluctuating. Consider setting a gas price limit to protect profits.`,
    `Similar arbitrage patterns for ${opp.token} have closed rapidly in past 24 hours. Swift execution recommended.`
  ];
  
  return reasons[Math.floor(Math.random() * reasons.length)];
};

export const generateMockAIInsights = (opportunities: ArbitrageOpportunity[]): AIInsight[] => {
  return opportunities.map(opp => ({
    id: `insight-${opp.id}`,
    opportunityId: opp.id,
    slippagePrediction: opp.slippageEstimate * (1 + getRandomNumber(-0.2, 0.2)),
    liquidityShiftRisk: getRandomNumber(10, 70),
    timeWindowSuggestion: {
      min: Math.floor(getRandomNumber(1, 5)),
      max: Math.floor(getRandomNumber(10, 30))
    },
    confidence: getRandomNumber(60, 95),
    reasoning: getRandomReasoning(opp),
    timestamp: Date.now()
  }));
};
