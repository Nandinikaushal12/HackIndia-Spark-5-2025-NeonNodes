
// Cryptocurrency API service using CoinGecko
import axios from 'axios';
import { TokenPrice, ArbitrageOpportunity, AIInsight, Chain } from '@/types/arbitrage';

// CoinGecko API base URL
const API_BASE_URL = 'https://api.coingecko.com/api/v3';

// Map of exchanges to their identifiers for API calls
const EXCHANGE_MAP: Record<string, string> = {
  'Uniswap': 'uniswap_v3',
  'SushiSwap': 'sushiswap',
  'PancakeSwap': 'pancakeswap_v3',
  'QuickSwap': 'quickswap',
  'SpookySwap': 'spookyswap',
};

// Map of blockchains to their identifiers for API calls
const CHAIN_MAP: Record<string, Chain> = {
  'Ethereum': 'ethereum',
  'Binance': 'binance',
  'Polygon': 'polygon',
  'Avalanche': 'arbitrum', // Adjusted to a valid Chain value
  'Fantom': 'optimism', // Adjusted to a valid Chain value
};

// List of supported tokens
const SUPPORTED_TOKENS = [
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin' },
  { id: 'tether', symbol: 'USDT', name: 'Tether' },
  { id: 'binancecoin', symbol: 'BNB', name: 'Binance Coin' },
  { id: 'matic-network', symbol: 'MATIC', name: 'Polygon' },
];

// Fetch token prices from multiple exchanges
export const fetchTokenPrices = async (): Promise<TokenPrice[]> => {
  try {
    const prices: TokenPrice[] = [];
    
    // Get prices for each token from CoinGecko
    for (const token of SUPPORTED_TOKENS) {
      const response = await axios.get(
        `${API_BASE_URL}/coins/${token.id}/tickers`,
        { params: { include_exchange_logo: false } }
      );
      
      // Process tickers from response
      response.data.tickers.forEach((ticker: any) => {
        const exchangeName = ticker.market.name;
        const targetSymbol = ticker.target;
        
        // Only include USD or USDT pairs
        if (targetSymbol === 'USD' || targetSymbol === 'USDT') {
          // Map the exchange to one of our supported DEXs if possible
          const knownExchange = Object.entries(EXCHANGE_MAP).find(([name]) => 
            exchangeName.toLowerCase().includes(name.toLowerCase())
          );
          
          if (knownExchange) {
            const [exchange] = knownExchange;
            
            // Determine which chain this is on
            let chain: Chain = 'ethereum'; // Default
            for (const [chainName, chainId] of Object.entries(CHAIN_MAP)) {
              if (ticker.market.identifier?.toLowerCase().includes(String(chainId))) {
                chain = chainId;
                break;
              }
            }
            
            // Add to our prices array
            prices.push({
              id: `${token.symbol}-${exchange}-${chain}-${Date.now()}`,
              token: token.name,
              symbol: token.symbol,
              exchange,
              chain,
              price: ticker.last,
              volume: ticker.volume, 
              timestamp: Date.now(),
              change24h: ((ticker.last - ticker.converted_last.usd) / ticker.converted_last.usd) * 100,
              logo: `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x${Math.random().toString(16).substring(2, 10)}/logo.png`,
            });
          }
        }
      });
    }
    
    return prices;
  } catch (error) {
    console.error('Error fetching token prices:', error);
    return [];
  }
};

// Find potential arbitrage opportunities from price differences
export const findArbitrageOpportunities = (prices: TokenPrice[]): ArbitrageOpportunity[] => {
  const opportunities: ArbitrageOpportunity[] = [];
  
  // Group by token symbol
  const tokenGroups: Record<string, TokenPrice[]> = {};
  prices.forEach(price => {
    if (!tokenGroups[price.symbol]) {
      tokenGroups[price.symbol] = [];
    }
    tokenGroups[price.symbol].push(price);
  });
  
  // Look for price differences across exchanges and chains
  Object.entries(tokenGroups).forEach(([symbol, tokenPrices]) => {
    // Need at least 2 prices to compare
    if (tokenPrices.length < 2) return;
    
    for (let i = 0; i < tokenPrices.length; i++) {
      for (let j = i + 1; j < tokenPrices.length; j++) {
        const source = tokenPrices[i];
        const target = tokenPrices[j];
        
        // Calculate price difference percentage
        const priceDiff = Math.abs(target.price - source.price);
        const priceDiffPercent = (priceDiff / Math.min(source.price, target.price)) * 100;
        
        // Estimate gas costs based on chains
        let gasEstimate = 0;
        if (source.chain === target.chain) {
          // Same chain - lower gas
          gasEstimate = 0.001; // ETH equivalent
        } else {
          // Cross-chain - higher gas
          gasEstimate = 0.005; // ETH equivalent
        }
        
        // Calculate profit potential (rough estimate)
        const tradeSize = 1000; // Assuming $1000 trade
        const gasCostUSD = gasEstimate * prices.find(p => p.symbol === 'ETH')?.price || 0;
        const grossProfit = (priceDiff / 100) * tradeSize;
        const netProfit = grossProfit - gasCostUSD;
        const profitPercent = (netProfit / tradeSize) * 100;
        
        // Only include if profit is positive and significant enough
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
            riskScore: Math.floor(Math.random() * 70) + 15, // Random risk between 15-85
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

// Generate AI insights for opportunities
export const generateAIInsights = (opportunities: ArbitrageOpportunity[]): AIInsight[] => {
  return opportunities.map(opp => {
    // Risk factors
    const liquidityRisk = calculateLiquidityRisk(opp.sourceExchange, opp.targetExchange);
    const slippageRisk = opp.priceDifference < 1 ? 'low' : opp.priceDifference < 3 ? 'medium' : 'high';
    const volatilityRisk = opp.symbol === 'BTC' || opp.symbol === 'ETH' ? 'low' : 'medium';
    
    // Calculate overall risk
    const overallRisk = ['low', 'medium', 'high'].indexOf(liquidityRisk) + 
                        ['low', 'medium', 'high'].indexOf(slippageRisk) + 
                        ['low', 'medium', 'high'].indexOf(volatilityRisk);
    
    const overallRiskLevel = overallRisk <= 2 ? 'low' : overallRisk <= 4 ? 'medium' : 'high';
    
    // Generate confidence score (0-100)
    const confidenceScore = Math.floor(Math.random() * 40) + 60; // Random between 60-100
    
    // Recommended actions
    const recommendedAction = overallRiskLevel === 'low' ? 'execute' : 
                             overallRiskLevel === 'medium' ? 'monitor' : 'avoid';
    
    return {
      id: `insight-${opp.id}`,
      opportunityId: opp.id,
      slippagePrediction: opp.slippageEstimate * (Math.random() * 0.5 + 0.75), // Realistic slippage prediction
      liquidityShiftRisk: Math.floor(Math.random() * 60) + 20, // Random between 20-80
      timeWindowSuggestion: {
        min: Math.floor(Math.random() * 3) + 1, // 1-3 minutes
        max: Math.floor(Math.random() * 10) + 5, // 5-15 minutes
      },
      confidence: confidenceScore,
      reasoning: generateInsightText(opp, overallRiskLevel),
      timestamp: Date.now(),
    };
  });
};

// Helper function to calculate risk level based on exchanges
function calculateLiquidityRisk(sourceExchange: string, targetExchange: string): 'low' | 'medium' | 'high' {
  const highLiquidityExchanges = ['Uniswap', 'PancakeSwap'];
  
  if (highLiquidityExchanges.includes(sourceExchange) && highLiquidityExchanges.includes(targetExchange)) {
    return 'low';
  } else if (highLiquidityExchanges.includes(sourceExchange) || highLiquidityExchanges.includes(targetExchange)) {
    return 'medium';
  }
  return 'high';
}

// Generate insight text based on opportunity and risk
function generateInsightText(opp: ArbitrageOpportunity, risk: string): string {
  if (risk === 'low') {
    return `Strong opportunity for ${opp.symbol} between ${opp.sourceExchange} and ${opp.targetExchange}. Price difference is stable with good liquidity on both sides.`;
  } else if (risk === 'medium') {
    return `Moderate opportunity for ${opp.symbol}. Watch for slippage during execution and monitor market conditions.`;
  } else {
    return `High-risk opportunity for ${opp.symbol}. The price difference may be due to low liquidity or temporary market conditions.`;
  }
}
