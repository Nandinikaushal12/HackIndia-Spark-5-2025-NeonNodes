
import { useState, useEffect } from 'react';
import { generateMockData } from '@/lib/mockData';
import { 
  TokenPrice, 
  ArbitrageOpportunity, 
  AIInsight, 
  TradeExecution, 
  BridgeTransaction 
} from '@/types/arbitrage';

export const useArbitrageData = () => {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [trades, setTrades] = useState<TradeExecution[]>([]);
  const [bridges, setBridges] = useState<BridgeTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // For demo purposes, we'll update the data periodically
  useEffect(() => {
    const fetchData = () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call to fetch real data
        const data = generateMockData();
        
        setPrices(data.prices);
        setOpportunities(data.opportunities);
        setInsights(data.insights);
        setTrades(data.trades);
        setBridges(data.bridges);
        setError(null);
      } catch (err) {
        setError('Failed to fetch arbitrage data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData(); // Initial fetch
    
    // Update data every 20 seconds
    const intervalId = setInterval(fetchData, 20000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Execute a mock trade
  const executeTrade = (opportunityId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Find the opportunity
      const opportunity = opportunities.find(o => o.id === opportunityId);
      if (!opportunity) {
        resolve(false);
        return;
      }
      
      // Create a new trade execution
      const newTrade: TradeExecution = {
        id: `trade-${Date.now()}`,
        opportunityId,
        status: 'executing',
        startTime: Date.now(),
        txHash: `0x${Math.random().toString(16).substring(2, 42)}`
      };
      
      // Add to trades
      setTrades(prev => [...prev, newTrade]);
      
      // Simulate async execution
      setTimeout(() => {
        setTrades(prev => 
          prev.map(t => 
            t.id === newTrade.id 
              ? { 
                  ...t, 
                  status: Math.random() > 0.9 ? 'failed' : 'completed',
                  completionTime: Date.now(),
                  profit: Math.random() > 0.9 ? undefined : opportunity.profitPotential * (1 + (Math.random() * 0.2 - 0.1)),
                  actualSlippage: opportunity.slippageEstimate * (1 + (Math.random() * 0.5 - 0.2)),
                  gasUsed: opportunity.gasEstimate * (1 + (Math.random() * 0.3 - 0.1)),
                  errorMessage: Math.random() > 0.9 ? 'Insufficient liquidity' : undefined
                } 
              : t
          )
        );
        
        // Add bridge transaction if trade was successful
        if (Math.random() > 0.9) {
          const newBridge: BridgeTransaction = {
            id: `bridge-${Date.now()}`,
            tradeId: newTrade.id,
            sourceChain: opportunity.sourceChain,
            targetChain: opportunity.targetChain,
            amount: 1000, // Assuming $1000 trade size
            token: opportunity.symbol,
            status: 'pending',
            timestamp: Date.now()
          };
          
          setBridges(prev => [...prev, newBridge]);
          
          // Update bridge status after a delay
          setTimeout(() => {
            setBridges(prev => 
              prev.map(b => 
                b.id === newBridge.id 
                  ? { 
                      ...b, 
                      status: Math.random() > 0.1 ? 'completed' : 'failed',
                      txHash: `0x${Math.random().toString(16).substring(2, 42)}`
                    } 
                  : b
              )
            );
          }, 5000);
        }
        
        resolve(true);
      }, 3000);
    });
  };
  
  return {
    prices,
    opportunities,
    insights,
    trades,
    bridges,
    loading,
    error,
    executeTrade
  };
};
