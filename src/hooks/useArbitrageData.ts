import { useState, useEffect } from 'react';
import { 
  TokenPrice, 
  ArbitrageOpportunity, 
  AIInsight, 
  TradeExecution, 
  BridgeTransaction 
} from '@/types/arbitrage';
import { fetchTokenPrices } from '@/services/priceService';

export const useArbitrageData = () => {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [trades, setTrades] = useState<TradeExecution[]>([]);
  const [bridges, setBridges] = useState<BridgeTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real-time prices across chains
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const chains = ['ethereum', 'binance', 'polygon', 'arbitrum', 'optimism'] as const;
        const allPrices: TokenPrice[] = [];
        
        // Fetch prices from all chains
        await Promise.all(
          chains.map(async (chain) => {
            const chainPrices = await fetchTokenPrices(chain);
            allPrices.push(...chainPrices);
          })
        );
        
        setPrices(allPrices);
        
        // Find arbitrage opportunities
        const newOpportunities = findArbitrageOpportunities(allPrices);
        setOpportunities(newOpportunities);
        
        // Generate insights based on opportunities
        const newInsights = generateInsights(newOpportunities);
        setInsights(newInsights);
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch price data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 20000); // Update every 20 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  // Helper function to find arbitrage opportunities
  const findArbitrageOpportunities = (prices: TokenPrice[]): ArbitrageOpportunity[] => {
    const opportunities: ArbitrageOpportunity[] = [];
    
    // Group prices by token symbol
    const pricesBySymbol: { [key: string]: TokenPrice[] } = {};
    prices.forEach(price => {
      if (!pricesBySymbol[price.symbol]) {
        pricesBySymbol[price.symbol] = [];
      }
      pricesBySymbol[price.symbol].push(price);
    });
    
    // Find price differences
    Object.entries(pricesBySymbol).forEach(([symbol, tokenPrices]) => {
      if (tokenPrices.length < 2) return;
      
      tokenPrices.forEach((sourcePrice, i) => {
        tokenPrices.slice(i + 1).forEach(targetPrice => {
          const priceDiff = ((targetPrice.price - sourcePrice.price) / sourcePrice.price) * 100;
          
          // Only create opportunity if price difference is significant (>1%)
          if (Math.abs(priceDiff) > 1) {
            const gasEstimate = estimateGasCost(sourcePrice.chain, targetPrice.chain);
            const profitPotential = (Math.abs(priceDiff) / 100) * 1000 - gasEstimate; // Assuming $1000 trade size
            
            if (profitPotential > 0) {
              opportunities.push({
                id: `arb-${symbol}-${Date.now()}-${opportunities.length}`,
                sourceExchange: sourcePrice.exchange,
                targetExchange: targetPrice.exchange,
                sourceChain: sourcePrice.chain,
                targetChain: targetPrice.chain,
                token: sourcePrice.token,
                symbol: symbol,
                logo: sourcePrice.logo,
                priceDifference: priceDiff,
                profitPotential,
                riskScore: calculateRiskScore(sourcePrice, targetPrice),
                slippageEstimate: estimateSlippage(priceDiff),
                gasEstimate,
                timestamp: Date.now()
              });
            }
          }
        });
      });
    });
    
    return opportunities;
  };

  // Helper function to generate insights
  const generateInsights = (opportunities: ArbitrageOpportunity[]): AIInsight[] => {
    return opportunities.map(opp => ({
      id: `insight-${opp.id}`,
      opportunityId: opp.id,
      slippagePrediction: opp.slippageEstimate * 1.1, // Add 10% margin
      liquidityShiftRisk: calculateLiquidityRisk(opp),
      timeWindowSuggestion: {
        min: 1,
        max: estimateTimeWindow(opp)
      },
      confidence: calculateConfidence(opp),
      reasoning: generateReasoning(opp),
      timestamp: Date.now()
    }));
  };

  // Helper utility functions
  const estimateGasCost = (sourceChain: string, targetChain: string): number => {
    // Basic gas estimation based on chains
    const baseGas = 15; // Base gas cost in USD
    return baseGas * (sourceChain === targetChain ? 1 : 2); // Double gas cost for cross-chain
  };

  const calculateRiskScore = (source: TokenPrice, target: TokenPrice): number => {
    // Basic risk calculation
    const baseRisk = 30;
    const chainRisk = source.chain === target.chain ? 0 : 20;
    const priceRisk = Math.min(Math.abs(target.price - source.price) * 2, 30);
    return Math.min(baseRisk + chainRisk + priceRisk, 100);
  };

  const estimateSlippage = (priceDiff: number): number => {
    // Estimate slippage based on price difference
    return Math.abs(priceDiff) * 0.1; // 10% of price difference
  };

  const calculateLiquidityRisk = (opp: ArbitrageOpportunity): number => {
    // Basic liquidity risk calculation
    return Math.min(opp.riskScore * 0.7 + opp.priceDifference * 0.3, 100);
  };

  const estimateTimeWindow = (opp: ArbitrageOpportunity): number => {
    // Estimate maximum time window based on opportunity characteristics
    return Math.max(5, Math.min(30, Math.floor(15 + opp.riskScore / 10)));
  };

  const calculateConfidence = (opp: ArbitrageOpportunity): number => {
    // Calculate confidence score
    const baseConfidence = 85;
    const riskPenalty = opp.riskScore * 0.3;
    return Math.max(60, Math.min(95, baseConfidence - riskPenalty));
  };

  const generateReasoning = (opp: ArbitrageOpportunity): string => {
    const reasons = [
      `${opp.symbol} shows a ${opp.priceDifference.toFixed(2)}% price difference between ${opp.sourceChain} and ${opp.targetChain}.`,
      `Gas costs estimated at $${opp.gasEstimate.toFixed(2)} with potential profit of $${opp.profitPotential.toFixed(2)}.`,
      `Expected slippage: ${opp.slippageEstimate.toFixed(2)}%.`
    ];
    return reasons.join(' ');
  };

  // Execute trade function
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
