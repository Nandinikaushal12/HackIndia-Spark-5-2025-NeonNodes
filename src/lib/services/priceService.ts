
import axios from 'axios';
import { TokenPrice, Chain } from '@/types/arbitrage';
import { API_BASE_URL, EXCHANGE_MAP, CHAIN_MAP, SUPPORTED_TOKENS } from '../config/apiConfig';

export const fetchTokenPrices = async (): Promise<TokenPrice[]> => {
  try {
    const prices: TokenPrice[] = [];
    
    for (const token of SUPPORTED_TOKENS) {
      const response = await axios.get(
        `${API_BASE_URL}/coins/${token.id}/tickers`,
        { params: { include_exchange_logo: false } }
      );
      
      response.data.tickers.forEach((ticker: any) => {
        const exchangeName = ticker.market.name;
        const targetSymbol = ticker.target;
        
        if (targetSymbol === 'USD' || targetSymbol === 'USDT') {
          const knownExchange = Object.entries(EXCHANGE_MAP).find(([name]) => 
            exchangeName.toLowerCase().includes(name.toLowerCase())
          );
          
          if (knownExchange) {
            const [exchange] = knownExchange;
            let chain: Chain = 'ethereum';
            
            for (const [chainName, chainId] of Object.entries(CHAIN_MAP)) {
              if (ticker.market.identifier?.toLowerCase().includes(String(chainId))) {
                chain = chainId;
                break;
              }
            }
            
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

