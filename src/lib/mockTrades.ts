
import { TradeExecution, BridgeTransaction, ArbitrageOpportunity } from '@/types/arbitrage';
import { getRandomNumber } from './mockUtils';

export const generateMockTradeExecutions = (opportunities: ArbitrageOpportunity[]): TradeExecution[] => {
  return opportunities
    .slice(0, Math.max(1, Math.floor(opportunities.length / 2)))
    .map(opp => ({
      id: `trade-${opp.id}`,
      opportunityId: opp.id,
      status: Math.random() > 0.7 ? 'completed' : Math.random() > 0.5 ? 'executing' : 'pending',
      txHash: Math.random() > 0.3 ? `0x${Math.random().toString(16).substring(2, 42)}` : undefined,
      startTime: Date.now() - Math.floor(Math.random() * 3600000),
      completionTime: Math.random() > 0.3 ? Date.now() - Math.floor(Math.random() * 60000) : undefined,
      profit: Math.random() > 0.3 ? opp.profitPotential * (1 + getRandomNumber(-0.3, 0.1)) : undefined,
      actualSlippage: Math.random() > 0.3 ? opp.slippageEstimate * (1 + getRandomNumber(-0.5, 1)) : undefined,
      gasUsed: Math.random() > 0.3 ? opp.gasEstimate * (1 + getRandomNumber(-0.2, 0.3)) : undefined,
      errorMessage: Math.random() > 0.9 ? "Insufficient liquidity in target pool" : undefined
    }));
};

export const generateMockBridgeTransactions = (tradeExecutions: TradeExecution[], opportunities: ArbitrageOpportunity[]): BridgeTransaction[] => {
  return tradeExecutions
    .filter(trade => trade.status !== 'failed' && trade.status !== 'pending')
    .map(trade => {
      const opp = opportunities.find(o => o.id === trade.opportunityId);
      if (!opp) return null;
      
      return {
        id: `bridge-${trade.id}`,
        tradeId: trade.id,
        sourceChain: opp.sourceChain,
        targetChain: opp.targetChain,
        amount: 1000,
        token: opp.symbol,
        status: trade.status === 'completed' ? 'completed' : Math.random() > 0.5 ? 'completed' : 'pending',
        txHash: trade.txHash,
        timestamp: trade.startTime + 60000
      };
    })
    .filter(bridge => bridge !== null) as BridgeTransaction[];
};
