
import { TokenPrice } from '@/types/arbitrage';

const INCH_API_BASE_URL = 'https://api.1inch.io/v5.0';
const supportedChains = {
  ethereum: 1,
  binance: 56,
  polygon: 137,
  arbitrum: 42161,
  optimism: 10
};

export async function fetchTokenPrices(chain: keyof typeof supportedChains): Promise<TokenPrice[]> {
  try {
    const chainId = supportedChains[chain];
    const response = await fetch(`${INCH_API_BASE_URL}/${chainId}/tokens`);
    const data = await response.json();
    
    // Filter for top tokens and convert to our format
    const relevantTokens = Object.values(data.tokens)
      .filter((token: any) => ['ETH', 'MATIC', 'BNB', 'UNI', 'USDT'].includes(token.symbol))
      .map((token: any) => ({
        token: token.name,
        symbol: token.symbol,
        price: await fetchTokenPrice(chainId, token.address),
        timestamp: Date.now(),
        exchange: '1inch', // Since we're using 1inch aggregator
        chain: chain,
        logo: token.logoURI || `https://cryptologos.cc/logos/${token.symbol.toLowerCase()}-${token.symbol.toLowerCase()}-logo.png`
      }));

    return relevantTokens as TokenPrice[];
  } catch (error) {
    console.error(`Error fetching prices for ${chain}:`, error);
    return [];
  }
}

async function fetchTokenPrice(chainId: number, tokenAddress: string): Promise<number> {
  try {
    // Using USDC as base (price in USD)
    const USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
    const response = await fetch(
      `${INCH_API_BASE_URL}/${chainId}/quote?fromTokenAddress=${tokenAddress}&toTokenAddress=${USDC_ADDRESS}&amount=1000000000000000000`
    );
    const data = await response.json();
    return parseFloat(data.toTokenAmount) / 1e6; // Convert from USDC decimals
  } catch (error) {
    console.error('Error fetching token price:', error);
    return 0;
  }
}
