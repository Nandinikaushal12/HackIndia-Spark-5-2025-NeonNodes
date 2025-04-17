
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TradeExecution } from "@/types/arbitrage";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface PerformanceMetricsProps {
  trades: TradeExecution[];
}

interface MetricCardProps {
  title: string;
  value: string;
  trend?: number;
  description?: string;
}

export const PerformanceMetrics = ({ trades }: PerformanceMetricsProps) => {
  const completedTrades = trades.filter(
    (trade) => trade.status === "completed" && trade.profit !== undefined
  );
  
  // Calculate metrics
  const totalProfit = completedTrades.reduce(
    (sum, trade) => sum + (trade.profit || 0),
    0
  );
  
  const successRate = completedTrades.length > 0
    ? (completedTrades.filter(trade => (trade.profit || 0) > 0).length / completedTrades.length) * 100
    : 0;
  
  const avgGasUsed = completedTrades.length > 0
    ? completedTrades.reduce((sum, trade) => sum + (trade.gasUsed || 0), 0) / completedTrades.length
    : 0;

  // Generate chart data (last 10 trades)
  const chartData = completedTrades
    .slice(0, 10)
    .map((trade) => ({
      id: trade.id,
      profit: trade.profit || 0,
    }))
    .reverse();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard
        title="Total Profit"
        value={`$${totalProfit.toFixed(2)}`}
        trend={5.2}
        description="Last 24 hours"
      />
      <MetricCard
        title="Success Rate"
        value={`${successRate.toFixed(1)}%`}
        trend={-1.8}
        description="Last 24 hours"
      />
      <MetricCard
        title="Avg. Gas Used"
        value={`$${avgGasUsed.toFixed(2)}`}
        description="Per transaction"
      />
      
      <Card className="col-span-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Profit History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="id" hide />
                  <YAxis hide />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Profit']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground text-sm">
                  Not enough data to display chart
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const MetricCard = ({ title, value, trend, description }: MetricCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {trend !== undefined && (
            <div
              className={cn(
                "flex items-center text-xs",
                trend > 0 ? "text-green-500" : "text-red-500"
              )}
            >
              {trend > 0 ? (
                <ArrowUpIcon className="mr-1 h-3 w-3" />
              ) : (
                <ArrowDownIcon className="mr-1 h-3 w-3" />
              )}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};
