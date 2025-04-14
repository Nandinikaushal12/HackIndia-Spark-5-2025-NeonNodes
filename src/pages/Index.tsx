
import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { PriceComparisonCard } from "@/components/PriceComparisonCard";
import { ArbitrageOpportunityCard } from "@/components/ArbitrageOpportunityCard";
import { TradeHistoryTable } from "@/components/TradeHistoryTable";
import { PerformanceMetrics } from "@/components/PerformanceMetrics";
import { useArbitrageData } from "@/hooks/useArbitrageData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const { 
    prices, 
    opportunities, 
    insights, 
    trades, 
    bridges, 
    loading,
    executeTrade
  } = useArbitrageData();
  
  const [executingTrades, setExecutingTrades] = useState<Set<string>>(new Set());
  
  // Group token prices by token symbol
  const tokenPricesMap = useMemo(() => {
    const map: Record<string, typeof prices> = {};
    prices.forEach(price => {
      if (!map[price.symbol]) {
        map[price.symbol] = [];
      }
      map[price.symbol].push(price);
    });
    return map;
  }, [prices]);
  
  const handleExecuteTrade = async (opportunityId: string) => {
    setExecutingTrades(prev => new Set(prev).add(opportunityId));
    try {
      await executeTrade(opportunityId);
    } finally {
      setExecutingTrades(prev => {
        const newSet = new Set(prev);
        newSet.delete(opportunityId);
        return newSet;
      });
    }
  };
  
  if (loading && trades.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="container py-6">
          <div className="flex items-center justify-center h-[80vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <p className="text-lg font-medium">Loading arbitrage data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Cross-Chain Profit Pilot</h1>
        
        <Tabs defaultValue="dashboard">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="prices">Price Explorer</TabsTrigger>
            <TabsTrigger value="history">Trade History</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-3">Performance Metrics</h2>
              <PerformanceMetrics trades={trades} />
            </section>
            
            <section>
              <h2 className="text-lg font-semibold mb-3">Arbitrage Opportunities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {opportunities.length > 0 ? (
                  opportunities.map(opportunity => {
                    const opportunityInsight = insights.find(
                      insight => insight.opportunityId === opportunity.id
                    );
                    
                    return (
                      <ArbitrageOpportunityCard 
                        key={opportunity.id}
                        opportunity={opportunity}
                        insight={opportunityInsight}
                        onExecute={() => handleExecuteTrade(opportunity.id)}
                        isExecuting={executingTrades.has(opportunity.id)}
                      />
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground">
                      No arbitrage opportunities available at the moment.
                      <br />
                      Our AI model is continuously scanning DEXs for profitable trades.
                    </p>
                  </div>
                )}
              </div>
            </section>
            
            <section>
              <h2 className="text-lg font-semibold mb-3">Recent Trades</h2>
              <TradeHistoryTable trades={trades.slice(0, 5)} />
            </section>
          </TabsContent>
          
          {/* Price Explorer Tab */}
          <TabsContent value="prices">
            <section>
              <h2 className="text-lg font-semibold mb-3">Cross-Chain Price Comparison</h2>
              <p className="text-muted-foreground mb-4">
                Compare real-time token prices across different DEXs and blockchains
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Object.entries(tokenPricesMap).map(([symbol, tokenPrices]) => (
                  <PriceComparisonCard key={symbol} tokenPrices={tokenPrices} />
                ))}
              </div>
            </section>
          </TabsContent>
          
          {/* Trade History Tab */}
          <TabsContent value="history">
            <section>
              <h2 className="text-lg font-semibold mb-3">Trade History</h2>
              <p className="text-muted-foreground mb-4">
                Complete history of arbitrage trades executed by the bot
              </p>
              <TradeHistoryTable trades={trades} />
            </section>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="py-4 px-6 border-t text-center text-sm text-muted-foreground">
        <p>Profit Pilot - Cross-Chain Arbitrage Bot | Hackathon MVP</p>
      </footer>
    </div>
  );
};

export default Index;
