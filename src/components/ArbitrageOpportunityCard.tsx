import { ArbitrageOpportunity, AIInsight } from "@/types/arbitrage"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { ArrowRightIcon, TrendingUpIcon, AlertCircleIcon, LineChartIcon, ZapIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ArbitrageOpportunityCardProps {
  opportunity: ArbitrageOpportunity
  insight?: AIInsight
  onExecute: () => void
  isExecuting: boolean
}

export const ArbitrageOpportunityCard = ({ 
  opportunity, 
  insight,
  onExecute,
  isExecuting
}: ArbitrageOpportunityCardProps) => {
  const isProfitable = opportunity.profitPotential > 0
  
  return (
    <Card className="relative overflow-hidden">
      {isProfitable && (
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[50px] border-r-[50px] border-t-transparent border-r-green-500/20" />
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={opportunity.logo} alt={opportunity.symbol} className="w-6 h-6 rounded-full" />
            <CardTitle className="text-base font-medium">{opportunity.symbol}</CardTitle>
          </div>
          
          <Badge 
            variant={isProfitable ? "default" : "destructive"}
            className="rounded-sm"
          >
            {opportunity.priceDifference.toFixed(2)}% Difference
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground capitalize">From</span>
            <div className="flex items-center gap-1 mt-0.5">
              <div 
                className={cn(
                  "w-2 h-2 rounded-full", 
                  opportunity.sourceChain === "ethereum" && "bg-crypto-ethereum",
                  opportunity.sourceChain === "binance" && "bg-crypto-binance",
                  opportunity.sourceChain === "polygon" && "bg-crypto-polygon",
                  opportunity.sourceChain === "arbitrum" && "bg-crypto-arbitrum",
                  opportunity.sourceChain === "optimism" && "bg-crypto-optimism",
                )}
              />
              <span className="font-medium capitalize">{opportunity.sourceExchange}</span>
            </div>
          </div>
          
          <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
          
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground capitalize">To</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="font-medium capitalize">{opportunity.targetExchange}</span>
              <div 
                className={cn(
                  "w-2 h-2 rounded-full", 
                  opportunity.targetChain === "ethereum" && "bg-crypto-ethereum",
                  opportunity.targetChain === "binance" && "bg-crypto-binance",
                  opportunity.targetChain === "polygon" && "bg-crypto-polygon",
                  opportunity.targetChain === "arbitrum" && "bg-crypto-arbitrum",
                  opportunity.targetChain === "optimism" && "bg-crypto-optimism",
                )}
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-secondary rounded-md p-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <TrendingUpIcon className="h-3 w-3" />
              <span>Potential Profit</span>
            </div>
            <span className={cn(
              "text-sm font-medium",
              isProfitable ? "text-green-500" : "text-red-500"
            )}>
              ${Math.abs(opportunity.profitPotential).toFixed(2)}
              {!isProfitable && " (Loss)"}
            </span>
          </div>
          
          <div className="bg-secondary rounded-md p-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <AlertCircleIcon className="h-3 w-3" />
              <span>Risk Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full",
                    opportunity.riskScore < 30 ? "bg-green-500" :
                    opportunity.riskScore < 60 ? "bg-yellow-500" : "bg-red-500"
                  )}
                  style={{ width: `${opportunity.riskScore}%` }}
                />
              </div>
              <span className="text-xs font-medium">{opportunity.riskScore}</span>
            </div>
          </div>
        </div>
        
        {insight && (
          <div className="bg-primary/5 rounded-md p-2 text-xs">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <LineChartIcon className="h-3 w-3" />
              <span>AI Insight</span>
            </div>
            <p className="line-clamp-2">{insight.reasoning}</p>
            <div className="flex items-center gap-1 mt-1 text-primary">
              <span>Confidence:</span>
              <span className="font-medium">{insight.confidence.toFixed(0)}%</span>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          className="w-full" 
          onClick={onExecute}
          disabled={!isProfitable || isExecuting}
        >
          {isExecuting ? (
            <>
              <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Executing...
            </>
          ) : (
            <>
              <ZapIcon className="mr-1 h-4 w-4" />
              Execute Trade
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}