
import { useState, useEffect, useCallback } from 'react';
import { fetchTokenPrices, findArbitrageOpportunities, generateAIInsights } from '@/lib/api';
import { 
  TokenPrice, 
  ArbitrageOpportunity, 
  AIInsight, 
  TradeExecution, 
  BridgeTransaction 
} from '@/types/arbitrage';
import { connectWallet } from '@/lib/wallet';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';

export const useRealArbitrageData = () => {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [trades, setTrades] = useState<TradeExecution[]>([]);
  const [bridges, setBridges] = useState<BridgeTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch real data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch prices from API
      const tokenPrices = await fetchTokenPrices();
      setPrices(tokenPrices);
      
      // Find arbitrage opportunities
      const arbs = findArbitrageOpportunities(tokenPrices);
      setOpportunities(arbs);
      
      // Generate AI insights
      const aiInsights = generateAIInsights(arbs);
      setInsights(aiInsights);
      
      setError(null);
    } catch (err: any) {
      setError(`Failed to fetch arbitrage data: ${err.message}`);
      toast({
        title: "Data Fetch Error",
        description: "Failed to fetch the latest market data. Retrying...",
        variant: "destructive"
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Connect wallet
  const connectUserWallet = async () => {
    try {
      const address = await connectWallet();
      if (address) {
        setWalletAddress(address);
        toast({
          title: "Wallet Connected",
          description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
        });
      }
    } catch (err: any) {
      toast({
        title: "Wallet Connection Failed",
        description: err.message,
        variant: "destructive"
      });
    }
  };
  
  // Execute a trade
  const executeTrade = (opportunityId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check if wallet is connected
      if (!walletAddress) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet to execute trades.",
          variant: "destructive"
        });
        resolve(false);
        return;
      }
      
      // Find the opportunity
      const opportunity = opportunities.find(o => o.id === opportunityId);
      if (!opportunity) {
        toast({
          title: "Error",
          description: "Opportunity not found",
          variant: "destructive"
        });
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
      
      toast({
        title: "Executing Trade",
        description: `Trading ${opportunity.symbol} between ${opportunity.sourceExchange} and ${opportunity.targetExchange}`,
      });
      
      // Simulate async execution (in a real app, this would be an actual blockchain transaction)
      setTimeout(() => {
        // 90% chance of success
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
          title: isSuccessful ? "Trade Successful" : "Trade Failed",
          description: isSuccessful 
            ? `Successfully executed trade with estimated profit of $${opportunity.profitPotential.toFixed(2)}`
            : "Trade failed due to insufficient liquidity",
          variant: isSuccessful ? "default" : "destructive"
        });
        
        // Cross-chain bridge if needed
        if (isSuccessful && opportunity.sourceChain !== opportunity.targetChain) {
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
          
          setBridges(prev => [...prev, newBridge]);
          
          toast({
            title: "Bridging Assets",
            description: `Initiating transfer from ${opportunity.sourceChain} to ${opportunity.targetChain}`,
          });
          
          setTimeout(() => {
            setBridges(prev => 
              prev.map(b => 
                b.id === newBridge.id 
                  ? { 
                      ...b, 
                      status: Math.random() > 0.05 ? 'completed' : 'failed',
                      txHash: `0x${Math.random().toString(16).substring(2, 42)}`
                    } 
                  : b
              )
            );
          }, 5000);
        }
        
        resolve(isSuccessful);
      }, 3000);
    });
  };
  
  // Initial data fetch and periodic updates
  useEffect(() => {
    fetchData();
    
    // Update data every 60 seconds
    const intervalId = setInterval(fetchData, 60000);
    
    return () => clearInterval(intervalId);
  }, [fetchData]);
  
  return {
    prices,
    opportunities,
    insights,
    trades,
    bridges,
    loading,
    error,
    walletAddress,
    executeTrade,
    connectWallet: connectUserWallet,
    refreshData: fetchData
  };
};
