import { useState, useEffect } from 'react';
import { generateMockData } from '@/lib/MockData';
import { 
  TokenPrice, 
  ArbitrageOpportunity, 
  AIInsight, 
  TradeExecution, 
  BridgeTransaction 
} from '@/types/arbitrage';
import { useToast } from '@/hooks/use-toast';

export const useArbitrageData = () => {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [trades, setTrades] = useState<TradeExecution[]>([]);
  const [bridges, setBridges] = useState<BridgeTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    let mounted = true;
    
    // For demo purposes, we'll simulate WebSocket updates
    const fetchInitialData = () => {
      try {
        setLoading(true);
        const data = generateMockData();
        if (!mounted) return;
        
        setPrices(data.prices);
        setOpportunities(data.opportunities);
        setInsights(data.insights);
        setTrades(data.trades);
        setBridges(data.bridges);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError('Failed to fetch initial data');
        console.error(err);
        toast({
          title: "Error",
          description: "Failed to fetch initial data",
          variant: "destructive",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    const simulateRealtimeUpdates = () => {
      // Simulate price updates every 2 seconds
      const priceUpdateInterval = setInterval(() => {
        if (!mounted) return;
        setPrices(prev => prev.map(price => ({
          ...price,
          price: price.price * (1 + (Math.random() * 0.02 - 0.01)), // ±1% change
          timestamp: Date.now()
        })));
      }, 2000);
      
      // Simulate new opportunities every 5 seconds
      const opportunityInterval = setInterval(() => {
        if (!mounted) return;
        const newData = generateMockData();
        
        // Add new opportunities with visual feedback
        setOpportunities(prev => {
          const newOpportunities = [...newData.opportunities.slice(0, 2)];
          if (newOpportunities.length > 0) {
            toast({
              title: "New Opportunity",
              description: `Found ${newOpportunities.length} new arbitrage opportunities`,
            });
          }
          return [...newOpportunities, ...prev].slice(0, 10);
        });
        
        // Update AI insights
        setInsights(prev => [...newData.insights, ...prev].slice(0, 10));
      }, 5000);
      
      return () => {
        clearInterval(priceUpdateInterval);
        clearInterval(opportunityInterval);
      };
    };
    
    fetchInitialData();
    const cleanup = simulateRealtimeUpdates();
    
    return () => {
      mounted = false;
      cleanup();
    };
  }, [toast]);
  
  // Execute a mock trade with real-time updates
  const executeTrade = async (opportunityId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const opportunity = opportunities.find(o => o.id === opportunityId);
      if (!opportunity) {
        toast({
          title: "Error",
          description: "Opportunity no longer available",
          variant: "destructive",
        });
        resolve(false);
        return;
      }
      
      const newTrade: TradeExecution = {
        id: `trade-${Date.now()}`,
        opportunityId,
        status: 'executing',
        startTime: Date.now(),
        txHash: `0x${Math.random().toString(16).substring(2, 42)}`
      };
      
      setTrades(prev => [newTrade, ...prev]);
      toast({
        title: "Trade Executing",
        description: `Executing trade for ${opportunity.symbol}`,
      });
      
      // Simulate async execution with status updates
      setTimeout(() => {
        const isSuccessful = Math.random() > 0.1;
        setTrades(prev => 
          prev.map(t => 
            t.id === newTrade.id 
              ? { 
                  ...t, 
                  status: isSuccessful ? 'completed' : 'failed',
                  completionTime: Date.now(),
                  profit: isSuccessful ? opportunity.profitPotential * (1 + (Math.random() * 0.2 - 0.1)) : undefined,
                  actualSlippage: opportunity.slippageEstimate * (1 + (Math.random() * 0.5 - 0.2)),
                  gasUsed: opportunity.gasEstimate * (1 + (Math.random() * 0.3 - 0.1)),
                  errorMessage: isSuccessful ? undefined : 'Insufficient liquidity'
                } 
              : t
          )
        );
        
        toast({
          title: isSuccessful ? "Trade Completed" : "Trade Failed",
          description: isSuccessful 
            ? `Successfully executed trade for ${opportunity.symbol}`
            : `Failed to execute trade for ${opportunity.symbol}`,
          variant: isSuccessful ? "default" : "destructive",
        });
        
        if (isSuccessful && Math.random() > 0.1) {
          const newBridge: BridgeTransaction = {
            id: `bridge-${Date.now()}`,
            tradeId: newTrade.id,
            sourceChain: opportunity.sourceChain,
            targetChain: opportunity.targetChain,
            amount: opportunity.profitPotential,
            token: opportunity.symbol,
            status: 'pending',
            timestamp: Date.now()
          };
          
          setBridges(prev => [newBridge, ...prev]);
          
          // Update bridge status after a delay
          setTimeout(() => {
            const bridgeSuccess = Math.random() > 0.05;
            setBridges(prev => 
              prev.map(b => 
                b.id === newBridge.id 
                  ? { 
                      ...b, 
                      status: bridgeSuccess ? 'completed' : 'failed',
                      txHash: `0x${Math.random().toString(16).substring(2, 42)}`
                    } 
                  : b
              )
            );
            
            toast({
              title: bridgeSuccess ? "Bridge Completed" : "Bridge Failed",
              description: bridgeSuccess 
                ? `Successfully bridged ${opportunity.symbol} to ${opportunity.targetChain}`
                : `Failed to bridge ${opportunity.symbol} to ${opportunity.targetChain}`,
              variant: bridgeSuccess ? "default" : "destructive",
            });
          }, 8000);
        }
        
        resolve(true);
      }, 5000);
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