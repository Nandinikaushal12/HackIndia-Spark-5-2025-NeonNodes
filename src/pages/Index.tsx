
import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { PriceComparisonCard } from "@/components/PriceComparisonCard";
import { ArbitrageOpportunityCard } from "@/components/ArbitrageOpportunityCard";
import { TradeHistoryTable } from "@/components/TradeHistoryTable";
import { PerformanceMetrics } from "@/components/PerformanceMetrics";
import { useRealArbitrageData } from "@/hooks/useRealArbitrageData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { 
    prices, 
    opportunities, 
    insights, 
    trades, 
    bridges, 
    loading,
    error,
    walletAddress,
    executeTrade,
    connectWallet,
    refreshData
  } = useRealArbitrageData();
  
  const { toast } = useToast();
  const [executingTrades, setExecutingTrades] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  
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
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
      toast({ title: "Data refreshed", description: "Latest market data has been loaded." });
    } catch (error) {
      // Error handling is in the hook
    } finally {
      setRefreshing(false);
    }
  };
  
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Cross-Chain Profit Pilot</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            {!walletAddress ? (
              <Button 
                size="sm"
                onClick={connectWallet}
                className="flex items-center gap-1"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </Button>
            ) : (
              <div className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-md">
                {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
              </div>
            )}
          </div>
        </div>
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-6">
            <p className="font-medium">Error: {error}</p>
            <p className="text-sm">Please try refreshing the data.</p>
          </div>
        )}
        
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
              {trades.length > 0 ? (
                <TradeHistoryTable trades={trades.slice(0, 5)} />
              ) : (
                <div className="text-center py-6 bg-secondary/20 rounded-lg">
                  <p className="text-muted-foreground">
                    No trades executed yet. Connect your wallet and execute a trade to get started.
                  </p>
                </div>
              )}
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
              {trades.length > 0 ? (
                <TradeHistoryTable trades={trades} />
              ) : (
                <div className="text-center py-8 bg-secondary/20 rounded-lg">
                  <p className="text-muted-foreground">
                    No trades executed yet. Connect your wallet and execute a trade to get started.
                  </p>
                </div>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="py-4 px-6 border-t text-center text-sm text-muted-foreground">
        <p>Profit Pilot - Cross-Chain Arbitrage Bot | Real-time Cryptocurrency Arbitrage</p>
      </footer>
    </div>
  );
};

export default Index;
