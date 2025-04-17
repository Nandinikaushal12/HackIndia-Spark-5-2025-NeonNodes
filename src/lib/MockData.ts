import { ArbitrageOpportunity, AIInsight, TokenPrice, TradeExecution, BridgeTransaction } from '@/types/arbitrage';
 
 // Helper function to get random number in range
 const getRandomNumber = (min: number, max: number): number => {
   return Math.random() * (max - min) + min;
 };
 
 // Mock token data
 export const tokens = [
   { 
     name: 'Ethereum', 
     symbol: 'ETH', 
     logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
   },
   { 
     name: 'Binance Coin', 
     symbol: 'BNB', 
     logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png'
   },
   { 
     name: 'Polygon', 
     symbol: 'MATIC', 
     logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png'
   },
   { 
     name: 'Solana', 
     symbol: 'SOL', 
     logo: 'https://cryptologos.cc/logos/solana-sol-logo.png'
   },
   { 
     name: 'Uniswap', 
     symbol: 'UNI', 
     logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png'
   },
 ];
 
 // Mock exchanges
 export const exchanges = {
   ethereum: ['uniswap', 'sushiswap'],
   binance: ['pancakeswap'],
   polygon: ['quickswap', 'sushiswap'],
   arbitrum: ['sushiswap', 'uniswap'],
   optimism: ['uniswap', 'trader_joe']
 };
 
 // Generate mock token prices
 export const generateMockPrices = (): TokenPrice[] => {
   const prices: TokenPrice[] = [];
   
   tokens.forEach(token => {
     // Base price for this token
     const basePrice = token.symbol === 'ETH' ? 2500 + getRandomNumber(-50, 50) :
                       token.symbol === 'BNB' ? 300 + getRandomNumber(-10, 10) :
                       token.symbol === 'MATIC' ? 0.7 + getRandomNumber(-0.05, 0.05) :
                       token.symbol === 'SOL' ? 70 + getRandomNumber(-5, 5) :
                       token.symbol === 'UNI' ? 6 + getRandomNumber(-0.5, 0.5) : 10;
                       
     // Generate slightly different prices for each exchange on each chain
     Object.entries(exchanges).forEach(([chain, exchangeList]) => {
       exchangeList.forEach(exchange => {
         // Add some variance between exchanges (up to 3%)
         const variance = getRandomNumber(-3, 3) / 100;
         const price = basePrice * (1 + variance);
         
         prices.push({
           token: token.name,
           symbol: token.symbol,
           price,
           timestamp: Date.now(),
           exchange,
           chain: chain as any,
           logo: token.logo
         });
       });
     });
   });
   
   return prices;
 };
 
 // Generate mock arbitrage opportunities
 export const generateMockArbitrageOpportunities = (prices: TokenPrice[]): ArbitrageOpportunity[] => {
   const opportunities: ArbitrageOpportunity[] = [];
   
   // For each token
   tokens.forEach(token => {
     // Get all prices for this token
     const tokenPrices = prices.filter(p => p.symbol === token.symbol);
     
     // Find min and max prices to create arbitrage opportunities
     if (tokenPrices.length > 1) {
       const sortedPrices = [...tokenPrices].sort((a, b) => a.price - b.price);
       const lowestPrice = sortedPrices[0];
       
       // Create 0-2 opportunities for each token (randomly)
       const numOpportunities = Math.floor(Math.random() * 3);
       for (let i = 0; i < numOpportunities; i++) {
         // Pick a random higher price
         const higherPriceIndex = Math.floor(Math.random() * (sortedPrices.length - 1)) + 1;
         const highestPrice = sortedPrices[higherPriceIndex];
         
         const priceDiff = ((highestPrice.price - lowestPrice.price) / lowestPrice.price) * 100;
         
         // Only create an opportunity if there's at least 1% price difference
         if (priceDiff > 1) {
           const gasEstimate = getRandomNumber(5, 30);
           const slippageEstimate = getRandomNumber(0.1, 2);
           const profitPotential = (priceDiff / 100) * 1000 - gasEstimate; // Assuming $1000 trade size
           
           opportunities.push({
             id: `arb-${token.symbol}-${Date.now()}-${i}`,
             sourceExchange: lowestPrice.exchange,
             targetExchange: highestPrice.exchange,
             sourceChain: lowestPrice.chain,
             targetChain: highestPrice.chain,
             token: token.name,
             symbol: token.symbol,
             logo: token.logo,
             priceDifference: priceDiff,
             profitPotential: profitPotential,
             riskScore: getRandomNumber(10, 80), 
             slippageEstimate,
             gasEstimate,
             timestamp: Date.now()
           });
         }
       }
     }
   });
   
   return opportunities;
 };
 
 // Generate mock AI insights
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
 
 // Helper to generate random reasoning text
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
 
 // Generate mock trade executions
 export const generateMockTradeExecutions = (opportunities: ArbitrageOpportunity[]): TradeExecution[] => {
   return opportunities
     .slice(0, Math.max(1, Math.floor(opportunities.length / 2))) // Take about half the opportunities
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
 
 // Generate mock bridge transactions
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
         amount: 1000, // Assuming $1000 trade size
         token: opp.symbol,
         status: trade.status === 'completed' ? 'completed' : Math.random() > 0.5 ? 'completed' : 'pending',
         txHash: trade.txHash,
         timestamp: trade.startTime + 60000 // 1 minute after trade start
       };
     })
     .filter(bridge => bridge !== null) as BridgeTransaction[];
 };
 
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