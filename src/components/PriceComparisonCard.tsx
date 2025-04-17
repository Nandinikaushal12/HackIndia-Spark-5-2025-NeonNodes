import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { TokenPrice } from "@/types/arbitrage"
import { cn } from "@/lib/utils"

interface PriceComparisonCardProps {
  tokenPrices: TokenPrice[]
}

export const PriceComparisonCard = ({ tokenPrices }: PriceComparisonCardProps) => {
  if (!tokenPrices.length) return null
  
  // Group prices by chain
  const groupedByChain: Record<string, TokenPrice[]> = {}
  tokenPrices.forEach(price => {
    if (!groupedByChain[price.chain]) {
      groupedByChain[price.chain] = []
    }
    groupedByChain[price.chain].push(price)
  })
  
  const token = tokenPrices[0]
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <img src={token.logo} alt={token.symbol} className="w-6 h-6 rounded-full" />
          {token.symbol}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(groupedByChain).map(([chain, prices]) => (
            <div key={chain} className="space-y-1">
              <div className="flex items-center gap-2">
                <div 
                  className={cn(
                    "w-3 h-3 rounded-full", 
                    chain === "ethereum" && "bg-crypto-ethereum",
                    chain === "binance" && "bg-crypto-binance",
                    chain === "polygon" && "bg-crypto-polygon",
                    chain === "arbitrum" && "bg-crypto-arbitrum",
                    chain === "optimism" && "bg-crypto-optimism",
                  )}
                />
                <p className="text-xs font-medium capitalize">{chain}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-1">
                {prices.map(price => (
                  <div 
                    key={`${chain}-${price.exchange}`}
                    className="flex justify-between items-center text-xs p-1.5 bg-secondary rounded"
                  >
                    <span className="capitalize">{price.exchange}</span>
                    <span className="font-medium">
                      ${price.price.toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: token.symbol === "MATIC" ? 4 : 2 
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}