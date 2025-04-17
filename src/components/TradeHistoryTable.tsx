import { TradeExecution } from "@/types/arbitrage";
import { Badge } from "./ui/badge";
import { CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { cn } from "@/lib/utils";

interface TradeHistoryTableProps {
  trades: TradeExecution[];
  className?: string;
}

export const TradeHistoryTable = ({
  trades,
  className,
}: TradeHistoryTableProps) => {
  if (!trades.length) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No trade history available yet
      </div>
    );
  }

  // Sort trades by startTime (most recent first)
  const sortedTrades = [...trades].sort((a, b) => b.startTime - a.startTime);

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Status</TableHead>
            <TableHead>Token</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-right">Profit/Loss</TableHead>
            <TableHead className="text-right">Gas Used</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTrades.map((trade) => {
            const opportunity = trade.opportunityId.split("-")[1]; // Extract token from ID
            const timeAgo = getTimeAgo(trade.startTime);
            
            return (
              <TableRow key={trade.id}>
                <TableCell>
                  <StatusBadge status={trade.status} />
                </TableCell>
                <TableCell className="font-medium">{opportunity}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{timeAgo}</TableCell>
                <TableCell className="text-right font-medium">
                  {trade.profit !== undefined ? (
                    <span className={cn(
                      trade.profit > 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {trade.profit > 0 ? "+" : ""}${trade.profit.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {trade.gasUsed ? `$${trade.gasUsed.toFixed(2)}` : "--"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const StatusBadge = ({ status }: { status: TradeExecution["status"] }) => {
  switch (status) {
    case "completed":
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          <span className="text-xs">Done</span>
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          <span className="text-xs">Failed</span>
        </Badge>
      );
    case "executing":
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 flex items-center gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span className="text-xs">Exec</span>
        </Badge>
      );
    case "pending":
    default:
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span className="text-xs">Wait</span>
        </Badge>
      );
  }
};

const getTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};