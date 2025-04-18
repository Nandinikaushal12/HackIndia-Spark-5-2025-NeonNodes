
import { ArbitrageOpportunity, AIInsight } from '@/types/arbitrage';

const calculateLiquidityRisk = (sourceExchange: string, targetExchange: string): 'low' | 'medium' | 'high' => {
  const highLiquidityExchanges = ['Uniswap', 'PancakeSwap'];
  
  if (highLiquidityExchanges.includes(sourceExchange) && highLiquidityExchanges.includes(targetExchange)) {
    return 'low';
  } else if (highLiquidityExchanges.includes(sourceExchange) || highLiquidityExchanges.includes(targetExchange)) {
    return 'medium';
  }
  return 'high';
};

const generateInsightText = (opp: ArbitrageOpportunity, risk: string): string => {
  if (risk === 'low') {
    return `Strong opportunity for ${opp.symbol} between ${opp.sourceExchange} and ${opp.targetExchange}. Price difference is stable with good liquidity on both sides.`;
  } else if (risk === 'medium') {
    return `Moderate opportunity for ${opp.symbol}. Watch for slippage during execution and monitor market conditions.`;
  } else {
    return `High-risk opportunity for ${opp.symbol}. The price difference may be due to low liquidity or temporary market conditions.`;
  }
};

export const generateAIInsights = (opportunities: ArbitrageOpportunity[]): AIInsight[] => {
  return opportunities.map(opp => {
    const liquidityRisk = calculateLiquidityRisk(opp.sourceExchange, opp.targetExchange);
    const slippageRisk = opp.priceDifference < 1 ? 'low' : opp.priceDifference < 3 ? 'medium' : 'high';
    const volatilityRisk = opp.symbol === 'BTC' || opp.symbol === 'ETH' ? 'low' : 'medium';
    
    const overallRisk = ['low', 'medium', 'high'].indexOf(liquidityRisk) + 
                       ['low', 'medium', 'high'].indexOf(slippageRisk) + 
                       ['low', 'medium', 'high'].indexOf(volatilityRisk);
    
    const overallRiskLevel = overallRisk <= 2 ? 'low' : overallRisk <= 4 ? 'medium' : 'high';
    const confidenceScore = Math.floor(Math.random() * 40) + 60;
    
    return {
      id: `insight-${opp.id}`,
      opportunityId: opp.id,
      slippagePrediction: opp.slippageEstimate * (Math.random() * 0.5 + 0.75),
      liquidityShiftRisk: Math.floor(Math.random() * 60) + 20,
      timeWindowSuggestion: {
        min: Math.floor(Math.random() * 3) + 1,
        max: Math.floor(Math.random() * 10) + 5,
      },
      confidence: confidenceScore,
      reasoning: generateInsightText(opp, overallRiskLevel),
      timestamp: Date.now(),
    };
  });
};

